"""
train.py — Standalone script to pre-train the Isolation Forest model
with synthetic baseline data.

Usage:
    python train.py
"""

import numpy as np
from model import AnomalyModel


def generate_baseline(n: int = 100) -> list[dict]:
    """Generate n synthetic baseline data points."""
    rng = np.random.default_rng(42)
    return [
        {
            "typingSpeed": float(rng.normal(75, 5)),     # ~75 WPM
            "responseTime": float(rng.normal(1200, 150)),  # ~1200 ms
            "vocabScore": float(rng.normal(85, 4)),       # ~85/100
        }
        for _ in range(n)
    ]


def main():
    print("🧠 Generating synthetic baseline data …")
    data = generate_baseline()
    model = AnomalyModel()
    print("🏋️  Training Isolation Forest model …")
    model.train(data)
    print("✅ Model saved to saved_model/isolation_model.pkl")


if __name__ == "__main__":
    main()
