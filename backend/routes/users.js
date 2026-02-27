const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/users — create a new user
router.post("/", async (req, res) => {
    try {
        const { name, age, familyEmail, baseline } = req.body;

        const user = await User.create({
            name,
            age,
            familyEmail,
            baseline: baseline || { typingSpeed: 0, responseTime: 0, vocabScore: 0 },
        });

        res.status(201).json(user);
    } catch (err) {
        console.error("Create user error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/users — list all users
router.get("/", async (_req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
