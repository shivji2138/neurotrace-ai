/**
 * simulateData.js
 *
 * Generates 90 days of cognitive metrics for 5 test patients,
 * each with a different decline profile so they end up with
 * different risk scores on the dashboard.
 *
 * Usage:
 *   node simulateData.js
 */

const axios = require("axios");

const API = "http://localhost:5000/api";

// ── Helpers ──────────────────────────────────────────────

function rand(mean, std) {
    const u1 = Math.random();
    const u2 = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ── Patient profiles ─────────────────────────────────────
// Each patient has different baseline values and decline rates.
// declineRate controls how aggressively metrics deteriorate (0 = stable, 1 = severe).

const PATIENTS = [
    {
        name: "Alice Johnson",
        age: 72,
        familyEmail: "family.alice@example.com",
        baseline: { typingSpeed: 75, responseTime: 1200, vocabScore: 85 },
        declineRate: 0.85, // Severe decline → HIGH risk
    },
    {
        name: "Robert Chen",
        age: 68,
        familyEmail: "family.robert@example.com",
        baseline: { typingSpeed: 80, responseTime: 1100, vocabScore: 90 },
        declineRate: 0.55, // Moderate decline → MODERATE-HIGH risk
    },
    {
        name: "Maria Garcia",
        age: 75,
        familyEmail: "family.maria@example.com",
        baseline: { typingSpeed: 65, responseTime: 1400, vocabScore: 78 },
        declineRate: 0.35, // Mild decline → MODERATE risk
    },
    {
        name: "James Wilson",
        age: 70,
        familyEmail: "family.james@example.com",
        baseline: { typingSpeed: 82, responseTime: 1050, vocabScore: 92 },
        declineRate: 0.15, // Very mild decline → LOW risk
    },
    {
        name: "Priya Sharma",
        age: 66,
        familyEmail: "family.priya@example.com",
        baseline: { typingSpeed: 88, responseTime: 950, vocabScore: 95 },
        declineRate: 0.0, // Stable / no decline → MINIMAL risk
    },
];

// ── Main ─────────────────────────────────────────────────

async function simulatePatient(patient, index) {
    const label = `[Patient ${index + 1}/${PATIENTS.length}] ${patient.name}`;
    console.log(`\n👤 Creating ${label} (decline rate: ${(patient.declineRate * 100).toFixed(0)}%) …`);

    const { data: user } = await axios.post(`${API}/users`, {
        name: patient.name,
        age: patient.age,
        familyEmail: patient.familyEmail,
        baseline: patient.baseline,
    });
    console.log(`   ID: ${user._id}`);

    const userId = user._id;
    const totalDays = 90;
    const { typingSpeed: baseTyping, responseTime: baseResponse, vocabScore: baseVocab } = patient.baseline;
    const dr = patient.declineRate;

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (totalDays - day));

        let typingSpeed, responseTime, vocabScore;

        if (day <= 7) {
            // ── Baseline phase: stable, small noise ──────────
            typingSpeed = rand(baseTyping, 3);
            responseTime = rand(baseResponse, 80);
            vocabScore = rand(baseVocab, 2);
        } else {
            // ── Drift phase: decline controlled by declineRate ──
            const progress = (day - 7) / (totalDays - 7);
            const decay = Math.pow(progress, 1.4) * dr;

            typingSpeed = rand(baseTyping * (1 - 0.45 * decay), 4);
            responseTime = rand(baseResponse * (1 + 0.7 * decay), 100);
            vocabScore = rand(baseVocab * (1 - 0.35 * decay), 3);
        }

        // Clamp to sensible ranges
        typingSpeed = Math.max(10, +typingSpeed.toFixed(1));
        responseTime = Math.max(200, +responseTime.toFixed(0));
        vocabScore = Math.max(10, Math.min(100, +vocabScore.toFixed(1)));

        try {
            const { data: result } = await axios.post(`${API}/metrics`, {
                userId,
                date: date.toISOString(),
                typingSpeed,
                responseTime,
                vocabScore,
            });

            const { analysis } = result;
            const risk = (analysis.riskScore * 100).toFixed(1);
            const anomaly = (analysis.anomalyScore * 100).toFixed(1);
            const alert = analysis.alertSent ? " 🚨 ALERT" : "";

            // Only log every 10th day + last day to keep output clean
            if (day % 10 === 0 || day === totalDays || day === 1) {
                console.log(
                    `  Day ${String(day).padStart(2)} | ` +
                    `Typing: ${String(typingSpeed).padStart(5)} | ` +
                    `Resp: ${String(responseTime).padStart(5)} | ` +
                    `Vocab: ${String(vocabScore).padStart(5)} | ` +
                    `Anomaly: ${anomaly.padStart(5)}% | ` +
                    `Risk: ${risk.padStart(5)}%${alert}`
                );
            }
        } catch (err) {
            console.error(`  Day ${day} — ERROR: ${err.message}`);
        }

        await sleep(30);
    }

    console.log(`   ✅ ${patient.name} — 90 days complete`);
}

async function main() {
    console.log("🧪 NeuroTrace AI — Multi-Patient Simulator");
    console.log("=".repeat(50));

    for (let i = 0; i < PATIENTS.length; i++) {
        await simulatePatient(PATIENTS[i], i);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ All patients simulated! Open http://localhost:3000");
    console.log("\nExpected risk levels:");
    console.log("  🔴 Alice Johnson   — High Risk       (severe decline)");
    console.log("  🟠 Robert Chen     — Moderate-High    (moderate decline)");
    console.log("  🟡 Maria Garcia    — Moderate Risk    (mild decline)");
    console.log("  🟢 James Wilson    — Low Risk         (very mild decline)");
    console.log("  🟢 Priya Sharma    — Minimal Risk     (stable)");
}

main().catch((err) => {
    console.error("Fatal error:", err.message);
    process.exit(1);
});
