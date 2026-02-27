import React from "react";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <div className="min-h-screen bg-gray-950">
            {/* ── Header ─────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🧠</span>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Neuro<span className="text-brand-400">Trace</span>{" "}
                            <span className="text-sm font-medium text-gray-500">AI</span>
                        </h1>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400 ring-1 ring-brand-500/30">
                        Research Demo
                    </span>
                </div>
            </header>

            {/* ── Main content ───────────────────────────────── */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                <Dashboard />
            </main>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
                NeuroTrace AI &copy; {new Date().getFullYear()} — Not medical software.
                Research demonstration only.
            </footer>
        </div>
    );
}

export default App;
