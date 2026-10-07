require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const skillRoutes = require("./routes/skills");
const sessionRoutes = require("./routes/sessions");
const transactionRoutes = require("./routes/transactions");
const notificationRoutes = require("./routes/notifications");

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

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", transactionRoutes);
app.use("/api/notifications", notificationRoutes);

// Unknown /api routes should answer with JSON, not Express's default HTML.
app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
