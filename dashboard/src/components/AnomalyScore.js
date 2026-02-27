import React from "react";

export default function AnomalyScore({ score }) {
    // Map 0-1 to a colour hue (120 green → 0 red)
    const hue = Math.round((1 - Math.min(score, 1)) * 120);

    return (
        <div className="card flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-medium text-gray-400">Latest Anomaly Score</p>

            {/* Circular indicator */}
            <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                    background: `conic-gradient(hsl(${hue}, 80%, 55%) ${score * 360}deg, rgba(255,255,255,0.05) 0deg)`,
                }}
            >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-950">
                    <span
                        className="text-3xl font-bold"
                        style={{ color: `hsl(${hue}, 80%, 55%)` }}
                    >
                        {(score * 100).toFixed(0)}
                    </span>
                </div>
            </div>

            <p className="text-xs text-gray-500">
                {score < 0.3
                    ? "Within normal range"
                    : score < 0.55
                        ? "Moderate deviation detected"
                        : "Significant anomaly detected"}
            </p>
        </div>
    );
}
