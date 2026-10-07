const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const { mapTransaction } = require("../serialize");

const router = express.Router();

// GET /api/transactions and GET /api/wallet - credit history for the signed-in user
router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId],
    );
    res.json(result.rows.map(mapTransaction));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/wallet/balance - current credit balance
router.get("/balance", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT credits FROM users WHERE id = $1",
      [req.user.userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ credits: Number(result.rows[0].credits ?? 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
