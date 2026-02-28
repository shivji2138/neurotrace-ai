# 🧠 NeuroTrace AI

### Cognitive Behavioral Drift Detection System

NeuroTrace AI is a full-stack research demo that detects early cognitive decline by monitoring behavioral drift over time.

It tracks three indicators:

| Indicator        | Example Drift   |
| ---------------- | --------------- |
| Typing Speed     | 75 WPM → 50 WPM |
| Response Time    | 1200ms → 2000ms |
| Vocabulary Score | 85 → 60         |

If abnormal decline is detected, the system automatically calculates a risk score and sends an email alert to a family contact.

> ⚠️ Research-grade architecture demo. Not medical software.


## 🏗️ Architecture

```
React Dashboard 
        ↓
Node.js Backend 
        ↓
Python ML Service
        ↓
MongoDB 
```

### Pipeline

1. Daily metrics collected
2. Stored in MongoDB
3. ML anomaly detection (Isolation Forest + Z-score)
4. Rule-based drift checks
5. Combined risk score
6. Email alert if risk ≥ 0.55
7. Visualized on dashboard

---

## 🧠 Core Technologies

* **Frontend:** React + Chart.js
* **Backend:** Node.js + Express + MongoDB
* **ML Service:** Python + FastAPI + scikit-learn
* **Detection Algorithms:**

  * Isolation Forest
  * Z-Score analysis
* **Alerts:** Nodemailer (SMTP)

---

## 📁 Project Structure

```
NeuroTrace/
├── backend/
├── ml-service/
├── dashboard/
├── simulator/
└── README.md
```

---

## 🚀 Setup

### 1️⃣ Backend

```bash
cd backend
npm install
node server.js
```

### 2️⃣ ML Service

```bash
cd ml-service
pip install -r requirements.txt
python train.py
uvicorn main:app --port 8000 --reload
```

### 3️⃣ Dashboard

```bash
cd dashboard
npm install
npm start
```

### 4️⃣ Simulator (Generate 90 Days Data)

```bash
cd simulator
npm install axios
node simulateData.js
```

---

## 📡 API Endpoints

| Method | Endpoint               | Purpose             |
| ------ | ---------------------- | ------------------- |
| POST   | `/api/users`           | Create patient      |
| GET    | `/api/users`           | List patients       |
| POST   | `/api/metrics`         | Submit daily metric |
| GET    | `/api/metrics/:userId` | Get patient metrics |
| POST   | `:8000/train`          | Train ML model      |
| POST   | `:8000/analyze`        | Analyze metric      |

---

## 🎯 Key Features

* Hybrid ML + Rule-based drift detection
* Real-time risk scoring
* Automated email alerts
* Multi-patient monitoring
* Dark-mode analytical dashboard
* 90-day cognitive drift simulator

---

## 📜 License

MIT — Educational & Research Use Only

---

