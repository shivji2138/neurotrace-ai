/**
 * driftEngine.js
 *
 * Rule-based cognitive drift scoring.
 * Compares daily metrics against the user's 7-day baseline and returns
 * a normalised risk score (0 – 1).
 */

/**
 * Evaluate rule-based drift between a daily metric and the user baseline.
 *
 * @param {{ typingSpeed: number, responseTime: number, vocabScore: number }} metric
 * @param {{ typingSpeed: number, responseTime: number, vocabScore: number }} baseline
 * @returns {{ ruleScore: number, flags: string[] }}
 */
function evaluateDrift(metric, baseline) {
    const flags = [];
    let ruleScore = 0;

    // --- Typing speed drop > 25 % -------------------------------------------
    if (baseline.typingSpeed > 0) {
        const typingDrop =
            (baseline.typingSpeed - metric.typingSpeed) / baseline.typingSpeed;
        if (typingDrop > 0.25) {
            flags.push(`Typing speed dropped ${(typingDrop * 100).toFixed(1)}%`);
            ruleScore += Math.min(typingDrop, 1); // cap contribution at 1
        }
    }

    // --- Response time increase > 40 % ---------------------------------------
    if (baseline.responseTime > 0) {
        const responseIncrease =
            (metric.responseTime - baseline.responseTime) / baseline.responseTime;
        if (responseIncrease > 0.4) {
            flags.push(
                `Response time increased ${(responseIncrease * 100).toFixed(1)}%`
            );
            ruleScore += Math.min(responseIncrease, 1);
        }
    }

    // --- Vocabulary score drop > 20 % ----------------------------------------
    if (baseline.vocabScore > 0) {
        const vocabDrop =
            (baseline.vocabScore - metric.vocabScore) / baseline.vocabScore;
        if (vocabDrop > 0.2) {
            flags.push(`Vocab score dropped ${(vocabDrop * 100).toFixed(1)}%`);
            ruleScore += Math.min(vocabDrop, 1);
        }
    }

    // Normalise to 0-1 range (max possible raw = 3)
    ruleScore = Math.min(ruleScore / 3, 1);

    return { ruleScore, flags };
}

/**
 * Combine ML anomaly score with rule-based score.
 *
 * @param {number} anomalyScore  – from ML service (0-1, higher = more anomalous)
 * @param {number} ruleScore     – from evaluateDrift  (0-1)
 * @returns {number}               combined risk (0-1)
 */
function combineScores(anomalyScore, ruleScore) {
    // Weighted average: 40 % ML + 60 % rule-based
    return 0.4 * anomalyScore + 0.6 * ruleScore;
}

module.exports = { evaluateDrift, combineScores };
