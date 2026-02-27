const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        typingSpeed: {
            type: Number,
            required: true,
        },
        responseTime: {
            type: Number,
            required: true,
        },
        vocabScore: {
            type: Number,
            required: true,
        },
        anomalyScore: {
            type: Number,
            default: 0,
        },
        riskScore: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Metric", metricSchema);
