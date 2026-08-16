/**
 * VajraDNS Frontend API & WebSocket Communication Client
 * Connects dynamically to backend with automatic reconnection and heartbeat.
 */

const getHost = () => (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');
const API_BASE = typeof window !== 'undefined' ? `http://${getHost()}:8000` : 'http://127.0.0.1:8000';
const WS_BASE = typeof window !== 'undefined' ? `ws://${getHost()}:8000` : 'ws://127.0.0.1:8000';

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

// Robust WebSocket Telemetry Connection with Auto-Reconnect
export function connectTelemetrySocket(onMessage, onStatusChange) {
  let ws = null;
  let reconnectTimer = null;
  let isUnmounted = false;

  function connect() {
    if (isUnmounted) return;
    try {
      ws = new WebSocket(`${WS_BASE}/ws/telemetry`);

      ws.onopen = () => {
        if (onStatusChange) onStatusChange(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (onMessage) onMessage(payload);
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onclose = () => {
        if (onStatusChange) onStatusChange(false);
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      if (onStatusChange) onStatusChange(false);
      if (!isUnmounted) {
        reconnectTimer = setTimeout(connect, 2500);
      }
    }
  }

  connect();

  return () => {
    isUnmounted = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) {
      try {
        ws.close();
      } catch (e) {}
    }
  };
}
