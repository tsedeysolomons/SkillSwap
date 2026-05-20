require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const users = [
  {
    name: "Sarah",
    email: "sarah@example.com",
    password: "password",
    bio: "Teacher",
    location: "Remote",
  },
  {
    name: "Carlos",
    email: "carlos@example.com",
    password: "password",
    bio: "Learner",
    location: "Remote",
  },
  {
    name: "Yuki",
    email: "yuki@example.com",
    password: "password",
    bio: "Expert",
    location: "Remote",
  },
];

(async () => {
  try {
    for (const u of users) {
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [u.email],
      );
      if (existing.rows.length) {
        console.log("User exists, skipping:", u.email);
        continue;
      }

      const hash = await bcrypt.hash(u.password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, bio, location)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [u.name, u.email, hash, u.bio, u.location],
      );
      console.log("Created user", u.email, "id:", result.rows[0].id);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
