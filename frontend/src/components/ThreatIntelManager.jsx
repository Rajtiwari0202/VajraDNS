import React, { useState, useEffect } from 'react';
import { Database, Plus, Shield, ShieldCheck, Check, AlertCircle, RefreshCw, UploadCloud, Radio } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 font-mono">Threat Intelligence & STIX/TAXII Hub</h2>
            <p className="text-xs text-gray-400">Automated global threat ingestion with sub-0.05ms Bloom Filter set membership</p>
          </div>
        </div>

        <button
          onClick={fetchIntel}
          className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-800 transition flex items-center gap-2 text-xs font-mono"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-blue-950/40 border border-blue-800 text-blue-300 rounded-xl text-xs font-mono flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-gray-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Active Threat Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {intelData?.active_threat_feeds?.map((feed, idx) => (
          <div key={idx} className="bg-[#0D1322] border border-gray-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-gray-200">{feed.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {feed.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono">Protocol: <span className="text-purple-400">{feed.protocol}</span></div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">Indicators: <span className="text-gray-200 font-bold">{feed.indicators}</span></div>
          </div>
        ))}
      </div>

      {/* Dual Column: Add Blacklist vs Add Whitelist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Add Blacklist */}
        <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl font-mono">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Threat Indicator to Active Blacklist
          </h3>

          <form onSubmit={handleAddBlacklist} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Malicious Domain Name</label>
              <input
                type="text"
                placeholder="e.g., evil-phishing-target.xyz"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Threat Classification</label>
              <select
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-red-500"
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
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              Add to Bloom Filter & Sinkhole
            </button>
          </form>
        </div>

        {/* Add Whitelist */}
        <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl font-mono">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Add Domain to Permanent Whitelist
          </h3>

          <form onSubmit={handleAddWhitelist} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Trusted Domain Name</label>
              <input
                type="text"
                placeholder="e.g., custom-space-telemetry.isro.gov.in"
                value={whitelistDomain}
                onChange={(e) => setWhitelistDomain(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Whitelisted domains bypass AI inspection and are resolved directly via Tier 1 with sub-5ms latency.
            </p>

            <button
              type="submit"
              disabled={loading || !whitelistDomain}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              Add to Trusted Whitelist
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
