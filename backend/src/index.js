require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// CORS: allow the frontend origin configured via FRONTEND_URL in production,
// but in development reflect the request origin so multiple local ports work.
const frontendUrl = process.env.FRONTEND_URL;
const corsOptions =
  process.env.NODE_ENV === "production"
    ? { origin: frontendUrl, credentials: true }
    : { origin: true, credentials: true };
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
