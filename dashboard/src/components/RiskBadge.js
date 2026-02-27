import React from "react";

const LEVELS = {
    low: {
        label: "Low Risk",
        color: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
        dot: "bg-emerald-400",
    },
    medium: {
        label: "Moderate Risk",
        color: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
        dot: "bg-amber-400",
    },
    high: {
        label: "High Risk",
        color: "bg-red-500/15 text-red-400 ring-red-500/30",
        dot: "bg-red-400",
    },
};

function getLevel(score) {
    if (score >= 0.55) return "high";
    if (score >= 0.3) return "medium";
    return "low";
}

export default function RiskBadge({ riskScore }) {
    const level = getLevel(riskScore);
    const { label, color, dot } = LEVELS[level];

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${color} transition-all duration-300`}
        >
            <span className={`h-2 w-2 rounded-full ${dot} animate-pulse`} />
            {label}
            <span className="ml-1 font-mono text-xs opacity-70">
                {(riskScore * 100).toFixed(1)}%
            </span>
        </span>
    );
}
