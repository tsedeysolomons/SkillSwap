const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const { mapUser, mapSkill } = require("../serialize");

const router = express.Router();

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

// Teacher is embedded as JSON so the app can render skill cards without a second round trip.
const SKILL_SELECT = `
  SELECT s.*, to_jsonb(u.*) - 'password_hash' AS teacher
  FROM skills s
  JOIN users u ON u.id = s.user_id
`;

// GET /api/skills - list, with optional ?q= search and ?category= filter
router.get("/", async (req, res) => {
  try {
    const { q, category } = req.query;
    const search = q ? `%${q}%` : null;

    const result = await db.query(
      `${SKILL_SELECT}
       WHERE ($1::text IS NULL OR s.category = $1)
         AND ($2::text IS NULL
              OR s.name ILIKE $2
              OR s.description ILIKE $2
              OR u.name ILIKE $2)
       ORDER BY s.created_at DESC`,
      [category || null, search],
    );

    res.json(result.rows.map(mapSkill));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/skills/mine - skills offered by the signed-in user
router.get("/mine", auth, async (req, res) => {
  try {
    const result = await db.query(
      `${SKILL_SELECT} WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
      [req.user.userId],
    );
    res.json(result.rows.map(mapSkill));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/skills/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(`${SKILL_SELECT} WHERE s.id = $1`, [
      req.params.id,
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.json(mapSkill(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/skills - create a skill offered by the signed-in user
router.post("/", auth, async (req, res) => {
  try {
    const { name, category, description, level, creditsPerHour } =
      req.body || {};

    if (!name || !category || creditsPerHour === undefined) {
      return res
        .status(400)
        .json({ message: "name, category and creditsPerHour are required" });
    }
    if (!VALID_LEVELS.includes(level)) {
      return res.status(400).json({ message: "Invalid level value" });
    }
    const rate = Number(creditsPerHour);
    if (!Number.isFinite(rate) || rate < 0) {
      return res.status(400).json({ message: "creditsPerHour must be >= 0" });
    }

    const created = await db.query(
      `INSERT INTO skills (user_id, name, category, description, level, credits_per_hour)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        req.user.userId,
        name,
        category,
        description || null,
        level,
        Math.round(rate),
      ],
    );

    const result = await db.query(
      `${SKILL_SELECT} WHERE s.id = $1`,
      [created.rows[0].id],
    );
    res.status(201).json(mapSkill(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/skills/:id - owner only
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, category, description, level, creditsPerHour } =
      req.body || {};

    if (level !== undefined && !VALID_LEVELS.includes(level)) {
      return res.status(400).json({ message: "Invalid level value" });
    }

    const existing = await db.query(
      "SELECT user_id FROM skills WHERE id = $1",
      [req.params.id],
    );
    if (!existing.rows.length) {
      return res.status(404).json({ message: "Skill not found" });
    }
    if (existing.rows[0].user_id !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own skills" });
    }

    await db.query(
      `UPDATE skills SET
         name             = COALESCE($1, name),
         category         = COALESCE($2, category),
         description      = COALESCE($3, description),
         level            = COALESCE($4, level),
         credits_per_hour = COALESCE($5, credits_per_hour)
       WHERE id = $6`,
      [
        name ?? null,
        category ?? null,
        description ?? null,
        level ?? null,
        creditsPerHour === undefined ? null : Math.round(Number(creditsPerHour)),
        req.params.id,
      ],
    );

    const result = await db.query(
      `${SKILL_SELECT} WHERE s.id = $1`,
      [req.params.id],
    );
    res.json(mapSkill(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/skills/:id - owner only
router.delete("/:id", auth, async (req, res) => {
  try {
    const existing = await db.query(
      "SELECT user_id FROM skills WHERE id = $1",
      [req.params.id],
    );
    if (!existing.rows.length) {
      return res.status(404).json({ message: "Skill not found" });
    }
    if (existing.rows[0].user_id !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own skills" });
    }

    await db.query("DELETE FROM skills WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
