# ⚡ VajraDNS — Autonomous AI-Powered DNS Defense & Threat Intelligence Platform

<div align="center">

![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)
![React](https://img.shields.io/badge/React-18-cyan.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-teal.svg)
![ONNX](https://img.shields.io/badge/ONNX_Runtime-Sub--2ms_Inference-orange.svg)
![SIH](https://img.shields.io/badge/SIH_2024-Problem_SIH1524-gold.svg)

**A Sovereign, High-Throughput Zero-Trust DNS Resolver with 4-Tier Real-Time Threat Mitigation, STIX/TAXII Threat Intelligence, AI DGA Botnet Detection, DNS Tunneling Anomaly Analysis, and Post-Incident Forensics.**

[Architecture & Theory](docs/ARCHITECTURE_AND_THEORY.md) • [Technical Blueprint](docs/BLUEPRINT.md) • [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

</div>

---

## 🎯 Problem Statement (SIH1524)
- **Ministry / Domain**: Space Technology (ISRO / Department of Space) / Cyber Defense
- **Objective**: Develop an enterprise-grade DNS Filtering Service that resolves legitimate queries in `<100ms`, blocks malicious domains, mitigates Botnet C2 communications generated via Domain Generation Algorithms (DGA), stops covert DNS Tunneling data exfiltration, integrates STIX/TAXII threat feeds, supports Do53/DoH/DoT protocols, and enables both active inline filtering and passive PCAP/Zeek forensic log analysis with a real-time SOC monitoring dashboard.

---

## 🚀 Key Features & Highlights

```
                          4-TIER EARLY-EXIT DECISION ENGINE
                               (Average Latency: <40ms)
                                          │
    ┌─────────────────┬───────────────────┼───────────────────┬─────────────────┐
    ▼                 ▼                   ▼                   ▼                 ▼
[ Tier 1: Cache ]  [ Tier 2: STIX/TAXII] [ Tier 3: AI DGA ]  [ Tier 4: Tunneling] [ Upstream DNS ]
 LRU + Whitelist    Bloom Filter Feed     ONNX Model (<2ms)   Shannon Entropy     1.1.1.1 / Root
   < 5ms Lookup       0.05ms Lookup       >99% Accuracy       Payload Anomaly     Clean Resolution
```

1. **Multi-Protocol Sovereign Ingestion**:
   - **Do53 (Standard UDP 53)**: High-throughput async UDP listener.
   - **DoH (DNS-over-HTTPS via RFC 8484)**: HTTP/2 JSON & wire-format endpoint on `/dns-query`.
   - **DoT (DNS-over-TLS via RFC 7858)**: Encrypted stream listener.
2. **Sub-2ms AI DGA Classifier**:
   - Compiles gradient-boosted decision trees and n-gram linguistic evaluators into **ONNX Runtime (C++ SIMD backend)**, analyzing 15+ lexical/statistical features in under 2ms.
3. **Statistical DNS Tunneling & Exfiltration Shield**:
   - Computes real-time Shannon entropy ($H(X)$), payload length distributions, and Base64/Hex encoding density to catch covert data theft tools (such as `iodine` and `dnscat2`).
4. **Automated STIX 2.1 & TAXII 2.1 Threat Intel Ingestion**:
   - Continuously synchronizes with global threat feeds (AlienVault OTX, Abuse.ch, CERT-In) without restarting the resolver.
5. **Dual-Mode Operation**:
   - **Active Gateway**: Inline DNS proxy with sinkholing (`0.0.0.0`) and live telemetry streaming.
   - **Passive Forensics**: Drag-and-drop `.pcap` capture & Zeek `dns.log` TSV analyzer for incident response.
6. **Military-Grade React SOC Web Console**:
   - Dark cyber defense theme with live WebSocket event stream, interactive query playground with Explainable AI (XAI) reasonings, threat metrics, and 1-click live attack simulation.

---

## 🏛️ System Architecture

```
+----------------------------------------------------------------------------------------------------+
|                                     CLIENTS & ENDPOINTS                                            |
|   (Laptops, Servers, Satellite Ground Terminals, IoT Devices, Cloud Services, Remote Workers)       |
+----------------------------------------------------------------------------------------------------+
                   | Do53 (UDP 53)           | DoH (HTTPS 443)         | DoT/DoTLS (TLS 853)
                   v                         v                         v
+----------------------------------------------------------------------------------------------------+
|                                 HIGH-PERFORMANCE DNS RESOLVER PROXY                                |
|  - Protocol Terminators: UDP Server / HTTPS FastAPI Server / TLS Listener                           |
|  - Query Parser & Validator (RFC 1035 / RFC 8484 / RFC 7858)                                      |
|  - Rate Limiting & DoS Shield (Token Bucket Algorithm)                                             |
+----------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                FOUR-TIER DECISION ENGINE (Sub-100ms)                               |
|                                                                                                    |
|  [TIER 1: In-Memory DNS Cache & Whitelist] -------------------> HIT? ---> [Return Cached IP (<5ms)] |
|         | MISS                                                                                     |
|         v                                                                                          |
|  [TIER 2: Threat Intel & Blacklist (Bloom Filter + Redis)] ---> MATCH? --> [Block & Sinkhole (0.0.0.0)]|
|         | PASS                                                                                     |
|         v                                                                                          |
|  [TIER 3: AI/ML DGA Botnet Classifier (ONNX / LightGBM)] -----> MALICIOUS? -> [Block & Alert SOC]  |
|         | BENIGN                                                                                   |
|         v                                                                                          |
|  [TIER 4: DNS Tunneling & Entropy Anomaly Engine] -----------> EXFIL DETECTED? -> [Block & Alert]   |
|         | CLEAN                                                                                    |
|         v                                                                                          |
|  [Forward to Upstream Root/Authoritative/Public DNS (Cloudflare 1.1.1.1 / Quad9 / Internal ISP)]   |
|         |                                                                                          |
|         +---> Cache Response ---> Return Clean DNS Record to Client (<40ms)                        |
+----------------------------------------------------------------------------------------------------+
                                                   |
                        +--------------------------+--------------------------+
                        | (Async Event Stream via WebSockets / Redis PubSub)  |
                        v                                                     v
+--------------------------------------------------+ +-----------------------------------------------+
|         OFFLINE FORENSIC ANALYZER                | |       REAL-TIME SOC MANAGEMENT DASHBOARD      |
|  - PCAP Parser (Scapy / DPDK)                    | |  - Live Threat Feed & Query Stream Map        |
|  - Zeek dns.log TSV Stream Ingestion             | |  - DGA Family Breakdown (Cryptolocker, etc.) |
|  - Historical Anomaly Correlation                | |  - Source IP Attack Heatmaps & Quarantine     |
|  - Forensic Report Generator                     | |  - STIX/TAXII Poller & Custom Blocklist Rule  |
+--------------------------------------------------+ +-----------------------------------------------+
```

---

## 🛠️ Quickstart & Local Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Train / compile the AI DGA Model to ONNX format (takes ~10 seconds)
python ai_engine/train_dga_model.py

# Start the VajraDNS Server (REST API, WebSockets, DoH on port 8000, UDP DNS on port 5353/53)
python server.py
```

### 2. Frontend SOC Console Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser to access the live SOC dashboard.

### 3. Run Live Attack Simulation (Jury Demo)
In a new terminal:
```bash
cd backend
python simulate_attacks.py
```
Watch the real-time query ticker on the SOC dashboard intercept and block DGA botnets and DNS tunneling attacks in real time!

---

## 📜 License
This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
