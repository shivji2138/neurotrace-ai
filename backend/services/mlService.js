const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Call the Python ML micro-service /analyze endpoint.
 *
 * @param {{ typingSpeed: number, responseTime: number, vocabScore: number }} metric
 * @param {{ typingSpeed: number, responseTime: number, vocabScore: number }} baseline
 * @returns {Promise<{ anomalyScore: number, zScore: number }>}
 */
async function analyze(metric, baseline) {
    try {
        const { data } = await axios.post(`${ML_URL}/analyze`, {
            metric: {
                typingSpeed: metric.typingSpeed,
                responseTime: metric.responseTime,
                vocabScore: metric.vocabScore,
            },
            baseline: {
                typingSpeed: baseline.typingSpeed,
                responseTime: baseline.responseTime,
                vocabScore: baseline.vocabScore,
            },
        });
        return {
            anomalyScore: data.anomalyScore ?? 0,
            zScore: data.zScore ?? 0,
        };
    } catch (err) {
        console.error("⚠️  ML service unavailable, using fallback scores:", err.message);
        return { anomalyScore: 0, zScore: 0 };
    }
}

/**
 * Send baseline data to the ML service for training.
 *
 * @param {Array<{ typingSpeed: number, responseTime: number, vocabScore: number }>} dataPoints
 */
async function trainModel(dataPoints) {
    try {
        await axios.post(`${ML_URL}/train`, { data: dataPoints });
        console.log("✅ ML model trained successfully");
    } catch (err) {
        console.error("⚠️  ML training failed:", err.message);
    }
}

module.exports = { analyze, trainModel };
