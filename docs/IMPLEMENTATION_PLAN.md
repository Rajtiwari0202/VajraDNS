# Implementation Plan — VajraDNS Architecture & Execution

## Overview
VajraDNS is an enterprise-grade, sovereign DNS security system designed for mission-critical networks, space defense establishments, enterprise SOCs, and ISPs. It fulfills all technical specifications of SIH Problem Statement **SIH1524**.

---

## 1. Directory Structure

```
vajradns/
├── docs/
│   ├── BLUEPRINT.md                    # Detailed architectural blueprint & scoring analysis
│   ├── IMPLEMENTATION_PLAN.md          # Execution plan & module breakdown
│   └── ARCHITECTURE_AND_THEORY.md      # Under-the-hood theoretical guide & interview prep
├── backend/
│   ├── requirements.txt                # Python dependencies
│   ├── server.py                       # FastAPI REST API + WebSockets server + DoH endpoint
│   ├── simulate_attacks.py             # Live attack simulator (DGA botnets, tunneling, clean queries)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── dns_engine.py               # Asynchronous multi-protocol DNS proxy server (UDP, DoH)
│   │   └── cache.py                    # High-speed in-memory LRU cache + Bloom filter
│   ├── pipeline/
│   │   ├── __init__.py
│   │   ├── decision_engine.py          # 4-Tier Decision Engine coordinator
│   │   └── tunneling_detector.py       # Shannon entropy & payload anomaly analyzer
│   ├── ai_engine/
│   │   ├── __init__.py
│   │   ├── feature_extractor.py        # 15+ lexical/statistical DGA feature extractor
│   │   ├── train_dga_model.py          # Training pipeline for DGA classifier
│   │   ├── dga_classifier.pkl          # Serialized trained model
│   │   └── dga_classifier.onnx         # Optimized ONNX model for sub-2ms inference
│   ├── threat_intel/
│   │   ├── __init__.py
│   │   ├── threat_feed.py              # STIX 2.1 & TAXII ingestion + custom rule manager
│   │   └── default_blacklists.json     # Built-in high-confidence threat feeds
│   └── forensics/
│       ├── __init__.py
│       └── pcap_analyzer.py            # PCAP network dump & Zeek dns.log TSV forensic parser
└── frontend/                           # React + Vite + Tailwind SOC Web Dashboard
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── index.css                   # Custom military/cyber dark theme styles
        ├── App.jsx                     # Main application layout & live telemetry context
        ├── components/
        │   ├── Navbar.jsx              # Navigation header with system status indicators
        │   ├── LiveThreatTicker.jsx    # Real-time streaming query log with latency badges
        │   ├── QueryPlayground.jsx     # Interactive domain resolution tester with XAI explanation
        │   ├── ThreatAnalytics.jsx     # DGA family charts, block ratios, hourly traffic heatmaps
        │   ├── ForensicStudio.jsx      # Drag-and-drop PCAP & Zeek log forensic investigator
        │   ├── ThreatIntelManager.jsx  # STIX/TAXII feed manager & custom rule editor
        │   └── AttackSimulator.jsx     # Live attack launcher button panel for jury demonstrations
        └── services/
            └── api.js                  # WebSocket and REST client
```

---

## 2. Engineering Milestones

### Phase 1: Core Engine & AI Infrastructure
- Build high-speed lexical & statistical feature extractor for domain names.
- Train and export high-accuracy LightGBM model to ONNX runtime format for sub-2ms inference.
- Implement Bloom filter and in-memory LRU cache for Tier 1 fast resolution.
- Build Shannon entropy and statistical tunneling detector for Tier 4 exfiltration detection.

### Phase 2: Resolver, Threat Feeds & Forensics
- Implement multi-protocol async DNS engine supporting Do53 (UDP), DoH (HTTPS), and DoT (TLS).
- Build automated STIX 2.1 / TAXII 2.1 threat feed synchronization module.
- Build passive forensic analyzer for PCAP files and Zeek `dns.log` TSV files.

### Phase 3: REST API, WebSockets & Simulation Engine
- Build FastAPI server exposing DoH endpoints, telemetry WebSockets, domain lookup API, forensic upload API, and threat rule management.
- Create automated attack simulation script capable of firing real-time DGA botnet attacks, tunneling exfiltrations, and benign lookups.

### Phase 4: Modern React SOC Web Dashboard
- Build dark-themed, military-grade SOC dashboard with live telemetry stream, interactive playground, threat metrics, forensic studio, and live attack simulation controls.
- Integrate WebSockets for real-time query notifications without polling.

### Phase 5: Verification & Presentation Polish
- Verify resolution latency benchmarks (<40ms average).
- Test all attack scenarios and record validation results.
- Create comprehensive documentation and slide-deck walkthrough.
