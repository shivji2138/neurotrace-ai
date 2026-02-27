"""
main.py — FastAPI application for the NeuroTrace ML micro-service.

Endpoints:
    POST /train   — Train the Isolation Forest model with baseline data.
    POST /analyze — Analyse a single day's metric against the baseline.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import AnomalyModel

app = FastAPI(title="NeuroTrace ML Service", version="1.0.0")
model = AnomalyModel()

# Attempt to load a pre-trained model on startup
model.load()


# ── Request / Response schemas ──────────────────────────────

class MetricData(BaseModel):
    typingSpeed: float
    responseTime: float
    vocabScore: float


class AnalyzeRequest(BaseModel):
    metric: MetricData
    baseline: MetricData


class AnalyzeResponse(BaseModel):
    anomalyScore: float
    zScore: float


class TrainRequest(BaseModel):
    data: list[dict]


class TrainResponse(BaseModel):
    message: str
    samplesUsed: int


# ── Endpoints ───────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "NeuroTrace ML Service"}


@app.post("/train", response_model=TrainResponse)
def train(req: TrainRequest):
    """Train (or re-train) the Isolation Forest model."""
    if not req.data:
        raise HTTPException(status_code=400, detail="No training data provided")

    model.train(req.data)
    return TrainResponse(message="Model trained successfully", samplesUsed=len(req.data))


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """Analyse a single metric against the baseline."""
    result = model.predict(req.metric.model_dump(), req.baseline.model_dump())
    return AnalyzeResponse(**result)
