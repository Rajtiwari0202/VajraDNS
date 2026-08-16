# 📡 VajraDNS — Enterprise API & Protocol Reference

This document provides a comprehensive technical specification for all REST APIs, DNS-over-HTTPS (DoH RFC 8484) wire endpoints, WebSocket telemetry streaming protocols, and STIX/TAXII threat intelligence integration in **VajraDNS**.

---

## Table of Contents
1. [Base Configuration & Endpoints](#base-configuration--endpoints)
2. [DNS-over-HTTPS (DoH) Gateway (RFC 8484)](#dns-over-https-doh-gateway-rfc-8484)
3. [4-Tier Query Inspection API](#4-tier-query-inspection-api)
4. [Real-Time WebSocket Telemetry Protocol](#real-time-websocket-telemetry-protocol)
5. [Threat Intelligence & STIX 2.1 Management](#threat-intelligence--stix-21-management)
6. [Passive Forensic Ingestion API](#passive-forensic-ingestion-api)
7. [Cyber Warfare & Simulation API](#cyber-warfare--simulation-api)
8. [Telemetry & Operational Stats](#telemetry--operational-stats)

---

## Base Configuration & Endpoints

| Service | Protocol | Host / Port | Endpoint |
| :--- | :--- | :--- | :--- |
| **DoH Gateway** | HTTPS / HTTP/2 | `http://127.0.0.1:8000` | `/dns-query` |
| **REST API Engine** | HTTP / JSON | `http://127.0.0.1:8000` | `/api/*` |
| **WebSocket Stream**| WSS / WS | `ws://127.0.0.1:8000` | `/ws/telemetry` |
| **UDP DNS Server** | Do53 (UDP) | `127.0.0.1:53` / `5353` | Native UDP Port 53 |
| **SOC Web Console** | HTTP (Vite/React) | `http://localhost:5173` | `/` |

---

## DNS-over-HTTPS (DoH) Gateway (RFC 8484)

VajraDNS implements both the **RFC 8484 binary wire format** and the **JSON API format** (compatible with Google and Cloudflare DoH clients).

### 1. JSON DoH Query
* **Method**: `GET`
* **Path**: `/dns-query`
* **Query Parameters**:
  * `name` *(string, required)*: Fully qualified domain name (e.g. `isro.gov.in`, `q7z8p49m.biz`).
  * `type` *(string, optional, default: `A`)*: DNS Record Type (`A`, `AAAA`, `TXT`, `CNAME`).

#### Example Request:
```bash
curl -X GET "http://127.0.0.1:8000/dns-query?name=isro.gov.in&type=A" \
     -H "Accept: application/dns-json"
```

#### Example Response (Clean Sovereign Domain):
```json
{
  "Status": 0,
  "TC": false,
  "RD": true,
  "RA": true,
  "AD": false,
  "CD": false,
  "Question": [
    {
      "name": "isro.gov.in",
      "type": 1
    }
  ],
  "Answer": [
    {
      "name": "isro.gov.in",
      "type": 1,
      "TTL": 300,
      "data": "115.112.238.106"
    }
  ],
  "VajraTelemetry": {
    "domain": "isro.gov.in",
    "query_type": "A",
    "client_ip": "127.0.0.1",
    "protocol": "DoH_JSON",
    "verdict": "ALLOW",
    "action": "RESOLVED",
    "tier": "Tier 1 (Whitelist)",
    "threat_category": "Trusted / Whitelisted",
    "threat_score": 0.0,
    "answers": ["115.112.238.106"],
    "ttl": 300,
    "latency_ms": 11.45,
    "timestamp": 1786824500.12,
    "xai_explanation": "Trusted sovereign domain resolved via upstream DNS."
  }
}
```

#### Example Response (Sinkholed Malicious DGA Domain):
```json
{
  "Status": 3,
  "TC": false,
  "RD": true,
  "RA": true,
  "AD": false,
  "CD": false,
  "Question": [
    {
      "name": "q7z8p49m.biz",
      "type": 1
    }
  ],
  "Answer": [
    {
      "name": "q7z8p49m.biz",
      "type": 1,
      "TTL": 60,
      "data": "0.0.0.0"
    }
  ],
  "VajraTelemetry": {
    "domain": "q7z8p49m.biz",
    "query_type": "A",
    "client_ip": "127.0.0.1",
    "protocol": "DoH_JSON",
    "verdict": "BLOCK",
    "action": "SINKHOLED",
    "tier": "Tier 3 (AI/ML DGA Classifier)",
    "threat_category": "DGA Botnet (Conficker)",
    "threat_score": 99.97,
    "answers": ["0.0.0.0"],
    "ttl": 60,
    "latency_ms": 1.08,
    "timestamp": 1786824502.88,
    "xai_explanation": "AI model classified as DGA with 99.97% confidence. Reasons: Abnormal vowel-to-consonant ratio (0.00); Low linguistic naturalness; High-risk malicious TLD; High numeric density (50%)."
  }
}
```

### 2. Binary Wire DoH Query (RFC 8484)
* **Method**: `POST`
* **Path**: `/dns-query`
* **Headers**: `Content-Type: application/dns-message`, `Accept: application/dns-message`
* **Body**: Raw RFC 1035 wire packet bytes.

---

## 4-Tier Query Inspection API

Executes a synchronous resolution test through the 4-Tier Zero-Trust Pipeline with full Explainable AI reasoning.

* **Method**: `POST`
* **Path**: `/api/query`
* **Headers**: `Content-Type: application/json`

### Request Body Schema:
```json
{
  "domain": "c2VjcmV0X3Bhc3N3b3Jk.tunnel.darknet.cc",
  "query_type": "TXT",
  "client_ip": "192.168.1.115"
}
```

### Response Schema:
```json
{
  "domain": "c2VjcmV0X3Bhc3N3b3Jk.tunnel.darknet.cc",
  "query_type": "TXT",
  "client_ip": "192.168.1.115",
  "protocol": "REST_API",
  "verdict": "BLOCK",
  "action": "SINKHOLED",
  "tier": "Tier 4 (DNS Tunneling Shield)",
  "threat_category": "Covert Data Exfiltration / Tunneling",
  "threat_score": 95.0,
  "answers": ["0.0.0.0"],
  "ttl": 60,
  "latency_ms": 0.45,
  "timestamp": 1786824510.42,
  "xai_explanation": "Statistical exfiltration anomaly detected (Score: 95.0/100). Indicators: Shannon entropy exceeds threshold (H=4.12 >= 3.4); Base64 character set match (94.2%); Label length anomaly (24 chars)."
}
```

---

## Real-Time WebSocket Telemetry Protocol

Stream live DNS transaction logs, threat verdicts, and system counters to connected SOC workstations.

* **Protocol**: `WebSocket`
* **Path**: `/ws/telemetry`

### Initial Connection Handshake:
Upon establishing a WebSocket connection, VajraDNS immediately transmits the current system metrics:
```json
{
  "type": "INITIAL_STATE",
  "metrics": {
    "total_queries": 1420,
    "blocked_queries": 312,
    "block_rate_pct": 21.97,
    "dga_botnets_blocked": 210,
    "tunneling_blocked": 84,
    "cache": {
      "total_entries": 34,
      "hit_rate_pct": 42.5
    },
    "dga_family_distribution": {
      "Conficker": 120,
      "Locky": 55,
      "Banjori": 35
    }
  },
  "recent_queries": [ ... ]
}
```

### Live Query Event Stream:
Broadcast whenever any client resolves a query across Do53, DoH, or REST:
```json
{
  "type": "QUERY_EVENT",
  "data": {
    "domain": "drdo.gov.in",
    "query_type": "A",
    "client_ip": "192.168.1.104",
    "protocol": "Do53",
    "verdict": "ALLOW",
    "action": "RESOLVED",
    "tier": "Tier 1 (Whitelist)",
    "threat_category": "Trusted / Whitelisted",
    "threat_score": 0.0,
    "answers": ["164.100.158.23"],
    "ttl": 300,
    "latency_ms": 8.24,
    "timestamp": 1786824520.15
  },
  "metrics": { ... }
}
```

---

## Threat Intelligence & STIX 2.1 Management

### 1. Retrieve Active Threat Intel Feeds
* **Method**: `GET`
* **Path**: `/api/threat-intel`

#### Response:
```json
{
  "total_indicators_loaded": 16040,
  "bloom_filter_capacity": 10000000,
  "active_threat_feeds": [
    { "name": "AlienVault OTX", "protocol": "TAXII 2.1", "indicators": 4500, "status": "ACTIVE" },
    { "name": "Abuse.ch ThreatFox", "protocol": "REST/STIX", "indicators": 8200, "status": "ACTIVE" },
    { "name": "CERT-In National Feed", "protocol": "TAXII 2.1", "indicators": 3100, "status": "SYNCED" },
    { "name": "Vajra Threat Exchange", "protocol": "STIX 2.1", "indicators": 240, "status": "ONLINE" }
  ]
}
```

### 2. Add Custom Threat Indicator (Blacklist)
* **Method**: `POST`
* **Path**: `/api/threat-intel/blacklist`
* **Body**:
```json
{
  "domain": "malicious-c2-node.xyz",
  "threat_type": "C2 / Botnet Server",
  "confidence": 95,
  "source": "Admin Manual Rule"
}
```

### 3. Add Domain to Sovereign Whitelist
* **Method**: `POST`
* **Path**: `/api/threat-intel/whitelist`
* **Body**:
```json
{
  "domain": "telemetry-gateway.isro.gov.in"
}
```

---

## Passive Forensic Ingestion API

Batch ingest offline capture files to correlate compromised internal endpoints.

### 1. Upload PCAP Capture (`.pcap`, `.pcapng`)
* **Method**: `POST`
* **Path**: `/api/forensics/upload-pcap`
* **Form-Data**: `file=@traffic_dump.pcap`

### 2. Upload Zeek Log (`dns.log` TSV)
* **Method**: `POST`
* **Path**: `/api/forensics/upload-zeek`
* **Form-Data**: `file=@dns.log`

#### Forensic Analysis Response:
```json
{
  "status": "SUCCESS",
  "filename": "incident_trace.pcap",
  "analysis_duration_sec": 0.42,
  "total_dns_packets_parsed": 1420,
  "malicious_queries_detected": 184,
  "threat_percentage": 12.96,
  "compromised_hosts": [
    {
      "ip": "10.0.4.22",
      "total_queries": 95,
      "blocked_queries": 72,
      "infection_ratio_pct": 75.79,
      "severity": "CRITICAL",
      "threat_types": ["DGA Botnet (Locky)", "Covert DNS Tunneling"]
    }
  ]
}
```

---

## Cyber Warfare & Simulation API

Trigger realistic cyber warfare simulations to validate the 4-Tier Zero-Trust Engine.

* **Method**: `POST`
* **Path**: `/api/simulate`
* **Form-Data**: `attack_type=all` *(Options: `dga`, `tunneling`, `clean`, `all`)*

#### Response:
```json
{
  "status": "SIMULATION_COMPLETE",
  "simulated_count": 20,
  "events": [
    {
      "domain": "q7z8p49m21lk.biz",
      "client_ip": "192.168.1.104",
      "verdict": "BLOCK",
      "threat_category": "DGA Botnet (Conficker)",
      "latency_ms": 1.08
    }
  ]
}
```

---

## Telemetry & Operational Stats

* **Method**: `GET`
* **Path**: `/api/stats`

Returns aggregated operational counters, cache efficiency ratios, DGA malware family distribution, and top monitored source subnets.
