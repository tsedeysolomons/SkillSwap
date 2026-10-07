const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const { mapUser, mapSkill } = require("../serialize");

const router = express.Router();

const USER_COLUMNS = `
  id, name, email, avatar_url, bio, location, timezone, gender, role, age_range,
  credits, rating, total_sessions, languages, joined_at
`;

const VALID_GENDERS = ["male", "female", "other", "prefer-not-to-say"];
const VALID_ROLES = ["teacher", "student", "both"];
const VALID_AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];

// GET /api/users/me - full profile of the signed-in user, including skills offered
router.get("/me", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [req.user.userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = mapUser(result.rows[0]);
    const skills = await db.query(
      "SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId],
    );
    user.skillsOffered = skills.rows.map(mapSkill);

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/me - update the signed-in user's profile
router.put("/me", auth, async (req, res) => {
  try {
    const { name, bio, location, timezone, gender, role, ageRange, languages } =
      req.body || {};

    if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }
    if (ageRange !== undefined && !VALID_AGE_RANGES.includes(ageRange)) {
      return res.status(400).json({ message: "Invalid age range value" });
    }
    if (languages !== undefined && !Array.isArray(languages)) {
      return res.status(400).json({ message: "languages must be an array" });
    }

    const result = await db.query(
      `UPDATE users SET
         name        = COALESCE($1, name),
         bio         = COALESCE($2, bio),
         location    = COALESCE($3, location),
         timezone    = COALESCE($4, timezone),
         gender      = COALESCE($5, gender),
         role        = COALESCE($6, role),
         age_range   = COALESCE($7, age_range),
         languages   = COALESCE($8, languages),
         updated_at  = NOW()
       WHERE id = $9
       RETURNING ${USER_COLUMNS}`,
      [
        name ?? null,
        bio ?? null,
        location ?? null,
        timezone ?? null,
        gender ?? null,
        role ?? null,
        ageRange ?? null,
        languages ?? null,
        req.user.userId,
      ],
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = mapUser(result.rows[0]);
    const skills = await db.query(
      "SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId],
    );
    user.skillsOffered = skills.rows.map(mapSkill);

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/users/:id - public profile
router.get("/:id", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [req.params.id],
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = mapUser(result.rows[0]);
    const skills = await db.query(
      "SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC",
      [req.params.id],
    );
    user.skillsOffered = skills.rows.map(mapSkill);

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
