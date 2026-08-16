# 🚀 VajraDNS — Production Deployment & Operations Guide

This guide details the deployment of **VajraDNS** across on-premise bare-metal servers, sovereign government cloud enclaves (NIC / MeghRaj), and containerized microservice architectures.

---

## Table of Contents
1. [Architecture & Deployment Topology](#architecture--deployment-topology)
2. [Prerequisites](#prerequisites)
3. [Method 1: 1-Click Docker Compose Deployment](#method-1-1-click-docker-compose-deployment)
4. [Method 2: Bare-Metal Linux Deployment (Systemd)](#method-2-bare-metal-linux-deployment-systemd)
5. [Binding UDP Port 53 on Non-Root Linux Environments](#binding-udp-port-53-on-non-root-linux-environments)
6. [Nginx Reverse Proxy & TLS (DoH Configuration)](#nginx-reverse-proxy--tls-doh-configuration)
7. [Operational Health Checks & Verification](#operational-health-checks--verification)

---

## Architecture & Deployment Topology

```
                       [ INCOMING DNS TRAFFIC ]
             UDP 53 (Do53) │ HTTPS 443 (DoH) │ TLS 853 (DoT)
                           ▼
             ┌────────────────────────────────────┐
             │       VAJRADNS SECURITY NODE       │
             │                                    │
             │  FastAPI DoH Gateway (Port 8000)   │
             │  Async UDP Resolver (Port 53/5353) │
             │  LightGBM AI Engine (In-Memory)    │
             │  Bloom Filter (10M bits)           │
             └─────────────────┬──────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    [ MALICIOUS SINKHOLE ]          [ SECURE UPSTREAM DNS ]
       Address: 0.0.0.0             Quad9 / Cloudflare (1.1.1.1)
```

---

## Prerequisites

* **Operating System**: Ubuntu 22.04 LTS+, Debian 12+, RHEL 9+, or Windows 10/11 Server.
* **Hardware Requirements**:
  * **CPU**: 2 vCPUs minimum (4 vCPUs recommended for >10,000 QPS).
  * **RAM**: 2 GB RAM minimum (4 GB recommended).
  * **Storage**: 10 GB SSD.
* **Software**:
  * Python 3.10+ (Python 3.12 recommended).
  * Node.js 18+ & npm (for Web SOC Dashboard).
  * Docker & Docker Compose (optional for containerized setup).

---

## Method 1: 1-Click Docker Compose Deployment

The fastest way to deploy VajraDNS with both Backend and React SOC Dashboard containerized:

```bash
# 1. Clone repository
git clone https://github.com/Rajtiwari0202/VajraDNS.git
cd VajraDNS

# 2. Build and launch services in background
docker compose up -d --build

# 3. Verify running containers
docker compose ps
```

Services will be accessible at:
* **SOC Console Dashboard**: `http://<SERVER_IP>:5173`
* **DoH Endpoint**: `http://<SERVER_IP>:8000/dns-query`
* **UDP DNS Resolver**: `<SERVER_IP>:53`

---

## Method 2: Bare-Metal Linux Deployment (Systemd)

### 1. Set Up Backend Service
```bash
# Update packages and install dependencies
sudo apt-get update && sudo apt-get install -y python3-pip python3-venv libpcap-dev

# Create application directory
sudo mkdir -p /opt/vajradns
sudo chown -R $USER:$USER /opt/vajradns
cd /opt/vajradns

# Copy project files and create virtualenv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

# Pre-train and serialize AI model
python backend/ai_engine/train_dga_model.py
```

### 2. Create Systemd Service for Backend
Create `/etc/systemd/system/vajradns-backend.service`:
```ini
[Unit]
Description=VajraDNS Autonomous Threat Defense Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/vajradns/backend
ExecStart=/opt/vajradns/venv/bin/python server.py
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now vajradns-backend
sudo systemctl status vajradns-backend
```

### 3. Build & Host Frontend Dashboard
```bash
cd /opt/vajradns/frontend
npm install
npm run build
```

---

## Binding UDP Port 53 on Non-Root Linux Environments

To allow the Python process to bind directly to standard UDP Port 53 without running as full root:

```bash
sudo setcap 'cap_net_bind_service=+ep' /opt/vajradns/venv/bin/python3
```

---

## Nginx Reverse Proxy & TLS (DoH Configuration)

To enable production HTTPS with valid TLS certificates for DNS-over-HTTPS (DoH RFC 8484):

Create `/etc/nginx/sites-available/vajradns.conf`:
```nginx
server {
    listen 80;
    server_name dns.your-domain.gov.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dns.your-domain.gov.in;

    ssl_certificate /etc/letsencrypt/live/dns.your-domain.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dns.your-domain.gov.in/privkey.pem;

    # DoH RFC 8484 Endpoint
    location /dns-query {
        proxy_pass http://127.0.0.1:8000/dns-query;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # REST API & WebSockets
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # SOC Console Web App
    location / {
        root /opt/vajradns/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/vajradns.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Operational Health Checks & Verification

### 1. Test UDP Port 53 Resolution:
```bash
dig @127.0.0.1 -p 53 isro.gov.in A
```

### 2. Test AI DGA Interception via DoH:
```bash
curl -s "http://127.0.0.1:8000/dns-query?name=q7z8p49m.biz&type=A" | jq .
```
Verify that `Answer[0].data` returns `0.0.0.0` (Sinkholed).
