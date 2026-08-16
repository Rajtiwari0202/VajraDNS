import React, { useState, useEffect } from 'react';
import { Database, Plus, ShieldCheck, RefreshCw, Download, Check, ShieldAlert, Globe, Radio } from 'lucide-react';
import { api } from '../services/api';

export default function ThreatIntelManager() {
  const [intelData, setIntelData] = useState(null);
  const [newDomain, setNewDomain] = useState('');
  const [threatType, setThreatType] = useState('C2 / Botnet Server');
  const [whitelistDomain, setWhitelistDomain] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchIntel = async () => {
    try {
      const data = await api.getThreatIntel();
      setIntelData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIntel();
  }, []);

  const handleAddBlacklist = async (e) => {
    e.preventDefault();
    if (!newDomain) return;
    setLoading(true);
    try {
      const res = await api.addBlacklist(newDomain, threatType);
      setMessage(res.message);
      setNewDomain('');
      fetchIntel();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWhitelist = async (e) => {
    e.preventDefault();
    if (!whitelistDomain) return;
    setLoading(true);
    try {
      const res = await api.addWhitelist(whitelistDomain);
      setMessage(res.message);
      setWhitelistDomain('');
      fetchIntel();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportSTIX21 = () => {
    const stixBundle = {
      type: "bundle",
      id: `bundle--${Date.now()}`,
      spec_version: "2.1",
      objects: (intelData?.recent_blacklisted || []).map((item, idx) => ({
        type: "indicator",
        spec_version: "2.1",
        id: `indicator--${idx}-${Date.now()}`,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        name: item.threat_type,
        pattern: `[domain-name:value = '${item.domain}']`,
        pattern_type: "stix",
        valid_from: new Date().toISOString(),
        confidence: item.confidence || 95
      }))
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vajradns_threat_intel_stix21_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Threat Intelligence & STIX/TAXII 2.1 Hub
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Continuous multi-source threat feed ingestion with sub-0.05ms Bloom Filter membership verification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportSTIX21}
            className="btn-secondary text-xs font-semibold py-2"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export STIX 2.1 JSON</span>
          </button>
          <button
            onClick={fetchIntel}
            className="p-2 bg-[#1E2638] hover:bg-[#263248] text-zinc-300 rounded-lg border border-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-zinc-900 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {message}</span>
          <button onClick={() => setMessage('')} className="text-zinc-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Active Threat Feeds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(intelData?.active_threat_feeds || [
          { name: "AlienVault OTX", protocol: "TAXII 2.1", indicators: 4500, status: "ACTIVE" },
          { name: "Abuse.ch ThreatFox", protocol: "REST/STIX", indicators: 8200, status: "ACTIVE" },
          { name: "CERT-In National Feed", protocol: "TAXII 2.1", indicators: 3100, status: "SYNCED" },
          { name: "Vajra Threat Exchange", protocol: "STIX 2.1", indicators: 240, status: "ONLINE" }
        ]).map((feed, idx) => (
          <div key={idx} className="card-panel-interactive p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">{feed.name}</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold badge-emerald">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {feed.status}
              </span>
            </div>
            <div className="text-xs text-zinc-400 font-mono">Protocol: <span className="text-zinc-200">{feed.protocol}</span></div>
            <div className="text-xs text-zinc-400 font-mono mt-1">Active Indicators: <span className="text-blue-400 font-bold">{feed.indicators}</span></div>
          </div>
        ))}
      </div>

      {/* Dual Column: Add Blacklist vs Add Whitelist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Add Blacklist */}
        <div className="card-panel p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Add Threat Indicator to Active Blacklist
          </h3>

          <form onSubmit={handleAddBlacklist} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">Malicious Domain Name</label>
              <input
                type="text"
                placeholder="e.g., evil-phishing-target.xyz"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full input-clean"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">Threat Classification</label>
              <select
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
                className="w-full input-clean font-sans"
              >
                <option value="C2 / Botnet Server">C2 / Botnet Server</option>
                <option value="Phishing & Impersonation">Phishing & Impersonation</option>
                <option value="Ransomware Payment Gate">Ransomware Payment Gate</option>
                <option value="Data Exfiltration Endpoint">Data Exfiltration Endpoint</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !newDomain}
              className="w-full btn-primary py-2.5 font-semibold text-xs disabled:opacity-50"
            >
              Add to Bloom Filter & Sinkhole
            </button>
          </form>
        </div>

        {/* Add Whitelist */}
        <div className="card-panel p-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Add Domain to Permanent Sovereign Whitelist
          </h3>

          <form onSubmit={handleAddWhitelist} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">Trusted Sovereign Domain</label>
              <input
                type="text"
                placeholder="e.g., space-telemetry.isro.gov.in"
                value={whitelistDomain}
                onChange={(e) => setWhitelistDomain(e.target.value)}
                className="w-full input-clean"
              />
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Whitelisted domains bypass AI inspection and are resolved directly via Tier 1 with sub-5ms latency.
            </p>

            <button
              type="submit"
              disabled={loading || !whitelistDomain}
              className="w-full btn-secondary py-2.5 font-semibold text-xs disabled:opacity-50"
            >
              Add to Trusted Whitelist
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
