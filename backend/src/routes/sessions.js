const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const { mapSession } = require("../serialize");

const router = express.Router();

const SESSION_SELECT = `
  SELECT se.*,
         to_jsonb(s.*)                    AS skill,
         to_jsonb(tu.*) - 'password_hash' AS teacher,
         to_jsonb(lu.*) - 'password_hash' AS learner,
         to_jsonb(su.*) - 'password_hash' AS skill_owner
  FROM sessions se
  JOIN skills s  ON s.id  = se.skill_id
  JOIN users  tu ON tu.id = se.teacher_id
  JOIN users  lu ON lu.id = se.learner_id
  JOIN users  su ON su.id = s.user_id
`;

// The skill's owner is joined separately; attach it before mapping.
function hydrate(row) {
  if (row && row.skill && row.skill_owner) row.skill.teacher = row.skill_owner;
  if (row) delete row.skill_owner;
  return mapSession(row);
}

async function fetchSession(id) {
  const result = await db.query(`${SESSION_SELECT} WHERE se.id = $1`, [id]);
  return result.rows.length ? hydrate(result.rows[0]) : null;
}

// GET /api/sessions - every session the signed-in user teaches or attends
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      `${SESSION_SELECT}
       WHERE se.teacher_id = $1 OR se.learner_id = $1
       ORDER BY se.scheduled_at DESC`,
      [req.user.userId],
    );
    res.json(result.rows.map(hydrate));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/sessions/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const session = await fetchSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const isParty =
      session.teacherId === req.user.userId ||
      session.learnerId === req.user.userId;
    if (!isParty) {
      return res.status(403).json({ message: "Not your session" });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sessions - book a session.
// Credits move inside a single DB transaction so a failure leaves no partial state.
router.post("/", auth, async (req, res) => {
  const { skillId, scheduledAt, duration, notes } = req.body || {};

  const parsedDuration = Number(duration);
  if (!skillId || !scheduledAt || !Number.isFinite(parsedDuration)) {
    return res
      .status(400)
      .json({ message: "skillId, scheduledAt and duration are required" });
  }
  if (parsedDuration <= 0) {
    return res.status(400).json({ message: "duration must be positive" });
  }
  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) {
    return res.status(400).json({ message: "scheduledAt is not a valid date" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const skillRes = await client.query(
      "SELECT * FROM skills WHERE id = $1",
      [skillId],
    );
    if (!skillRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Skill not found" });
    }
    const skill = skillRes.rows[0];
    const teacherId = skill.user_id;
    const learnerId = req.user.userId;

    if (teacherId === learnerId) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "You cannot book your own skill" });
    }

    const creditsAmount = Math.ceil(
      (parsedDuration / 60) * Number(skill.credits_per_hour),
    );

    // Lock the learner row so two concurrent bookings cannot both pass the balance check.
    const learnerRes = await client.query(
      "SELECT credits, name FROM users WHERE id = $1 FOR UPDATE",
      [learnerId],
    );
    if (!learnerRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Learner not found" });
    }
    if (Number(learnerRes.rows[0].credits) < creditsAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Insufficient credits: need ${creditsAmount}, have ${learnerRes.rows[0].credits}`,
      });
    }

    const inserted = await client.query(
      `INSERT INTO sessions
         (teacher_id, learner_id, skill_id, scheduled_at, duration, status, credits_amount, notes, meeting_link)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8)
       RETURNING id`,
      [
        teacherId,
        learnerId,
        skillId,
        when.toISOString(),
        Math.round(parsedDuration),
        creditsAmount,
        notes || null,
        `https://meet.skillswap.local/${skillId}`,
      ],
    );
    const sessionId = inserted.rows[0].id;

    // Credits leave the learner and land with the teacher.
    await client.query(
      "UPDATE users SET credits = credits - $1 WHERE id = $2",
      [creditsAmount, learnerId],
    );
    await client.query(
      "UPDATE users SET credits = credits + $1 WHERE id = $2",
      [creditsAmount, teacherId],
    );

    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description, session_id)
       VALUES ($1,'spent',$2,$3,$4)`,
      [learnerId, creditsAmount, `Session booked: ${skill.name}`, sessionId],
    );
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, description, session_id)
       VALUES ($1,'earned',$2,$3,$4)`,
      [teacherId, creditsAmount, `Session taught: ${skill.name}`, sessionId],
    );

    const learnerName = learnerRes.rows[0].name;
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, action_url)
       VALUES ($1,$2,$3,'session',$4)`,
      [
        teacherId,
        "New session request",
        `${learnerName} booked "${skill.name}" for ${Math.round(parsedDuration)} minutes.`,
        `/session/${sessionId}`,
      ],
    );

    await client.query("COMMIT");

    const session = await fetchSession(sessionId);
    res.status(201).json(session);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

// PUT /api/sessions/:id - update notes/link, or move status (confirm / complete / cancel)
router.put("/:id", auth, async (req, res) => {
  const { status, notes, meetingLink } = req.body || {};

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const current = await client.query(
      "SELECT * FROM sessions WHERE id = $1 FOR UPDATE",
      [req.params.id],
    );
    if (!current.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Session not found" });
    }
    const session = current.rows[0];

    const isTeacher = session.teacher_id === req.user.userId;
    const isLearner = session.learner_id === req.user.userId;
    if (!isTeacher && !isLearner) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Not your session" });
    }

    if (notes !== undefined || meetingLink !== undefined) {
      await client.query(
        `UPDATE sessions SET
           notes        = COALESCE($1, notes),
           meeting_link = COALESCE($2, meeting_link)
         WHERE id = $3`,
        [notes ?? null, meetingLink ?? null, session.id],
      );
    }

    if (status && status !== session.status) {
      if (session.status === "completed" || session.status === "cancelled") {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "This session is already closed" });
      }

      if (status === "cancelled") {
        // Return the credits to the learner and claw them back from the teacher.
        await client.query(
          "UPDATE users SET credits = credits + $1 WHERE id = $2",
          [session.credits_amount, session.learner_id],
        );
        await client.query(
          "UPDATE users SET credits = GREATEST(0, credits - $1) WHERE id = $2",
          [session.credits_amount, session.teacher_id],
        );
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description, session_id)
           VALUES ($1,'earned',$2,$3,$4)`,
          [
            session.learner_id,
            session.credits_amount,
            "Refund for cancelled session",
            session.id,
          ],
        );
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description, session_id)
           VALUES ($1,'spent',$2,$3,$4)`,
          [
            session.teacher_id,
            session.credits_amount,
            "Reversed payout for cancelled session",
            session.id,
          ],
        );
        await client.query(
          "UPDATE sessions SET status = 'cancelled' WHERE id = $1",
          [session.id],
        );
      } else if (status === "confirmed" || status === "completed") {
        if (!isTeacher) {
          await client.query("ROLLBACK");
          return res
            .status(403)
            .json({ message: "Only the teacher can confirm or complete" });
        }
        await client.query("UPDATE sessions SET status = $1 WHERE id = $2", [
          status,
          session.id,
        ]);

        if (status === "completed") {
          await client.query(
            "UPDATE users SET total_sessions = total_sessions + 1 WHERE id IN ($1,$2)",
            [session.teacher_id, session.learner_id],
          );
          await client.query(
            "UPDATE skills SET total_sessions = total_sessions + 1 WHERE id = $1",
            [session.skill_id],
          );
        }
      } else {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid status" });
      }
    }

    await client.query("COMMIT");
    const updated = await fetchSession(session.id);
    res.json(updated);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
