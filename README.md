# 🧠 NeuroTrace AI

> **Cognitive Behavioral Drift Detection System**

NeuroTrace AI is a full-stack application that detects early signs of cognitive decline in patients by tracking three key indicators over time:

| Indicator | What it measures | Example |
|-----------|-----------------|---------|
| **Typing Speed** | How fast someone types (words per minute) | 75 WPM → 50 WPM over weeks |
| **Response Time** | How long it takes to respond to a prompt (milliseconds) | 1200ms → 2000ms over weeks |
| **Vocabulary Score** | Complexity of words used (scored 0-100) | 85 → 60 over weeks |

**How it helps:** If a family member (e.g. elderly parent) starts showing cognitive decline, the system will automatically detect it and send an email alert to a designated family contact — enabling early intervention.

⚠️ *This is a research-grade architecture demo — not medical software.*

---

## 📐 How the System Works (Big Picture)

```
┌────────────┐       ┌─────────────┐       ┌──────────────┐
│  React     │◄─────►│  Node.js    │◄─────►│  Python      │
│  Dashboard │  REST │  Backend    │  REST │  ML Service  │
│  :3000     │       │  :5000      │       │  :8000       │
└────────────┘       └──────┬──────┘       └──────────────┘
                            │
                     ┌──────▼──────┐
                     │  MongoDB    │
                     │  :27017     │
                     └─────────────┘
```

**Step-by-step flow:**

1. Patient data (typing speed, response time, vocab score) is collected daily.
2. Data is sent to the **Backend** (Node.js), which saves it to **MongoDB**.
3. The Backend calls the **ML Service** (Python) to run anomaly detection.
4. The ML Service runs two algorithms:
   - **Isolation Forest** — a machine learning model that finds unusual patterns
   - **Z-Score** — a statistical measure of how far a value is from normal
5. The Backend also runs its own **rule-based checks** (e.g., "did typing speed drop by more than 25%?").
6. Both scores are combined into a final **risk score**.
7. If risk is too high → an **email alert** is sent to the family.
8. The **React Dashboard** shows all of this visually with charts and badges.

---

## 📁 Project Structure

```
NeuroTrace/
├── backend/           ← Node.js API server
├── ml-service/        ← Python ML microservice
├── dashboard/         ← React frontend
├── simulator/         ← generates fake patient data for testing
└── README.md
```

---

# 🔧 BACKEND — Detailed Function Guide

The backend is the brain of the system. It handles data storage, talks to the ML service, runs rule-based checks, and sends email alerts.

## `backend/config/db.js` — Database Connection

### `connectDB()`
```js
const connectDB = async () => { ... }
```
- **What it does:** Connects to MongoDB using the connection string from `.env`.
- **Why it's needed:** Without this, the app can't store or retrieve any data.
- **How it works:** Uses `mongoose.connect()` which returns a promise. If it fails, the app exits with an error code.

---

## `backend/models/User.js` — User Data Shape

This file defines **what a user looks like** in the database (called a "schema" in MongoDB).

**Fields:**
| Field | Type | Purpose |
|-------|------|---------|
| `name` | String | Patient's name |
| `age` | Number | Patient's age |
| `familyEmail` | String | Email address to send alerts to |
| `baseline.typingSpeed` | Number | Normal typing speed (established in first 7 days) |
| `baseline.responseTime` | Number | Normal response time |
| `baseline.vocabScore` | Number | Normal vocabulary score |

**Think of it as:** A template. Every user in the database will have exactly these fields.

---

## `backend/models/Metric.js` — Daily Measurement Shape

Each day, one "metric" record is saved per patient.

**Fields:**
| Field | Type | Purpose |
|-------|------|---------|
| `userId` | ObjectId | Links this metric to a specific user |
| `date` | Date | When this measurement was taken |
| `typingSpeed` | Number | Typing speed that day |
| `responseTime` | Number | Response time that day |
| `vocabScore` | Number | Vocabulary score that day |
| `anomalyScore` | Number | How "abnormal" this day was (0 = normal, 1 = very abnormal) |
| `riskScore` | Number | Final risk level combining ML + rules (0 to 1) |

---

## `backend/services/driftEngine.js` — Rule-Based Drift Detection

This is a simple "if-then" checker — no machine learning, just common-sense rules.

### `evaluateDrift(metric, baseline)`
```js
function evaluateDrift(metric, baseline) { ... }
```
- **Input:** Today's metric + the patient's normal baseline.
- **What it does:** Checks three rules:

| Rule | Threshold | Example |
|------|-----------|---------|
| Typing speed dropped? | > 25% drop | Baseline 75 → Today 50 = 33% drop ⚠️ |
| Response time increased? | > 40% increase | Baseline 1200 → Today 1800 = 50% increase ⚠️ |
| Vocabulary score dropped? | > 20% drop | Baseline 85 → Today 65 = 23% drop ⚠️ |

- **Output:** `{ ruleScore, flags }`
  - `ruleScore` — a number between 0 and 1 (higher = worse)
  - `flags` — array of human-readable warning strings like `"Typing speed dropped 33.3%"`

### `combineScores(anomalyScore, ruleScore)`
```js
function combineScores(anomalyScore, ruleScore) { ... }
```
- **What it does:** Merges the ML anomaly score and the rule-based score into one final risk number.
- **Formula:** `0.4 × ML score + 0.6 × rule score`
- **Why 40/60?** We trust the rule-based checks slightly more because they're transparent and predictable. The ML score catches patterns the rules might miss.

---

## `backend/services/mlService.js` — Talk to Python ML Server

### `analyze(metric, baseline)`
```js
async function analyze(metric, baseline) { ... }
```
- **What it does:** Sends today's metric + baseline to the Python ML microservice at `http://localhost:8000/analyze`.
- **Returns:** `{ anomalyScore, zScore }` from the ML model.
- **Fallback:** If the Python service is down, it returns `{ anomalyScore: 0, zScore: 0 }` so the app doesn't crash.

### `trainModel(dataPoints)`
```js
async function trainModel(dataPoints) { ... }
```
- **What it does:** Sends an array of baseline data points to `http://localhost:8000/train` so the ML model can learn what "normal" looks like.

---

## `backend/services/mailService.js` — Email Alerts

### `sendAlert({ to, userName, riskScore, flags })`
```js
async function sendAlert({ to, userName, riskScore, flags }) { ... }
```
- **What it does:** Sends a formatted HTML email to the family member when risk is too high.
- **How it works:** Uses `nodemailer` with Gmail SMTP. You need to set `EMAIL_USER` and `EMAIL_PASS` in `.env`.
- **Email contains:** The patient's name, their risk score as a percentage, and a list of specific flags (e.g., "Typing speed dropped 33%").

---

## `backend/routes/users.js` — User API Endpoints

### `POST /api/users`
- **What it does:** Creates a new patient in the database.
- **Input (JSON body):**
  ```json
  {
    "name": "Alice Johnson",
    "age": 72,
    "familyEmail": "family@example.com",
    "baseline": { "typingSpeed": 75, "responseTime": 1200, "vocabScore": 85 }
  }
  ```
- **Returns:** The created user object with an `_id`.

### `GET /api/users`
- **What it does:** Returns a list of all patients, newest first.

---

## `backend/routes/metrics.js` — Metric API Endpoints (Core Pipeline)

### `POST /api/metrics` — ⭐ The Main Pipeline

This is the most important endpoint. Here's what happens step-by-step when a new daily metric arrives:

```
Step 1: Find the user in the database
Step 2: Save the raw metric (typing speed, response time, vocab score)
Step 3: Call Python ML service → get anomalyScore + zScore
Step 4: Run rule-based drift checks → get ruleScore + flags
Step 5: Combine ML score + rule score → final riskScore
Step 6: Update the metric record with scores
Step 7: If riskScore ≥ 0.55 → send email alert
Step 8: Return everything to the caller
```

**Risk Threshold:** `0.55` (55%). If the combined risk score is 55% or higher, an alert email is sent.

### `GET /api/metrics/:userId`
- **What it does:** Returns all daily metrics for a specific patient, sorted by date (oldest first).
- **Used by:** The dashboard to draw charts.

---

## `backend/server.js` — App Entry Point

### What it does:
1. Loads environment variables from `.env` (using `dotenv`)
2. Creates an Express app
3. Adds middleware: `cors()` (allows dashboard to talk to backend) and `express.json()` (parses JSON bodies)
4. Registers routes: `/api/users` and `/api/metrics`
5. Adds a health check at `/` (returns `{ status: "ok" }`)
6. Connects to MongoDB, then starts listening on port 5000

---

# 🤖 ML SERVICE — Detailed Function Guide

The ML (Machine Learning) service is a separate Python server that runs anomaly detection using scikit-learn.

## `ml-service/model.py` — The Anomaly Detection Model

### Class: `AnomalyModel`

This is a wrapper around scikit-learn's **Isolation Forest** algorithm.

#### `train(data)`
```python
def train(self, data: list[dict]) -> None:
```
- **Input:** A list of baseline data points (e.g., 100 normal days).
- **What it does:**
  1. Converts the list into a pandas DataFrame.
  2. Extracts 3 features: typingSpeed, responseTime, vocabScore.
  3. Creates an Isolation Forest model with 100 trees.
  4. Fits (trains) the model on normal data so it learns what "normal" looks like.
  5. Saves the trained model to `saved_model/isolation_model.pkl` using `joblib`.

**What is Isolation Forest?**
Imagine throwing darts at a dart board. Normal data points cluster together (easy to group). Anomalous (unusual) data points are isolated — they sit far from the cluster. Isolation Forest finds these isolated points.

#### `load()`
```python
def load(self) -> bool:
```
- **What it does:** Loads a previously saved model from disk. Returns `True` if successful.
- **Why it's needed:** So we don't have to retrain the model every time the server restarts.

#### `predict(metric, baseline)`
```python
def predict(self, metric: dict, baseline: dict) -> dict:
```
- **Input:** One day's metric + the patient's baseline.
- **What it does:**
  1. Runs the Isolation Forest on the metric → gets a raw anomaly score.
  2. Converts the raw score to a 0-1 scale (1 = very anomalous).
  3. Also computes a Z-score (see below).
- **Returns:** `{ "anomalyScore": 0.72, "zScore": 0.45 }`

#### `_compute_z_score(metric, baseline)` (static helper)
```python
def _compute_z_score(metric, baseline) -> float:
```
- **What is Z-score?** It measures "how many standard deviations away from normal is this value?"
  - Z-score of 0 → perfectly normal
  - Z-score of 1 → somewhat abnormal
  - Z-score of 2+ → very abnormal
- **How it works here:** For each of the 3 features, it calculates the percentage deviation from baseline, then averages them.

#### `_heuristic_anomaly(metric, baseline)` (static helper)
```python
def _heuristic_anomaly(metric, baseline) -> float:
```
- **What it does:** A simple fallback anomaly scorer used when no trained model is available.
- **How:** Calculates how much each metric has drifted from baseline, averages the drift, and clamps to 0-1.

---

## `ml-service/train.py` — Pre-Training Script

### `generate_baseline(n=100)`
```python
def generate_baseline(n: int = 100) -> list[dict]:
```
- **What it does:** Generates 100 fake "normal" data points using random numbers centered around typical values (75 WPM typing, 1200ms response, 85 vocab).
- **Uses:** `numpy.random.default_rng` for reproducible random numbers.

### `main()`
- Generates baseline data → trains the model → saves it to disk.
- **Run this once** before starting the ML service: `python train.py`

---

## `ml-service/main.py` — FastAPI Server

### `GET /` — Health Check
- Returns `{ "status": "ok", "service": "NeuroTrace ML Service" }`

### `POST /train` — Train the Model
```python
def train(req: TrainRequest):
```
- **Input:** `{ "data": [ { "typingSpeed": 75, "responseTime": 1200, "vocabScore": 85 }, ... ] }`
- **What it does:** Trains (or re-trains) the Isolation Forest model with the provided data.
- **Returns:** `{ "message": "Model trained successfully", "samplesUsed": 100 }`

### `POST /analyze` — Analyze a Metric
```python
def analyze(req: AnalyzeRequest):
```
- **Input:**
  ```json
  {
    "metric": { "typingSpeed": 50, "responseTime": 2000, "vocabScore": 60 },
    "baseline": { "typingSpeed": 75, "responseTime": 1200, "vocabScore": 85 }
  }
  ```
- **What it does:** Runs the trained Isolation Forest model on the metric and computes Z-score.
- **Returns:** `{ "anomalyScore": 0.72, "zScore": 0.45 }`

---

# 🖥️ FRONTEND (DASHBOARD) — Detailed Function Guide

The dashboard is a React app that visualizes patient data using Chart.js.

## `dashboard/src/api.js` — API Client

```js
const api = axios.create({ baseURL: "http://localhost:5000/api" });
```
- **What it does:** Creates a pre-configured HTTP client. Instead of writing `http://localhost:5000/api/users` every time, you just write `api.get("/users")`.

---

## `dashboard/src/App.js` — Root Component

### `App()`
- **What it renders:**
  1. A sticky header with the NeuroTrace AI logo and "Research Demo" badge.
  2. The `<Dashboard />` component (main content).
  3. A footer with a disclaimer.

---

## `dashboard/src/pages/Dashboard.js` — Main Page

### `Dashboard()`
The main component that ties everything together.

**State variables (using `useState`):**
| Variable | Purpose |
|----------|---------|
| `users` | List of all patients from the API |
| `selectedUser` | Currently selected patient ID |
| `metrics` | Daily metrics for the selected patient |
| `loading` | Whether data is being fetched |

**How it works:**
1. On page load → fetches all users from `GET /api/users`.
2. Auto-selects the first user.
3. When a user is selected → fetches their metrics from `GET /api/metrics/:userId`.
4. Renders:
   - A dropdown to switch between patients
   - Stat cards showing baseline values
   - An anomaly score ring
   - Four line charts (typing, response time, vocab, anomaly)
   - A risk badge (green/yellow/red)

### `StatCard({ label, value })` (helper component)
- A small card showing a label and value. Used for displaying baseline stats like "Baseline Typing: 75 WPM".

---

## `dashboard/src/components/Charts.js` — Line Charts

This file exports 4 chart components, all built with Chart.js:

### `TypingSpeedChart({ metrics })`
- Draws a **purple** line chart of typing speed over time.

### `ResponseTimeChart({ metrics })`
- Draws a **pink** line chart of response time over time.

### `VocabScoreChart({ metrics })`
- Draws a **green** line chart of vocabulary score over time.

### `AnomalyChart({ metrics })`
- Draws an **amber/yellow** line chart of anomaly score over time.

**Shared helpers:**

#### `buildOptions(title, yLabel)`
- Creates the Chart.js configuration: dark-mode colors, tooltips, axis labels, grid styling.

#### `gradient(ctx, color)`
- Creates a vertical gradient fill under the line (solid at top, transparent at bottom). Makes the charts look modern.

---

## `dashboard/src/components/RiskBadge.js` — Risk Level Badge

### `RiskBadge({ riskScore })`
- Shows a colored pill-shaped badge based on the latest risk score.

| Score Range | Label | Color |
|-------------|-------|-------|
| 0 – 0.29 | Low Risk | 🟢 Green |
| 0.30 – 0.54 | Moderate Risk | 🟡 Amber |
| 0.55 – 1.0 | High Risk | 🔴 Red |

#### `getLevel(score)` (helper)
- Simple if/else that maps a numeric score to `"low"`, `"medium"`, or `"high"`.

---

## `dashboard/src/components/AnomalyScore.js` — Circular Gauge

### `AnomalyScore({ score })`
- Displays the latest anomaly score as a **circular ring** (like a progress indicator).
- The ring fills proportionally to the score (0% = empty, 100% = full circle).
- Color changes from **green** (normal) to **red** (anomalous) using HSL color math.
- Below the ring, shows a text description: "Within normal range", "Moderate deviation", or "Significant anomaly".

---

# 🧪 SIMULATOR — Detailed Function Guide

## `simulator/simulateData.js` — Fake Data Generator

### `rand(mean, std)`
```js
function rand(mean, std) { ... }
```
- **What it does:** Generates a random number from a normal (bell-curve) distribution.
- **Algorithm:** Uses the Box-Muller transform — a math trick that converts two uniform random numbers into a normally distributed number.
- **Example:** `rand(75, 5)` → returns a number around 75, usually between 60-90.

### `sleep(ms)`
```js
function sleep(ms) { ... }
```
- **What it does:** Pauses execution for `ms` milliseconds. Prevents overwhelming the server with 90 requests instantly.

### `simulatePatient(patient, index)`
```js
async function simulatePatient(patient, index) { ... }
```
- **What it does:** Simulates 90 days of data for one patient.
- **Phase 1 (Days 1-7):** Baseline — stable values with small random noise.
- **Phase 2 (Days 8-90):** Drift — values gradually worsen based on the patient's `declineRate`.
- **The decay curve:** Uses `Math.pow(progress, 1.4)` — slow at first, then accelerating. Multiplied by `declineRate` to control severity.

### `main()`
- Loops through all 5 patients and calls `simulatePatient()` for each.

### The 5 Test Patients

| Patient | Decline Rate | What Happens |
|---------|-------------|--------------|
| Alice Johnson (72) | 85% | Severe decline — typing drops to ~40 WPM, response time doubles |
| Robert Chen (68) | 55% | Moderate decline — noticeable but less dramatic |
| Maria Garcia (75) | 35% | Mild decline — subtle changes |
| James Wilson (70) | 15% | Very mild — barely noticeable drift |
| Priya Sharma (66) | 0% | Stable — no decline at all (control patient) |

---

# 🚀 Setup & Run Instructions

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **MongoDB** running locally on port 27017

### Step 1: Backend
```bash
cd backend
cp .env.example .env        # edit .env if needed
npm install
node server.js              # → http://localhost:5000
```

### Step 2: ML Service
```bash
cd ml-service
pip install -r requirements.txt
python train.py             # trains the model (one-time)
uvicorn main:app --port 8000 --reload   # → http://localhost:8000
```

### Step 3: Dashboard
```bash
cd dashboard
npm install
npm start                   # → http://localhost:3000
```

### Step 4: Simulator
```bash
cd simulator
npm install axios            # one-time dependency
node simulateData.js         # generates data for 5 patients
```

After the simulator finishes, refresh the dashboard to see charts!

---

## ⚙️ Environment Variables (`backend/.env`)

| Variable | What it does | Default |
|----------|-------------|---------|
| `PORT` | Port the backend runs on | `5000` |
| `MONGO_URI` | MongoDB connection URL | `mongodb://127.0.0.1:27017/neurotrace` |
| `EMAIL_USER` | Gmail address for sending alerts | — |
| `EMAIL_PASS` | Gmail app password (not your regular password) | — |
| `ML_SERVICE_URL` | Where the Python ML service is running | `http://localhost:8000` |

---

## 📡 API Quick Reference

| Method | URL | What it does |
|--------|-----|-------------|
| `POST` | `/api/users` | Create a patient |
| `GET` | `/api/users` | List all patients |
| `POST` | `/api/metrics` | Submit a daily metric (triggers full pipeline) |
| `GET` | `/api/metrics/:userId` | Get all metrics for a patient |
| `POST` | `localhost:8000/train` | Train the ML model |
| `POST` | `localhost:8000/analyze` | Analyze one metric for anomalies |

---

## 📄 License

MIT — for educational & research purposes only.
