import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/* ── Shared chart options builder ──────────────────────── */
function buildOptions(title, yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                color: "#e2e8f0",
                font: { size: 14, weight: 600 },
                padding: { bottom: 16 },
            },
            tooltip: {
                backgroundColor: "#1e1b4b",
                borderColor: "#6366f1",
                borderWidth: 1,
                titleColor: "#e2e8f0",
                bodyColor: "#a5b4fc",
                cornerRadius: 8,
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: { color: "#64748b", maxRotation: 45, maxTicksLimit: 15 },
                grid: { color: "rgba(255,255,255,0.04)" },
            },
            y: {
                title: { display: true, text: yLabel, color: "#94a3b8" },
                ticks: { color: "#64748b" },
                grid: { color: "rgba(255,255,255,0.04)" },
            },
        },
    };
}

/* ── Gradient builder ──────────────────────────────────── */
function gradient(ctx, color) {
    const g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, color.replace("1)", "0.35)"));
    g.addColorStop(1, color.replace("1)", "0)"));
    return g;
}

/* ── Individual chart components ───────────────────────── */

export function TypingSpeedChart({ metrics }) {
    const labels = metrics.map((m) =>
        new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const data = {
        labels,
        datasets: [
            {
                label: "Typing Speed (WPM)",
                data: metrics.map((m) => m.typingSpeed),
                borderColor: "rgba(99,102,241,1)",
                backgroundColor: (context) => {
                    const { ctx } = context.chart;
                    return gradient(ctx, "rgba(99,102,241,1)");
                },
                fill: true,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
        ],
    };
    return (
        <div className="card h-72">
            <Line data={data} options={buildOptions("Typing Speed", "WPM")} />
        </div>
    );
}

export function ResponseTimeChart({ metrics }) {
    const labels = metrics.map((m) =>
        new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const data = {
        labels,
        datasets: [
            {
                label: "Response Time (ms)",
                data: metrics.map((m) => m.responseTime),
                borderColor: "rgba(244,114,182,1)",
                backgroundColor: (context) => {
                    const { ctx } = context.chart;
                    return gradient(ctx, "rgba(244,114,182,1)");
                },
                fill: true,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
        ],
    };
    return (
        <div className="card h-72">
            <Line data={data} options={buildOptions("Response Time", "ms")} />
        </div>
    );
}

export function VocabScoreChart({ metrics }) {
    const labels = metrics.map((m) =>
        new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const data = {
        labels,
        datasets: [
            {
                label: "Vocabulary Score",
                data: metrics.map((m) => m.vocabScore),
                borderColor: "rgba(52,211,153,1)",
                backgroundColor: (context) => {
                    const { ctx } = context.chart;
                    return gradient(ctx, "rgba(52,211,153,1)");
                },
                fill: true,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
        ],
    };
    return (
        <div className="card h-72">
            <Line data={data} options={buildOptions("Vocabulary Score", "Score")} />
        </div>
    );
}

export function AnomalyChart({ metrics }) {
    const labels = metrics.map((m) =>
        new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const data = {
        labels,
        datasets: [
            {
                label: "Anomaly Score",
                data: metrics.map((m) => m.anomalyScore),
                borderColor: "rgba(251,191,36,1)",
                backgroundColor: (context) => {
                    const { ctx } = context.chart;
                    return gradient(ctx, "rgba(251,191,36,1)");
                },
                fill: true,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
        ],
    };
    return (
        <div className="card h-72">
            <Line data={data} options={buildOptions("Anomaly Score", "Score (0-1)")} />
        </div>
    );
}
