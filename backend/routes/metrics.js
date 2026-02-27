const express = require("express");
const router = express.Router();
const Metric = require("../models/Metric");
const User = require("../models/User");
const { evaluateDrift, combineScores } = require("../services/driftEngine");
const mlService = require("../services/mlService");
const { sendAlert } = require("../services/mailService");

const RISK_THRESHOLD = 0.55; // Alert if tot risk >= 55 %


// POST /api/metrics — ingest a daily metric

router.post("/", async (req, res) => {
    try {
        const { userId, date, typingSpeed, responseTime, vocabScore } = req.body;

        // 1. Find user & baseline
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const baseline = user.baseline;

        // 2. Save initial metric
        const metric = await Metric.create({
            userId,
            date: date || Date.now(),
            typingSpeed,
            responseTime,
            vocabScore,
        });

        // 3. Call ML micro-service
        let mlResult = { anomalyScore: 0, zScore: 0 };
        try {
            mlResult = await mlService.analyze(
                { typingSpeed, responseTime, vocabScore },
                baseline
            );
        } catch (_) {
            /* fallback already handled inside mlService */
        }

        // 4. Rule-based drift evaluation
        const { ruleScore, flags } = evaluateDrift(
            { typingSpeed, responseTime, vocabScore },
            baseline
        );

        // 5. Combine scores
        const riskScore = combineScores(mlResult.anomalyScore, ruleScore);

        // 6. Update metric with scores
        metric.anomalyScore = mlResult.anomalyScore;
        metric.riskScore = riskScore;
        await metric.save();

        // 7. Send alert if threshold exceeded
        if (riskScore >= RISK_THRESHOLD && user.familyEmail) {
            sendAlert({
                to: user.familyEmail,
                userName: user.name,
                riskScore,
                flags,
            });
        }

        res.status(201).json({
            metric,
            analysis: {
                anomalyScore: mlResult.anomalyScore,
                zScore: mlResult.zScore,
                ruleScore,
                riskScore,
                flags,
                alertSent: riskScore >= RISK_THRESHOLD,
            },
        });
    } catch (err) {
        console.error("Metric ingestion error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// GET /api/metrics/:userId — fetch all metrics

router.get("/:userId", async (req, res) => {
    try {
        const metrics = await Metric.find({ userId: req.params.userId }).sort({
            date: 1,
        });
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
