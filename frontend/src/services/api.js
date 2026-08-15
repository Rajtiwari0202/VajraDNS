/**
 * VajraDNS Frontend API & WebSocket Communication Client
 */

const API_BASE = "http://127.0.0.1:8000";
const WS_BASE = "ws://127.0.0.1:8000";

export const api = {
  // Test Domain Resolution
  async resolveQuery(domain, queryType = "A", clientIp = "127.0.0.1") {
    const res = await fetch(`${API_BASE}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, query_type: queryType, client_ip: clientIp })
    });
    return res.json();
  },

  // Get Stats & History
  async getStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    return res.json();
  },

  // Get Threat Intelligence Metadata
  async getThreatIntel() {
    const res = await fetch(`${API_BASE}/api/threat-intel`);
    return res.json();
  },

  // Add Custom Blacklist Indicator
  async addBlacklist(domain, threatType = "Custom Blacklist") {
    const res = await fetch(`${API_BASE}/api/threat-intel/blacklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, threat_type: threatType, confidence: 95, source: "Admin Rule" })
    });
    return res.json();
  },

  // Add Whitelist Domain
  async addWhitelist(domain) {
    const res = await fetch(`${API_BASE}/api/threat-intel/whitelist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain })
    });
    return res.json();
  },

  // Upload PCAP for Forensics
  async uploadPcap(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/forensics/upload-pcap`, {
      method: "POST",
      body: formData
    });
    return res.json();
  },

  // Upload Zeek dns.log TSV for Forensics
  async uploadZeek(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/forensics/upload-zeek`, {
      method: "POST",
      body: formData
    });
    return res.json();
  },

  // Trigger Simulated Attack Batch
  async simulateAttack(attackType = "all") {
    const formData = new FormData();
    formData.append("attack_type", attackType);
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: "POST",
      body: formData
    });
    return res.json();
  }
};

// WebSocket Telemetry Hook
export function connectTelemetrySocket(onMessage, onStatusChange) {
  let ws = null;
  let reconnectTimer = null;

  function connect() {
    ws = new WebSocket(`${WS_BASE}/ws/telemetry`);

    ws.onopen = () => {
      if (onStatusChange) onStatusChange(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onMessage) onMessage(payload);
      } catch (err) {
        console.error("WS Parse error:", err);
      }
    };

    ws.onclose = () => {
      if (onStatusChange) onStatusChange(false);
      reconnectTimer = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  connect();

  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
  };
}
