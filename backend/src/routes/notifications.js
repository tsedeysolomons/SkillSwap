const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const { mapNotification } = require("../serialize");

const router = express.Router();

// GET /api/notifications
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId],
    );
    res.json(result.rows.map(mapNotification));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE notifications SET read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(mapNotification(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
