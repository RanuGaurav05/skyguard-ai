# 🛰️ SkyGuard AI

**Intelligent Anomaly Detection for Automatic Weather Stations**

> ⚡ Detect Faults. Validate Events. Trust the Data.

---

Weather stations fail quietly. A temperature sensor stuck at 31°C for three days, a transmission dropout that leaves a gap in the record, a pressure reading that physically cannot be correct — none of these raise an alarm on their own. They pass through as plausible numbers.

SkyGuard AI is a multi-layer anomaly detection system built to catch exactly these cases. It sits between raw AWS sensor data and any downstream weather system, and it asks one question before passing an observation forward: **is this reading unusual because the weather is unusual, or because the data itself is unreliable?**

---

## Table of Contents

- [ Problem Statement](#-problem-statement)
- [ Why This Matters](#️-why-this-matters)
- [ Anomaly Categories](#-anomaly-categories)
- [ System Architecture](#️-system-architecture)
- [ Detection Pipeline](#-detection-pipeline)
- [ Machine Learning Approach](#-machine-learning-approach)
- [ Dataset](#-dataset)
- [ Synthetic Anomaly Generation](#-synthetic-anomaly-generation)
- [ Dataset Validation](#-dataset-validation)
- [ Baseline Model](#-baseline-model)
- [ Physics Rule Engine](#️-physics-rule-engine)
- [ Temporal Detection — LSTM Autoencoder](#-temporal-detection--lstm-autoencoder)
- [ Stuck-At Check](#-stuck-at-check)
- [ Spatial Analysis](#️-spatial-analysis)
- [ Fusion and Final Decision](#-fusion-and-final-decision)
- [ Explainability](#-explainability)
- [ Technology Stack](#️-technology-stack)
- [ Repository Structure](#-repository-structure)
- [ Getting Started](#-getting-started)
- [ Current Status](#-current-status)
- [ Roadmap](#️-roadmap)
- [ Team](#-team)

---

## 🎯 Problem Statement

Automatic Weather Stations collect continuous observations — temperature, humidity, pressure, wind speed, rainfall — that feed into forecasting systems, disaster alerts, and climate records. When those observations are wrong, everything downstream is wrong too.

The problem is not simply detecting that a value looks unusual. A threshold check can do that. The harder question is understanding *why* it is unusual:

```
Unusual observation
        │
        ├── Sensor malfunction (sudden spike or drop)
        ├── Sensor drift or gradual calibration decay
        ├── Stuck sensor (repeated identical values)
        ├── Transmission failure or missing record
        └── Genuine extreme weather event
```

These causes require different responses. A stuck sensor should be flagged for maintenance. A genuine event should be preserved and passed forward. A system that cannot tell the difference is not useful.

The SIH problem statement narrows the core input to three sensor parameters: **Temperature (°C), Atmospheric Pressure (hPa), and Relative Humidity (%)**. It also asks for real-time detection, explainable reasoning behind each alert, confidence scores, and a system that scales across a large station network.

---

##  Why This Matters

In May 2024, an AWS station in Mungeshpur, Delhi recorded a temperature of 52.9°C. The India Meteorological Department investigated and attributed the reading to a sensor error — the station was located near a tarmac surface, and the observation did not match readings from nearby stations.

This is exactly the scenario SkyGuard AI is built for. A single station reporting an implausible value while surrounding stations show normal readings. Without spatial and temporal context, there is no way to know whether the observation reflects a genuine heatwave or a faulty sensor. SkyGuard AI builds that context systematically.

---

##  Anomaly Categories

The system uses six anomaly types grouped into three categories:

| Category | Type | What it represents |
|---|---|---|
| `SENSOR_FAULT` | SUDDEN_SPIKE | One-day abrupt jump or drop — classic sensor glitch |
| `SENSOR_FAULT` | STUCK_AT | Sensor freezes and repeats the same value for several days |
| `SENSOR_FAULT` | GRADUAL_DRIFT | Slow calibration decay over 6–12 days |
| `TRANSMISSION_GLITCH` | MISSING_RECORD | Communication failure — no data arrives at all |
| `GENUINE_EVENT` | REGIONAL_HEAT_EVENT | A real heatwave — the whole region moves together |
| `GENUINE_EVENT` | REGIONAL_PRESSURE_DROP | A real low-pressure weather system passing through |

The distinction between `SENSOR_FAULT` and `GENUINE_EVENT` is the central challenge the system is built to address.

---

##  System Architecture

```
┌─────────────────────────┐
│      AWS Sensors        │
│  Temperature · Pressure │
│  Humidity · Wind · Rain │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     Data Ingestion      │
│     MQTT / HTTP         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     Preprocessing       │
│  Cleaning · Formatting  │
│  Missing Value Handling │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│         AI ANOMALY DETECTION ENGINE         │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  Physics Rule Engine                │   │
│   │  Range · Consistency · Step-change  │   │
│   └───────────────┬─────────────────────┘   │
│                   │                         │
│   ┌───────────────┼─────────────────────┐   │
│   │  LSTM Autoencoder   │  Stuck-At     │   │
│   │  7-day sequences    │  3-day std    │   │
│   └───────────────┼─────────────────────┘   │
│                   │                         │
│   ┌───────────────┴─────────────────────┐   │
│   │  Spatial Correlation Engine         │   │
│   │  Haversine distance · Elevation     │   │
│   └───────────────┬─────────────────────┘   │
│                   │                         │
│   ┌───────────────┴─────────────────────┐   │
│   │  Isolation Forest                   │   │
│   │  Multivariate statistical outlier   │   │
│   └───────────────┬─────────────────────┘   │
└───────────────────┼─────────────────────────┘
                    │
                    ▼
     ┌──────────────────────────┐
     │   Evidence Fusion Model  │
     │   Confidence Scoring     │
     └──────────────┬───────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Anomalous            Normal /
    + Category          Verified Data
          │                   │
     Dashboard            Weather Data
     & Alerts               Pipeline
```

**Division of work:** Shreyash and I are responsible for the entire AI/ML Anomaly Detection Core — Physics Rule Engine through the Fusion Layer. The data ingestion (MQTT), backend (Java/Spring Boot, TimescaleDB), and React dashboard are handled by our teammates.

---

##  Detection Pipeline

### 1. Data Ingestion

Raw observations arrive from AWS hardware via MQTT or HTTP. For development and evaluation, historical datasets are processed offline.

### 2. Preprocessing

Before any analysis runs, observations go through datetime conversion, chronological sorting, missing value handling, feature scaling, and per-station sequence construction for temporal analysis.

The original clean dataset is kept as a separate reference and is never modified.

### 3. Detection Layers

Each detection layer runs independently and contributes a signal to the fusion stage. No single layer makes the final call.

---

##  Machine Learning Approach

SkyGuard AI uses a layered strategy rather than a single model. Each layer addresses something the previous one cannot:

```
Baseline MLP
    ↓  Adds temporal context
LSTM Autoencoder + Stuck-At Check
    ↓  Adds spatial context
Spatial Correlation Engine
    ↓  Adds domain constraints
Physics Rule Engine
    ↓  Combines all signals
Evidence Fusion
    ↓
Explainable Final Decision
```

All layers are designed to be independent signals that combine at the fusion stage — not a chain where one feeds the next.

---

##  Dataset

The project uses daily AWS weather observations from 14 stations across India, covering 2021 to early 2025. The cleaned base dataset contains approximately **20,888 rows** and 15 columns.

### Features

```
cluster          station_name     state
district         date_of_record   avg_temp
min_temp         max_temp         relative_humidity
wind_speed       air_pressure     rainfall
elevation        latitude         longitude
```

### Design decision: 10 features kept, 3 used for model training

The official problem statement specifies only temperature, pressure, and humidity as sensor inputs. Rather than stripping the dataset to just those three, all 10 numeric features are kept in the dataset — but anomaly injection and model training are restricted to `avg_temp`, `air_pressure`, and `relative_humidity`.

The remaining features are not inputs to the anomaly model, but they are essential context: coordinates are what the Spatial Correlation Engine uses to find nearby stations, and elevation explains why two stations can have very different normal pressure baselines. Keeping them means the dataset handed to backend and frontend never needs to change, and the ML side has everything it needs for every future step.

---

##  Synthetic Anomaly Generation

The base AWS dataset has no ground-truth labels for sensor failures. A synthetic anomaly injection pipeline was built to introduce controlled, labelled anomalies into a copy of the clean data, so there are labelled examples to train and evaluate against.

### Code structure

```
01_ml/03_src/02_anomaly/
├── sensor_faults.py        — SUDDEN_SPIKE, STUCK_AT, GRADUAL_DRIFT
├── transmission_faults.py  — MISSING_RECORD
├── genuine_events.py       — REGIONAL_HEAT_EVENT, REGIONAL_PRESSURE_DROP
└── injection.py            — orchestrator: loads data, runs every injector, saves output
```

### Dataset statistics (v6, seed 42, post-geography fix)

```
Total observations  : 20,832
Normal              : 19,539
Sensor Fault        :    816
Genuine Event       :    477
```

*MISSING_RECORD rows are removed from the dataset rather than labelled — they represent complete gaps in transmission.*

### Regional event grouping

Regional genuine events are only injected into stations that are genuinely geographically close. Two stations are treated as one region if they are within **150 km** of each other **and** within **400 m elevation** of each other. Distance alone is not sufficient — Shimla (1,546 m elevation) is 83 km from some Punjab plains stations, but the two have completely different normal pressure baselines and do not experience the same regional weather patterns. Under this rule, Bikaner, Car Nicobar, and Shimla are correctly excluded from ever receiving a genuine regional event in this 14-station network.

### Pressure drop magnitude calibration

The initial injection used pressure drops of –30 to –60 hPa. Before accepting this, the actual meteorological data on Indian monsoon depressions and western disturbances was checked: even a strong monsoon depression only drops surface pressure by about 2–8 hPa over a region. The injection was recalibrated to **–3 to –8 hPa**, grounded in that real-world figure, and the reasoning is documented in the code itself.

---

##  Dataset Validation

The dataset went through five rounds of validation. Each round found and fixed a real problem.

**Round 1 — Physics consistency and realistic ranges**
Regional heat events were raising `avg_temp` without adjusting `min_temp` / `max_temp`, producing rows where average temperature exceeded the recorded maximum — physically impossible. Sudden-spike injections could push pressure to 1,601 hPa and humidity to 125%. Fixed by scaling all temperature fields together and adding per-feature clip bounds so injected faults are wrong but plausible.

**Round 2 — Rolling statistics were stale**
Rolling mean and std columns had been computed before anomaly injection, so they reflected clean pre-injection values rather than what a live pipeline would observe after corruption. Fixed by moving the rolling-stats computation to after all injections.

**Round 3 — Index corruption bug**
The missing-record injector was dropping rows and calling `reset_index()`, which silently reshuffled every row's position. Later injectors were still using row positions recorded before that reset, writing into the wrong rows and overwriting already-labelled sensor-fault events with genuine-event data. Fixed by removing the mid-pipeline reset and only resetting the index once, at the very end, after every injector has finished.

**Round 4 — Pressure magnitude calibration**
Described above under [Synthetic Anomaly Generation](#synthetic-anomaly-generation). The key principle: synthetic data is calibrated against real-world meteorological figures, not tuned to make a detector behave better.

**Round 5 — Geography fix**
Described below under [Spatial Analysis](#spatial-analysis). Fixing the regional event grouping required regenerating the full dataset and re-running every downstream check to confirm the numbers were still valid.

---

##  Baseline Model

A feed-forward neural network serves as the initial classification baseline — a reference point for evaluating the more context-aware approaches that follow.

### Architecture

```
Input — 10 features
    ↓
Dense(64, ReLU)
    ↓
Dense(32, ReLU)
    ↓
Dropout(0.20)
    ↓
Dense(4, Softmax)
```

### Preprocessing pipeline

```
Raw Features → Median Imputation → Standard Scaling → MLP Classifier
```

Class weighting is applied to partially address the imbalance between normal and anomalous observations.

### Evaluation

| Metric | Score |
|---|---|
| Accuracy | 0.9444 |
| Macro Precision | 0.3514 |
| Macro Recall | 0.4095 |
| Macro F1 | 0.3308 |

The accuracy looks reasonable at first glance, but a macro F1 of 0.33 tells a more honest story — the model performs well on the majority class and struggles with minority anomaly types. This is expected from a single-row classifier: a reading of 31°C gives no information about whether that value is unusual without knowing what the same station reported yesterday and the day before.

---

## ⚙️ Physics Rule Engine

The Physics Rule Engine is the first detection layer — deterministic, fast, and requiring no training. It runs before any ML inference and catches the cases that are "obviously wrong" cheaply, so the heavier layers only need to handle subtler patterns.

### Three types of checks

**Range check** — is the value within physically possible bounds? Two tiers: a hard limit (physically impossible) and a softer limit (unusual but not impossible, such as an extreme heatwave temperature).

**Consistency check** — does `min_temp ≤ avg_temp ≤ max_temp` hold for that row?

**Step-change check** — did the value jump further than physically realistic compared to the previous day at the same station?

The step-change check turned out to be critical. 51 out of 60 temperature spikes in the synthetic dataset land inside the normal observed range even after the spike — a range check alone would completely miss them. Only by checking the size of the jump in a single day can they be caught.

### Performance

| Anomaly Type | Recall |
|---|---|
| SUDDEN_SPIKE | 70.7% |
| GRADUAL_DRIFT | 63.8% |
| STUCK_AT | 3.0% |
| REGIONAL_HEAT_EVENT | 0.5% |
| REGIONAL_PRESSURE_DROP | 0.6% |

False positive rate on NORMAL rows: **0.77%** (pre-geography-fix dataset).
After dataset regeneration (v6): false positive rate **0.48%**, genuine events wrongly flagged **0.0–0.4%**.

The low recall on genuine events is intentional. A genuine weather event should not look like a physics violation — and the fact that it mostly doesn't is a sign the calibration is correct. The STUCK_AT weakness is architectural: a flat, unchanging sequence does not violate any range or step-change rule. That is addressed by a dedicated check.

The engine is implemented in `01_ml/03_src/03_physics/checks.py` and can be run standalone — it loads the dataset, evaluates every observation, saves output, and prints a recall and false-positive summary.

---

## 🕐 Temporal Detection — LSTM Autoencoder

Weather observations at a station form a time series. The LSTM Autoencoder learns what a station's normal behaviour looks like across 7-day sequences, and flags sequences where the reconstruction error is significantly higher than what it sees on normal data.

### Sequence preparation

Before building sequences, two realities of the data had to be handled:

- Short gaps in `air_pressure` (a few missing days here and there): interpolated linearly if the gap is 3 days or fewer. Longer gaps are left as missing rather than filled with fabricated data.
- Three separate windows where nearly all 14 stations went silent at once — likely shared data-collection failures rather than independent faults. These are treated as real discontinuities.

`sequence_prep.py` handles this by splitting each station's timeline into continuous chunks at any real calendar gap, and only building 7-day sliding windows within a single chunk. A sequence can never silently span a real discontinuity.

A bug found during testing: rows with missing data were being flagged but not excluded from the eligible timeline, so the next valid row after a gap was silently continuing into the same chunk. Fixed by excluding missing rows from the eligible timeline entirely, so both the row before and the row after a gap correctly see a break.

### Chronological split

Sequences are split by date, not randomly:

- **Training**: before 2023-11-17 — NORMAL sequences only
- **Validation**: 2023-11-17 to 2024-06-29 — NORMAL sequences only
- **Test**: after 2024-06-29 — all anomaly types

A random split would place near-identical neighbouring days on both sides, letting the model effectively see data it is supposed to be tested on. The anomaly threshold is set at the **99th percentile reconstruction error** on the validation set.

### How it works

```
7-day sequence (avg_temp · air_pressure · relative_humidity)
    ↓
LSTM Encoder → Latent representation
    ↓
LSTM Decoder → Reconstructed sequence
    ↓
Reconstruction error
    ↓
Compare against 99th percentile threshold
    ↓
Temporal anomaly signal
```

### Performance (350 epochs)

| Anomaly Type | Recall |
|---|---|
| SUDDEN_SPIKE | 77.9% |
| GRADUAL_DRIFT | 64.7% |
| REGIONAL_HEAT_EVENT | 23.3% |
| REGIONAL_PRESSURE_DROP | 21.6% |
| STUCK_AT | 3.0% |

False positive rate on NORMAL test rows: **0.1%**.

The low recall on genuine events is expected — the LSTM has no spatial context, so it partially treats a real regional event as a deviation from the station's learned pattern. That context comes from the Spatial Correlation Engine. The STUCK_AT weakness is architectural and is addressed separately.

---

##  Stuck-At Check

Neither the Physics Rule Engine nor the LSTM catches a frozen sensor reliably. A stuck-at sequence — the same value repeated for several days — does not violate any range rule, and an autoencoder can reconstruct it almost perfectly because it has already learned "tomorrow looks like today" as a general rule from normal data. A stuck sensor just follows that rule more perfectly than usual.

The fix is a dedicated, deterministic check using a **3-day rolling standard deviation** per station per feature. A 7-day window was tried first and failed: stuck-runs last 4–8 days, so a 7-day window usually only partially overlaps a real stuck period, mixing frozen and normal values and never looking flat enough to stand out. A 3-day window is far more likely to land entirely inside even a short stuck-run.

The threshold of **0.05** was chosen by checking the actual std distributions — normal readings sit comfortably above 0.1–0.3 in 3-day rolling std, while stuck sensors cluster right at 0.000.

### Performance

| Detector | STUCK_AT Recall |
|---|---|
| Physics Rule Engine | 3.0% |
| LSTM Autoencoder | 3.0% |
| 3-day rolling-std check | **67.1%** |

False positive rate on NORMAL rows: **0.59%**.

This is implemented as a standalone module (`stuck_at_check.py`) rather than folded into an existing file — it is meant to be consumed as one independent signal by the Isolation Forest and Fusion layers, not as a final verdict by itself.

---

##  Spatial Analysis

If a fault only affects one station, nearby stations will not show the same pattern. This spatial inconsistency is one of the strongest signals for distinguishing a sensor problem from a genuine weather event.

```
Station A (query)   →  42°C
Nearby Station B    →  31°C
Nearby Station C    →  31.4°C
Nearby Station D    →  30.8°C

→ Spatial inconsistency: SENSOR_FAULT signal
```

```
Station A           →  42°C
Nearby Station B    →  41.5°C
Nearby Station C    →  43°C
Nearby Station D    →  42.1°C

→ Spatial consistency: GENUINE_EVENT signal
```

### Geography fix (validation round 5)

While designing the Spatial Correlation Engine, "nearby" had to be defined precisely for the first time — which revealed a problem in how regional events had been injected months earlier.

The original injector grouped stations by their `cluster` label. One label — "Isolated Edge-Case" — contained both Bikaner and Car Nicobar, which are 1,740 km apart. The injector had been applying synchronized regional heatwaves and pressure drops to both simultaneously — something no real weather system could do.

Rewriting the grouping to use haversine distance (150 km cutoff) fixed the Bikaner/Car Nicobar problem but immediately surfaced a second issue: Shimla (1,546 m elevation) was being grouped with Punjab plains stations 83 km away at around 270–350 m. Horizontally close, but climatically very different. The final rule requires both conditions: **within 150 km and within 400 m elevation**. Under this rule, Bikaner, Car Nicobar, and Shimla are all correctly excluded from ever receiving a genuine regional event in this network.

Fixing the geography required regenerating the full dataset and re-running the Physics Engine, LSTM, and Stuck-At Check against the new data to confirm every number still held. Everything reproduced correctly — confirming that the layers genuinely are independent of each other.

The Spatial Correlation Engine reuses this same distance-and-elevation neighbor logic, applied in the opposite direction: instead of asking which stations should move together during injection, it asks whether a real incoming reading's neighbors showed the same pattern.

**Current status:** In development.

---

##  Fusion and Final Decision

No single detection layer is trusted to make the final classification. Each layer produces an independent signal, and the fusion model combines them:

```
Physics signal
    +
LSTM reconstruction error
    +
Stuck-At rolling-std signal
    +
Spatial consistency signal
    +
Isolation Forest (multivariate outlier)
    ↓
Fusion Model
    ↓
Final category  ·  Confidence score  ·  Contributing evidence
```

The output is designed to be interpretable — not just a label, but a breakdown of which signals contributed to the decision.

**Current status:** Planned.

---

## 💡 Explainability

The goal is to move from:

> `Anomaly Detected`

to:

> `This observation was flagged because the temperature increased by 18°C in a single step (step-change violation), and no nearby station recorded a similar change.`

Planned explainability signals:

- Which physics rule was violated and by how much
- LSTM reconstruction error relative to the threshold
- Spatial consistency score against neighbouring stations
- Feature-level SHAP contributions from the Isolation Forest

**Current status:** Planned. SHAP-based explainability is being explored as part of the research foundation.

---

##  Technology Stack

**Machine Learning**
- Python, TensorFlow / Keras, Scikit-learn
- NumPy, Pandas, Matplotlib, Seaborn

**Data Processing**
- Custom anomaly injection modules (`sensor_faults.py`, `transmission_faults.py`, `genuine_events.py`)
- `sequence_prep.py`, `stuck_at_check.py`

**Backend** *(teammates)*
- FastAPI, MQTT / Mosquitto, TimescaleDB

**Frontend** *(teammates)*
- React, dashboard-based monitoring

**Development**
- Git, GitHub, Jupyter Notebook, VS Code

---

## 📁 Repository Structure

```
Skyguard_AI/
│
├── 01_ml/
│   ├── 01_data/
│   │   ├── 01_raw/
│   │   ├── 02_processed/
│   │   └── 03_synthetic/
│   │
│   ├── 02_notebooks/
│   │   ├── 01_data_loading_validation.ipynb
│   │   ├── 02_eda.ipynb
│   │   ├── 03_anomaly_injection.ipynb
│   │   ├── 04_model_baseline.ipynb
│   │   └── 05_lstm_autoencoder.ipynb
│   │
│   ├── 03_src/
│   │   ├── 01_data/
│   │   ├── 02_anomaly/
│   │   │   ├── __init__.py
│   │   │   ├── sensor_faults.py
│   │   │   ├── transmission_faults.py
│   │   │   ├── genuine_events.py
│   │   │   └── injection.py
│   │   ├── 03_physics/
│   │   │   ├── __init__.py
│   │   │   └── checks.py
│   │   ├── 04_temporal/
│   │   │   ├── lstm_autoencoder.py
│   │   │   ├── sequence_prep.py
│   │   │   └── stuck_at_check.py
│   │   └── 05_spatial/
│   │
│   ├── 04_models/
│   │   ├── 01_baseline_model_01/
│   │   └── 02_LSTM_model_1/
│   │
│   └── 05_outputs/
│       └── plots/
│
├── 02_docs/
│   ├── project_notes/
│   └── research/
│
├── src/
│   └── application_components/
│
├── AWS_venv/
├── requirements.txt
├── .gitignore
└── README.md
```

---

##  Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sanchal-01/Skyguard_AI.git
cd Skyguard_AI
```

### 2. Create a virtual environment

**Windows**
```bash
python -m venv AWS_venv
AWS_venv\Scripts\activate
```

**macOS / Linux**
```bash
python3 -m venv AWS_venv
source AWS_venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Open the notebooks

```bash
jupyter notebook
```

Or open the repository in VS Code and use the Jupyter extension. Start with `01_data_loading_validation.ipynb` to verify the dataset, then follow the numbered sequence.

---

##  Current Status

### Completed

- Cleaned and validated AWS dataset (v6, 5 validation rounds)
- Synthetic anomaly injection pipeline — all six anomaly types
- Geography-aware regional event generation (haversine + elevation grouping)
- Pressure magnitude calibration against real IMD meteorological data
- Chronological train/validation/test splitting
- Baseline MLP classifier and preprocessing pipeline
- Physics Rule Engine (`checks.py`) — range, consistency, and step-change checks
- `sequence_prep.py` — gap-aware chunking, 7-day sliding window, NaN-safe
- LSTM Autoencoder — trained on NORMAL-only sequences, 350 epochs, threshold from 99th percentile validation error
- `stuck_at_check.py` — 3-day rolling std, 67.1% recall on STUCK_AT
- Model artifact saving and loading
- Evaluation plots and summaries

### In Progress

- Spatial Correlation Engine
- Isolation Forest integration

### Planned

- Evidence Fusion architecture
- Confidence scoring
- Explainable anomaly decisions (SHAP)
- Backend and real-time pipeline integration
- Monitoring dashboard

---

## 🗓️ Roadmap

```
Phase 1   Problem definition & scope                   ✓ Done
Phase 2   Dataset design (10 features, 3 model inputs) ✓ Done
Phase 3   Synthetic anomaly injection pipeline         ✓ Done
Phase 4   Dataset validation (5 rounds)                ✓ Done
Phase 5   Physics Rule Engine                          ✓ Done
Phase 6   LSTM Autoencoder + Stuck-At Check            ✓ Done
Phase 7   Spatial Correlation Engine                   ✓ Done
Phase 8   Isolation Forest                             ✓ Done
Phase 9   Evidence Fusion + Confidence Scoring         ⟳ In progress
Phase 10  Explainable Decisions (SHAP)                 ⟳ In progress
Phase 11  Real-Time Backend Integration                Planned
Phase 12  Monitoring Dashboard                         Planned
Phase 13  Human Feedback & Model Improvement           Planned
```

---

## 👥 Team

**SkyGuard AI — Smart India Hackathon**

| Name | Role |
|---|---|
| Sanchal Kumar | AI/ML Core |
| Shreyash Kumar Sah | AI/ML Core |
| Megha Kumari | Data Preparation & Cleaning |
| Shyam Narayan Pandey | Frontend/ Backend |
| Ranu Gaurav | Backend |
| Siya Naik | Backend |

---

*SkyGuard AI is being developed as part of Smart India Hackathon. Components listed as "In Progress" or "Planned" are not yet production-ready.*
