const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, bio, location, timezone, gender, role, ageRange } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate new required fields
    if (!gender || !role || !ageRange) {
      return res.status(400).json({ message: "Please provide gender, role, and age range" });
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    // Validate role
    const validRoles = ['teacher', 'student', 'both'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    // Validate age range
    const validAgeRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
    if (!validAgeRanges.includes(ageRange)) {
      return res.status(400).json({ message: "Invalid age range value" });
    }

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, bio, location, timezone, gender, role, age_range)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING id, name, email, location, timezone, gender, role, age_range, credits, joined_at`,
      [
        name,
        email,
        password_hash,
        bio || null,
        location || null,
        timezone || "UTC",
        gender,
        role,
        ageRange,
      ],
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const result = await db.query(
      "SELECT id, name, email, password_hash, location, credits FROM users WHERE email = $1",
      [email],
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // Remove password_hash before returning
    delete user.password_hash;

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
