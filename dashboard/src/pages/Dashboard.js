import React, { useEffect, useState } from "react";
import api from "../api";
import {
    TypingSpeedChart,
    ResponseTimeChart,
    VocabScoreChart,
    AnomalyChart,
} from "../components/Charts";
import RiskBadge from "../components/RiskBadge";
import AnomalyScore from "../components/AnomalyScore";

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user list on mount
    useEffect(() => {
        api
            .get("/users")
            .then(({ data }) => {
                setUsers(data);
                if (data.length > 0) setSelectedUser(data[0]._id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Fetch metrics whenever selected user changes
    useEffect(() => {
        if (!selectedUser) return;
        setLoading(true);
        api
            .get(`/metrics/${selectedUser}`)
            .then(({ data }) => setMetrics(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedUser]);

    const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;
    const currentUser = users.find((u) => u._id === selectedUser);

    /* ── Loading / empty states ────────────────────────── */
    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="card mx-auto mt-20 max-w-md text-center">
                <span className="text-5xl">🧪</span>
                <h2 className="mt-4 text-lg font-semibold">No Data Yet</h2>
                <p className="mt-2 text-sm text-gray-400">
                    Run the simulator (<code>node simulator/simulateData.js</code>) to
                    generate sample data and refresh this page.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Top Bar: user selector + risk badge ────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <label htmlFor="user-select" className="text-sm text-gray-400">
                        Patient
                    </label>
                    <select
                        id="user-select"
                        value={selectedUser || ""}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:ring-brand-500"
                    >
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.name} (age {u.age})
                            </option>
                        ))}
                    </select>
                </div>

                {latestMetric && <RiskBadge riskScore={latestMetric.riskScore} />}
            </div>

            {/* ── Stats cards ────────────────────────────────── */}
            {currentUser && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Baseline Typing" value={`${currentUser.baseline.typingSpeed.toFixed(1)} WPM`} />
                    <StatCard label="Baseline Response" value={`${currentUser.baseline.responseTime.toFixed(0)} ms`} />
                    <StatCard label="Baseline Vocab" value={currentUser.baseline.vocabScore.toFixed(1)} />
                    <StatCard label="Data Points" value={metrics.length} />
                </div>
            )}

            {/* ── Anomaly Score ring ─────────────────────────── */}
            {latestMetric && (
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <AnomalyScore score={latestMetric.anomalyScore} />
                    </div>
                    <div className="md:col-span-2">
                        <AnomalyChart metrics={metrics} />
                    </div>
                </div>
            )}

            {/* ── Main charts grid ───────────────────────────── */}
            {metrics.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <TypingSpeedChart metrics={metrics} />
                    <ResponseTimeChart metrics={metrics} />
                    <VocabScoreChart metrics={metrics} />
                </div>
            )}
        </div>
    );
}

/* ── Small stat card ──────────────────────────────────── */
function StatCard({ label, value }) {
    return (
        <div className="card flex flex-col items-center gap-1 py-4 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {label}
            </span>
            <span className="text-lg font-bold text-white">{value}</span>
        </div>
    );
}
