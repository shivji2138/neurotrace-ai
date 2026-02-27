require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/users");
const metricRoutes = require("./routes/metrics");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/metrics", metricRoutes);

// ── Health check ───────────────────────────────
app.get("/", (_req, res) =>
    res.json({ status: "ok", service: "NeuroTrace AI Backend" })
);

// ── Start ──────────────────────────────────────
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 NeuroTrace backend running on http://localhost:${PORT}`);
    });
});
