const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const { mapReview } = require("../serialize");

const router = express.Router();

const REVIEW_SELECT = `
  SELECT r.*,
         to_jsonb(rv.*) - 'password_hash' AS reviewer,
         to_jsonb(ee.*) - 'password_hash' AS reviewee
  FROM reviews r
  JOIN users rv ON rv.id = r.reviewer_id
  JOIN users ee ON ee.id = r.reviewee_id
`;

/**
 * GET /api/reviews
 * No filter  -> reviews you wrote or received
 * ?userId=   -> reviews written about that user
 * ?skillId=  -> reviews left on sessions of that skill
 * ?sessionId -> reviews attached to one session
 */
router.get("/", auth, async (req, res) => {
  try {
    const { userId, skillId, sessionId } = req.query;

    let sql = REVIEW_SELECT;
    const params = [];

    if (userId) {
      params.push(userId);
      sql += ` WHERE r.reviewee_id = $${params.length}`;
    } else if (skillId) {
      params.push(skillId);
      sql += ` WHERE r.session_id IN (SELECT id FROM sessions WHERE skill_id = $${params.length})`;
    } else if (sessionId) {
      params.push(sessionId);
      sql += ` WHERE r.session_id = $${params.length}`;
    } else {
      params.push(req.user.userId);
      sql += ` WHERE r.reviewer_id = $${params.length} OR r.reviewee_id = $${params.length}`;
    }

    sql += " ORDER BY r.created_at DESC";

    const result = await db.query(sql, params);
    res.json(result.rows.map(mapReview));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/reviews - review the other party of a completed session
router.post("/", auth, async (req, res) => {
  const { sessionId, rating, comment } = req.body || {};
  const score = Number(rating);

  if (!sessionId || !Number.isInteger(score) || score < 1 || score > 5) {
    return res
      .status(400)
      .json({ message: "sessionId and a rating between 1 and 5 are required" });
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const sessionRes = await client.query(
      `SELECT s.*, sk.name AS skill_name
       FROM sessions s JOIN skills sk ON sk.id = s.skill_id
       WHERE s.id = $1`,
      [sessionId],
    );
    if (!sessionRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Session not found" });
    }
    const session = sessionRes.rows[0];

    const isTeacher = session.teacher_id === req.user.userId;
    const isLearner = session.learner_id === req.user.userId;
    if (!isTeacher && !isLearner) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Not your session" });
    }
    if (session.status !== "completed") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "You can only review a completed session" });
    }

    const revieweeId = isTeacher ? session.learner_id : session.teacher_id;

    const dupe = await client.query(
      "SELECT id FROM reviews WHERE session_id = $1 AND reviewer_id = $2",
      [sessionId, req.user.userId],
    );
    if (dupe.rows.length) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "You already reviewed this session" });
    }

    const inserted = await client.query(
      `INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [sessionId, req.user.userId, revieweeId, score, comment || null],
    );

    // Keep the cached averages in sync with the new review.
    await client.query(
      `UPDATE users SET rating = COALESCE(
         (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE reviewee_id = $1), 0
       ) WHERE id = $1`,
      [revieweeId],
    );
    await client.query(
      `UPDATE skills SET rating = COALESCE(
         (SELECT AVG(r.rating)::numeric(3,2)
          FROM reviews r JOIN sessions s ON s.id = r.session_id
          WHERE s.skill_id = $1), 0
       ) WHERE id = $1`,
      [session.skill_id],
    );

    await client.query(
      `INSERT INTO notifications (user_id, title, message, type, action_url)
       VALUES ($1,$2,$3,'review',$4)`,
      [
        revieweeId,
        "You received a review",
        `Someone rated your "${session.skill_name}" session ${score}/5.`,
        `/session/${sessionId}`,
      ],
    );

    await client.query("COMMIT");

    const result = await db.query(`${REVIEW_SELECT} WHERE r.id = $1`, [
      inserted.rows[0].id,
    ]);
    res.status(201).json(mapReview(result.rows[0]));
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
