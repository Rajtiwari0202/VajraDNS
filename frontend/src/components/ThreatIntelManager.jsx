import React, { useState, useEffect } from 'react';
import { Database, Plus, ShieldCheck, RefreshCw, Download, Check } from 'lucide-react';
import { api } from '../services/api';

export default function ThreatIntelManager() {
  const [intelData, setIntelData] = useState(null);
  const [newDomain, setNewDomain] = useState('');
  const [threatType, setThreatType] = useState('Phishing / C2');
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
      <div className="surface-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Threat Intelligence & STIX 2.1 Hub
            </h2>
            <p className="text-[11px] text-zinc-400">
              Continuous threat feed ingestion with sub-0.05ms Bloom Filter set membership verification
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportSTIX21}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-white/10 transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export STIX 2.1 JSON</span>
          </button>
          <button
            onClick={fetchIntel}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-white/10 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-zinc-900 border border-white/10 text-zinc-200 rounded-lg text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {message}</span>
          <button onClick={() => setMessage('')} className="text-zinc-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Active Threat Feeds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {intelData?.active_threat_feeds?.map((feed, idx) => (
          <div key={idx} className="surface-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-200">{feed.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {feed.status}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Protocol: <span className="text-zinc-200">{feed.protocol}</span></div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Indicators: <span className="text-zinc-200 font-medium">{feed.indicators}</span></div>
          </div>
        ))}
      </div>

      {/* Dual Column: Add Blacklist vs Add Whitelist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Add Blacklist */}
        <div className="surface-card p-5">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            Add Threat Indicator to Active Blacklist
          </h3>

          <form onSubmit={handleAddBlacklist} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5">Malicious Domain Name</label>
              <input
                type="text"
                placeholder="e.g., evil-phishing-target.xyz"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5">Threat Classification</label>
              <select
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
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
              className="w-full py-2 px-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              Add to Bloom Filter & Sinkhole
            </button>
          </form>
        </div>

        {/* Add Whitelist */}
        <div className="surface-card p-5">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Add Domain to Permanent Whitelist
          </h3>

          <form onSubmit={handleAddWhitelist} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1.5">Trusted Domain Name</label>
              <input
                type="text"
                placeholder="e.g., space-telemetry.isro.gov.in"
                value={whitelistDomain}
                onChange={(e) => setWhitelistDomain(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Whitelisted domains bypass AI inspection and are resolved directly via Tier 1 with sub-5ms latency.
            </p>

            <button
              type="submit"
              disabled={loading || !whitelistDomain}
              className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg border border-white/10 transition disabled:opacity-50"
            >
              Add to Trusted Whitelist
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
