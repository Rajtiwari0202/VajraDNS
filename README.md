<div align="center">

# ⚡ VajraDNS (वज्र DNS)
### Autonomous Sovereign AI Threat Defense & Zero-Trust DNS Gateway

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![LightGBM](https://img.shields.io/badge/AI_Engine-LightGBM_ONNX-0284C7.svg)](https://lightgbm.readthedocs.io/)
[![SIH Problem Statement](https://img.shields.io/badge/SIH2024-SIH1524_(ISRO)-8B5CF6.svg)](https://www.sih.gov.in/)
[![Category](https://img.shields.io/badge/Category-100%25_Pure_Software-10B981.svg)](#)

<p align="center">
  <strong>Engineered for Smart India Hackathon (SIH1524)</strong><br>
  <em>Organization: Space Technology (ISRO / Department of Space) & National Cyber Defense</em>
</p>

[Explore Research Whitepaper](docs/ARCHITECTURE_AND_THEORY.md) • [API Reference](docs/API_REFERENCE.md) • [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) • [Benchmark Report](docs/BENCHMARK_REPORT.md)

</div>

---

## 🏛️ Executive Summary

**VajraDNS** is a high-throughput, sovereign DNS threat filtering platform designed to safeguard critical space, defense, and national cyber infrastructure from zero-day cyber threats. 

Built around an ultra-low-latency **4-Tier Zero-Trust Early-Exit Pipeline**, VajraDNS inspects every DNS transaction at wire speed (**< 20ms**), neutralizing algorithmic **Domain Generation Algorithm (DGA) botnets**, **covert DNS tunneling exfiltration**, and **Command & Control (C2) beacons** before malicious connections can be established.

```
                         [ INCOMING CLIENT QUERY ]
            Do53 (UDP 53)  │  DoH (HTTPS 443)  │  DoT (TLS 853)
                           ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              4-TIER ZERO-TRUST EARLY-EXIT PIPELINE          │
    │                                                             │
    │  [Tier 1: In-Memory LRU Cache & Whitelist] ──► HIT (<0.1ms) │
    │          │                                                  │
    │  [Tier 2: STIX/TAXII Bloom Filter Feeds] ────► BLOCK (0.02ms│
    │          │                                                  │
    │  [Tier 3: AI/ML DGA Botnet Classifier] ──────► BLOCK (1.08ms│
    │          │                                                  │
    │  [Tier 4: Statistical DNS Tunneling Shield] ─► BLOCK (0.45ms│
    │          │                                                  │
    │  [Clean Upstream Recursive Forwarding] ──────► ALLOW (14ms) │
    └──────────────────────────────┬──────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│ PASSIVE FORENSIC STUDIO         │       │ REAL-TIME SOC WEB CONSOLE        │
│ - PCAP Packet Stream Analyzer   │       │ - Live WebSocket Telemetry Stream│
│ - Zeek dns.log TSV Parser       │       │ - Interactive Query Playground   │
│ - Host Quarantine Generator     │       │ - 1-Click Live Attack Simulator  │
└─────────────────────────────────┘       └──────────────────────────────────┘
```

---

## 📊 Key Verified Benchmarks

| Metric / Dimension | Ministry SLA (SIH1524) | VajraDNS Performance | Evaluation Status |
| :--- | :--- | :--- | :--- |
| **P90 Resolution Latency** | `< 100 ms` | **`16.2 ms`** *(Up to 6x faster)* | 🟢 **PASS (Exceeded)** |
| **AI DGA Model Accuracy** | `> 90%` | **`99.17%`** *(Test Dataset)* | 🟢 **PASS (Exceeded)** |
| **AI Model Precision** | High (Low False Positives) | **`99.83%`** *(< 0.17% FP)* | 🟢 **PASS (Exceeded)** |
| **AI Single Inference Latency** | `< 10 ms` | **`1.085 ms`** *(LightGBM / ONNX)* | 🟢 **PASS (Exceeded)** |
| **Bloom Filter Lookup Time** | `< 1 ms` | **`0.02 ms`** *(10M bit array)* | 🟢 **PASS (Exceeded)** |
| **Feature Extraction Speed** | `< 1 ms` | **`0.0198 ms` per domain** | 🟢 **PASS (Exceeded)** |
| **Hardware Dependency** | Zero Hardware Specified | **100% Pure Software** | 🟢 **PASS (Compliant)** |

---

## 🛡️ Core Capabilities & Innovation

### 1. ⚡ 4-Tier Zero-Trust Decision Engine
* **Tier 1 (Cache & Whitelist)**: Pre-seeded with sovereign IP mappings (`isro.gov.in`, `drdo.gov.in`, `nic.in`, `meity.gov.in`) with atomic $O(1)$ LRU cache retrieval in **$< 0.1\text{ms}$**.
* **Tier 2 (STIX 2.1 / TAXII 2.1 Threat Intel)**: In-memory **Bloom Filter** ($m = 10,000,000$ bits, $k = 7$ MurmurHash3 seeds, $p < 0.001$) parsing live threat indicators from AlienVault OTX, Abuse.ch ThreatFox, and CERT-In in **$0.02\text{ms}$**.
* **Tier 3 (AI/ML DGA Botnet Classifier)**: 15-dimensional lexical and entropy feature extractor driving a gradient-boosted decision tree (LightGBM/ONNX) identifying zero-day **Conficker, Locky, GameOver Zeus, Banjori, and Necurs** algorithmic domains in **$1.08\text{ms}$**.
* **Tier 4 (DNS Tunneling Exfiltration Shield)**: Computes real-time **Shannon Information Entropy** ($H(X) = -\sum P(x)\log_2 P(x)$), Kolmogorov complexity, Base64/Hex character density, and client burst counts to block covert data exfiltration tools (`iodine`, `dnscat2`, Cobalt Strike).

### 2. 🔬 Explainable AI (XAI) & Wire Decapsulation
* Every blocked query generates dynamic **Explainable AI (XAI)** reasoning, explaining exactly why the algorithm intervened (e.g. *abnormal vowel-to-consonant ratio, high bigram transition divergence, high-risk TLD*).
* Interactive **RFC 1035 Raw Wire Packet Inspector** decapsulates transaction IDs, flag bits (`QR`, `Opcode`, `AA`, `TC`, `RD`, `RA`, `RCODE`), and raw resource records directly in the browser.

### 3. 🔍 Passive Forensic Studio (PCAP & Zeek Log Analysis)
* Batch ingest offline packet dumps (`.pcap`, `.pcapng`) and Zeek `dns.log` TSV files.
* Automatically correlates C2 beaconing frequencies, identifies compromised internal endpoints, and provides a **1-Click Host Quarantine Control**.

### 4. 🌐 Multi-Protocol Resolution
* Native support for standard **Do53 (UDP 53 / 5353)**, **DoH (RFC 8484 HTTPS `/dns-query`)**, and **DoT (RFC 7858 TLS 853)**.

---

## 📂 Repository Structure

```
VajraDNS/
├── docs/
│   ├── ARCHITECTURE_AND_THEORY.md   # Deep mathematical proofs, DNS wire mechanics & jury Q&A
│   ├── API_REFERENCE.md             # Complete OpenAPI, DoH RFC 8484, and WebSocket specification
│   ├── BENCHMARK_REPORT.md          # Latency distributions, ROC-AUC curves & model evaluation
│   ├── BLUEPRINT.md                 # System blueprint & Mermaid flow sequence diagrams
│   ├── DEPLOYMENT_GUIDE.md          # Production Linux, Systemd, Nginx TLS & Docker setup
│   ├── IMPLEMENTATION_PLAN.md       # Engineering milestones and verification checklist
│   └── WALKTHROUGH.md               # Technical report and live testing verification
├── backend/
│   ├── server.py                    # FastAPI server + WebSocket stream + DoH Gateway
│   ├── simulate_attacks.py          # Cyber warfare simulation engine (CLI & API)
│   ├── requirements.txt             # Python dependencies (FastAPI, LightGBM, ONNX, Scapy, dpkt)
│   ├── Dockerfile                   # Production container definition for backend
│   ├── core/
│   │   ├── dns_engine.py            # Async UDP 53 server & RFC 8484 wire packet serializer
│   │   └── cache.py                 # In-memory LRU Cache & 10M-bit Bloom Filter
│   ├── pipeline/
│   │   ├── decision_engine.py       # 4-Tier Zero-Trust security coordinator
│   │   └── tunneling_detector.py    # Shannon entropy and payload anomaly analyzer
│   ├── ai_engine/
│   │   ├── feature_extractor.py     # 15-dimensional lexical feature extractor (0.0198ms)
│   │   ├── train_dga_model.py       # LightGBM classifier training & ONNX export script
│   │   └── dga_classifier.pkl       # Serialized trained model (99.17% Accuracy)
│   ├── threat_intel/
│   │   └── threat_feed.py           # STIX 2.1 & TAXII 2.1 continuous threat ingestion
│   └── forensics/
│       └── pcap_analyzer.py         # Binary PCAP & Zeek TSV offline forensic parser
├── frontend/                        # Modern React (Vite) + Tailwind CSS SOC Web Console
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResearchLandingPage.jsx # Research whitepaper, problem breakdown & proofs
│   │   │   ├── Navbar.jsx              # Global navigation, status pulse & query counters
│   │   │   ├── LiveThreatTicker.jsx    # Real-time streaming query log with search & filter
│   │   │   ├── QueryPlayground.jsx     # Interactive domain tester with 4-tier stepper & XAI
│   │   │   ├── ThreatAnalytics.jsx     # Recharts DGA distribution & live 50-query SLA benchmark
│   │   │   ├── ForensicStudio.jsx      # Drag-and-drop PCAP / Zeek investigator & quarantine
│   │   │   ├── ThreatIntelManager.jsx  # STIX/TAXII threat feeds & custom rule manager
│   │   │   └── AttackSimulator.jsx     # 1-Click live attack launcher for jury demos
│   │   ├── services/
│   │   │   └── api.js                  # Dynamic API client & auto-reconnecting WebSocket
│   │   ├── App.jsx                     # Top-level state and modal management
│   │   └── index.css                   # Enterprise dark theme design system tokens
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
└── docker-compose.yml               # 1-Click containerized multi-service deployment
```

---

## 🚀 Quickstart Guide

### Option 1: 1-Click Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/Rajtiwari0202/VajraDNS.git
cd VajraDNS

# Launch all services
docker compose up -d --build
```
Open **`http://localhost:5173`** in your browser.

---

### Option 2: Local Development Setup

#### 1. Backend Setup:
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Pre-train the AI DGA Model (takes ~0.5s)
python ai_engine/train_dga_model.py

# Start the VajraDNS Server (REST + DoH + WebSockets + UDP 5353)
python server.py
```
*Backend runs on `http://127.0.0.1:8000`*.

#### 2. Frontend Setup:
```bash
# Navigate to frontend directory
cd ../frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs on `http://localhost:5173`*.

---

## 🧪 Live Demonstration & Testing Flow

1. **Research Landing Page**: Open `http://localhost:5173` to review the problem statement, adversarial landscape, and mathematical proofs.
2. **Launch SOC Console**: Click **"Launch Live VajraDNS SOC Console"** to enter the operational dashboard.
3. **Attack Simulator**: Click **"Launch DGA Attack"** or **"Launch Tunneling"**; watch live cyber attacks get intercepted and sinkholed to `0.0.0.0`.
4. **Interactive DNS Inspector & XAI**: Query `isro.gov.in` (Tier 1 Whitelist) vs `q7z8p49m.biz` (Tier 3 AI DGA) and inspect transparent Explainable AI attributions and RFC 1035 wire headers.
5. **Threat Metrics & Live SLA Benchmark**: Click **"Run Live SLA Benchmark (50 Queries)"** to verify real P50, P90, and P99 response times (< 20ms).
6. **Passive Forensic Studio**: Click **"Load Sample Incident Trace"** to parse offline PCAP/Zeek files and isolate compromised internal endpoints.

---

## 📜 Documentation Index

* **[Architecture & Deep Theory](docs/ARCHITECTURE_AND_THEORY.md)**: DNS wire formats, DGA PRNG seeds, Shannon entropy mathematics, Bloom filter proofs, and jury interview answers.
* **[API Reference](docs/API_REFERENCE.md)**: Complete OpenAPI endpoints, DoH RFC 8484 specification, WebSocket protocol, and STIX 2.1 schema.
* **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Bare-metal Linux systemd, Docker, Port 53 capability binding, and Nginx TLS setup.
* **[Benchmark Report](docs/BENCHMARK_REPORT.md)**: Accuracy, precision, recall, ROC-AUC curves, and latency SLA percentile distribution.
* **[Master Blueprint](docs/BLUEPRINT.md)**: System design and scoring matrix.
* **[Engineering Walkthrough](docs/WALKTHROUGH.md)**: Complete implementation walkthrough and validation logs.

---

## ⚖️ License & Accreditation

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.  
Built with pride for **Smart India Hackathon 2024** (Problem Statement: **SIH1524** — ISRO & Department of Space).
