"""
VajraDNS — Unified FastAPI Server, WebSockets Telemetry Hub & DoH Gateway
Provides REST APIs, real-time WebSocket query streaming, DoH RFC 8484 endpoints,
and passive forensic upload handlers for the React SOC Console.
"""

import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pipeline.decision_engine import DecisionEngine
from core.dns_engine import AsyncUDPDNSServer, DoHHandler
from threat_intel.threat_feed import ThreatIntelligenceManager
from core.cache import VajraDNSCache
from forensics.pcap_analyzer import PassiveForensicAnalyzer


# Global WebSocket Connection Manager for Real-Time SOC Stream
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()
udp_server: Optional[AsyncUDPDNSServer] = None

# Global Query History & Metrics Store
query_history: List[Dict[str, Any]] = []
MAX_HISTORY = 1000

hourly_stats = {
    "total_queries": 0,
    "blocked_queries": 0,
    "clean_queries": 0,
    "dga_detected": 0,
    "tunneling_detected": 0,
    "threat_intel_matches": 0,
    "dga_families": {},
    "source_ips": {}
}


async def on_dns_event(event_data: Dict[str, Any]):
    """Callback triggered on every DNS query processed by UDP or API."""
    global query_history, hourly_stats
    
    query_history.insert(0, event_data)
    if len(query_history) > MAX_HISTORY:
        query_history.pop()
        
    hourly_stats["total_queries"] += 1
    if event_data["verdict"] == "BLOCK":
        hourly_stats["blocked_queries"] += 1
        cat = event_data["threat_category"]
        if "DGA" in cat:
            hourly_stats["dga_detected"] += 1
            # Extract family name
            fam = cat.replace("DGA Botnet (", "").rstrip(")")
            hourly_stats["dga_families"][fam] = hourly_stats["dga_families"].get(fam, 0) + 1
        elif "Tunneling" in cat:
            hourly_stats["tunneling_detected"] += 1
        elif "Threat Intel" in event_data.get("tier", ""):
            hourly_stats["threat_intel_matches"] += 1
    else:
        hourly_stats["clean_queries"] += 1

    src_ip = event_data.get("client_ip", "127.0.0.1")
    hourly_stats["source_ips"][src_ip] = hourly_stats["source_ips"].get(src_ip, 0) + 1

    # Stream to connected SOC dashboards
    await ws_manager.broadcast({
        "type": "QUERY_EVENT",
        "data": event_data,
        "metrics": get_dashboard_summary()
    })


def get_dashboard_summary() -> Dict[str, Any]:
    cache_stats = VajraDNSCache.get_instance().get_stats()
    threat_stats = ThreatIntelligenceManager.get_instance().get_stats()
    
    total = hourly_stats["total_queries"]
    blocked = hourly_stats["blocked_queries"]
    clean = hourly_stats["clean_queries"]
    block_rate = round((blocked / total * 100), 1) if total > 0 else 0.0

    return {
        "total_queries": total,
        "blocked_queries": blocked,
        "clean_queries": clean,
        "block_rate_pct": block_rate,
        "dga_botnets_blocked": hourly_stats["dga_detected"],
        "tunneling_exfil_blocked": hourly_stats["tunneling_detected"],
        "threat_intel_hits": hourly_stats["threat_intel_matches"],
        "dga_family_distribution": hourly_stats["dga_families"],
        "top_source_ips": sorted(hourly_stats["source_ips"].items(), key=lambda x: x[1], reverse=True)[:5],
        "cache": cache_stats,
        "threat_intel": threat_stats
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    global udp_server
    print("\n" + "=" * 60)
    print("[+] Starting VajraDNS Enterprise Security Appliance...")
    print("=" * 60)
    
    # Initialize Core Engines
    DecisionEngine.get_instance()
    
    # Start UDP DNS Server in background task
    udp_server = AsyncUDPDNSServer(host="0.0.0.0", port=5353, event_callback=on_dns_event)
    asyncio.create_task(udp_server.start())
    
    yield
    
    if udp_server:
        udp_server.stop()


app = FastAPI(
    title="VajraDNS — Autonomous AI Threat Defense Gateway",
    description="Sovereign Multi-Protocol Zero-Trust DNS Resolver & Forensic Analyzer",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# REST & DOH ENDPOINTS
# =============================================================================

class QueryRequest(BaseModel):
    domain: str
    query_type: str = "A"
    client_ip: str = "127.0.0.1"


class BlacklistRequest(BaseModel):
    domain: str
    threat_type: str = "Custom Blacklist"
    confidence: int = 95
    source: str = "Admin Rule"


class WhitelistRequest(BaseModel):
    domain: str


@app.get("/")
def root_status():
    return {
        "system": "VajraDNS",
        "status": "OPERATIONAL",
        "protocol_support": ["Do53_UDP", "DoH_HTTPS", "DoT_TLS"],
        "ai_engine": "ONNX_DGA_V1",
        "version": "1.0.0"
    }


@app.post("/api/query")
async def resolve_query(req: QueryRequest):
    """Interactive Playground API endpoint for testing domain resolution."""
    engine = DecisionEngine.get_instance()
    verdict = engine.process_query(
        domain=req.domain,
        rtype=req.query_type,
        client_ip=req.client_ip,
        protocol="REST_API"
    )
    await on_dns_event(verdict)
    return verdict


@app.get("/api/stats")
def get_stats():
    """Returns current telemetry metrics and query history."""
    return {
        "summary": get_dashboard_summary(),
        "recent_queries": query_history[:50]
    }


@app.get("/dns-query")
async def doh_get(name: str = Query(..., description="Domain name to resolve"), type: str = Query("A")):
    """DNS-over-HTTPS (DoH) JSON endpoint."""
    res = DoHHandler.resolve_doh_json(name, type)
    await on_dns_event(res["VajraTelemetry"])
    return res


@app.post("/dns-query")
async def doh_post(request: Request):
    """DNS-over-HTTPS (DoH RFC 8484) binary wire-format endpoint."""
    body = await request.body()
    wire_response = DoHHandler.resolve_doh_wire(body)
    return Response(content=wire_response, media_type="application/dns-message")


@app.get("/api/threat-intel")
def get_threat_intel():
    """Returns active threat feeds and blacklisted/whitelisted indicators."""
    mgr = ThreatIntelligenceManager.get_instance()
    return mgr.get_stats()


@app.post("/api/threat-intel/blacklist")
def add_blacklist(req: BlacklistRequest):
    mgr = ThreatIntelligenceManager.get_instance()
    mgr.add_malicious_domain(req.domain, req.threat_type, req.confidence, req.source)
    return {"status": "SUCCESS", "message": f"Added '{req.domain}' to active blacklist."}


@app.post("/api/threat-intel/whitelist")
def add_whitelist(req: WhitelistRequest):
    mgr = ThreatIntelligenceManager.get_instance()
    mgr.add_whitelist_domain(req.domain)
    return {"status": "SUCCESS", "message": f"Added '{req.domain}' to permanent whitelist."}


@app.post("/api/threat-intel/stix-import")
async def import_stix(bundle_file: UploadFile = File(...)):
    content = await bundle_file.read()
    mgr = ThreatIntelligenceManager.get_instance()
    res = mgr.ingest_stix_bundle(content.decode('utf-8'))
    return res


@app.post("/api/forensics/upload-pcap")
async def upload_pcap(file: UploadFile = File(...)):
    """Uploads a .pcap / .pcapng network capture for deep passive forensic analysis."""
    content = await file.read()
    analyzer = PassiveForensicAnalyzer.get_instance()
    res = analyzer.analyze_pcap(content, filename=file.filename)
    return res


@app.post("/api/forensics/upload-zeek")
async def upload_zeek(file: UploadFile = File(...)):
    """Uploads a Zeek dns.log TSV file for batch forensic inspection."""
    content = await file.read()
    analyzer = PassiveForensicAnalyzer.get_instance()
    res = analyzer.analyze_zeek_tsv(content.decode('utf-8', errors='ignore'), filename=file.filename)
    return res


@app.post("/api/simulate")
async def run_simulation(attack_type: str = Form("all")):
    """Triggers simulated cyber attacks for live hackathon demonstration."""
    from simulate_attacks import run_simulated_batch
    events = run_simulated_batch(attack_type)
    for ev in events:
        await on_dns_event(ev)
    return {"status": "SUCCESS", "simulated_count": len(events), "events": events}


@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial state snapshot
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "metrics": get_dashboard_summary(),
            "recent_queries": query_history[:30]
        })
        while True:
            # Keep-alive loop
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
