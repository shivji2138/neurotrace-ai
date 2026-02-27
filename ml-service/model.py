"""
model.py — Isolation Forest wrapper for anomaly detection.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_model")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_model.pkl")


class AnomalyModel:
    """Thin wrapper around sklearn IsolationForest."""

    def __init__(self):
        self.model: IsolationForest | None = None

    # ── Training ────────────────────────────────────────────
    def train(self, data: list[dict]) -> None:
        """
        Train on baseline data points.
        Each dict should have: typingSpeed, responseTime, vocabScore.
        """
        df = pd.DataFrame(data)
        features = df[["typingSpeed", "responseTime", "vocabScore"]]

        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42,
        )
        self.model.fit(features)

        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)

    # ── Loading ─────────────────────────────────────────────
    def load(self) -> bool:
        """Load a previously saved model. Returns True on success."""
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            return True
        return False

    # ── Prediction ──────────────────────────────────────────
    def predict(self, metric: dict, baseline: dict) -> dict:
        """
        Return anomaly score (0-1) and z-score for a single data point.
        """
        sample = np.array(
            [[metric["typingSpeed"], metric["responseTime"], metric["vocabScore"]]]
        )

        # --- Anomaly score via Isolation Forest ---------------
        anomaly_score = 0.0
        if self.model is not None:
            raw = self.model.decision_function(sample)[0]
            # Lower decision_function value → more anomalous.
            # We invert and re-scale to 0-1 where 1 = max anomaly.
            anomaly_score = float(np.clip(1 - (raw + 0.5), 0, 1))
        else:
            # Fallback heuristic when no model is available
            anomaly_score = self._heuristic_anomaly(metric, baseline)

        # --- Z-score ------------------------------------------
        z_score = self._compute_z_score(metric, baseline)

        return {
            "anomalyScore": round(anomaly_score, 4),
            "zScore": round(z_score, 4),
        }

    # ── Helpers ──────────────────────────────────────────────
    @staticmethod
    def _compute_z_score(metric: dict, baseline: dict) -> float:
        """Simplified composite z-score across three features."""
        diffs = []
        for key in ("typingSpeed", "responseTime", "vocabScore"):
            b = baseline.get(key, 0)
            m = metric.get(key, 0)
            if b > 0:
                # For responseTime higher is worse, for the others lower is worse.
                if key == "responseTime":
                    diffs.append((m - b) / b)
                else:
                    diffs.append((b - m) / b)
        return float(np.mean(diffs)) if diffs else 0.0

    @staticmethod
    def _heuristic_anomaly(metric: dict, baseline: dict) -> float:
        """Simple heuristic when no trained model is available."""
        score = 0.0
        count = 0
        for key in ("typingSpeed", "responseTime", "vocabScore"):
            b = baseline.get(key, 0)
            m = metric.get(key, 0)
            if b > 0:
                if key == "responseTime":
                    score += max((m - b) / b, 0)
                else:
                    score += max((b - m) / b, 0)
                count += 1
        return float(np.clip(score / max(count, 1), 0, 1))
