import React, { useState } from 'react';
import { Terminal, ShieldAlert, ShieldCheck, Zap, Sparkles, Clock, CheckCircle2, XCircle, ArrowRight, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function QueryPlayground({ onQueryComplete }) {
  const [domain, setDomain] = useState('isro.gov.in');
  const [queryType, setQueryType] = useState('A');
  const [clientIp, setClientIp] = useState('192.168.1.105');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    { label: 'Sovereign Whitelist', domain: 'isro.gov.in', type: 'A', desc: 'Tier 1 Clean Resolution' },
    { label: 'Conficker DGA Botnet', domain: 'q7z8p49m21lk.biz', type: 'A', desc: 'Tier 3 AI DGA Block' },
    { label: 'Locky Ransomware DGA', domain: 'ab89fc12d09e3a.ru', type: 'A', desc: 'Tier 3 AI DGA Block' },
    { label: 'DNS Tunneling Exfil', domain: 'c2VjcmV0X3Bhc3N3b3JkX2V4Zmls.tunnel.darknet.cc', type: 'TXT', desc: 'Tier 4 Anomaly Block' },
    { label: 'STIX Threat Match', domain: 'c2-cobaltstrike-listener.xyz', type: 'A', desc: 'Tier 2 Blacklist Sinkhole' },
    { label: 'Clean Enterprise', domain: 'github.com', type: 'A', desc: 'Upstream Clean Forward' }
  ];

  const handleResolve = async (customDomain = domain, customType = queryType) => {
    if (!customDomain) return;
    setLoading(true);
    try {
      const data = await api.resolveQuery(customDomain, customType, clientIp);
      setResult(data);
      if (onQueryComplete) onQueryComplete(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Card: Interactive Query Console */}
      <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100">Interactive Zero-Trust DNS Playground</h2>
            <p className="text-xs text-gray-400">Test live domain resolution through the 4-Tier Security Decision Engine</p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-mono text-gray-400 mb-1">Domain Name to Query</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., isro.gov.in or q7z8p49m.biz"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm font-mono text-gray-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-gray-400 mb-1">Record Type</label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm font-mono text-gray-100 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="A">A (IPv4)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="TXT">TXT (Data/SPF)</option>
              <option value="CNAME">CNAME</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-mono text-gray-400 mb-1">Client Source IP</label>
            <input
              type="text"
              value={clientIp}
              onChange={(e) => setClientIp(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm font-mono text-gray-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleResolve()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-mono text-gray-400 block mb-2">QUICK TEST PRESETS (CLICK TO TEST LIVE):</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDomain(p.domain);
                  setQueryType(p.type);
                  handleResolve(p.domain, p.type);
                }}
                className="p-2 text-left bg-gray-900/80 hover:bg-blue-900/30 border border-gray-800 hover:border-blue-500/40 rounded-lg transition group"
              >
                <div className="text-xs font-semibold text-gray-200 group-hover:text-blue-300 truncate">{p.label}</div>
                <div className="text-[10px] text-gray-500 truncate">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Engine Breakdown & XAI Explanations */}
      {result && (
        <div className={`border rounded-2xl p-6 shadow-2xl transition-all ${
          result.verdict === 'BLOCK' ? 'bg-[#150B0F] border-red-900/50 glow-red' : 'bg-[#0B1512] border-emerald-900/50 glow-green'
        }`}>
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${
                result.verdict === 'BLOCK' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40' : 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
              }`}>
                {result.verdict === 'BLOCK' ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-mono font-bold text-gray-100">{result.domain}</h3>
                  <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-md ${
                    result.verdict === 'BLOCK' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {result.verdict}: {result.action}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Category: <span className={result.verdict === 'BLOCK' ? 'text-red-400 font-semibold' : 'text-emerald-400'}>{result.threat_category}</span> • Decision Stage: <span className="text-gray-200">{result.tier}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 font-mono text-right">
              <div>
                <div className="text-xs text-gray-400">Total Latency</div>
                <div className={`text-xl font-bold ${result.latency_ms < 25 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {result.latency_ms} ms
                </div>
              </div>
              <div className="border-l border-gray-800 pl-4">
                <div className="text-xs text-gray-400">Threat Score</div>
                <div className={`text-xl font-bold ${result.threat_score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {result.threat_score}%
                </div>
              </div>
            </div>
          </div>

          {/* 4-Tier Pipeline Stepper Visualization */}
          <div className="py-6 border-b border-gray-800">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              4-Tier Zero-Trust Decision Path
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              
              {/* Tier 1 */}
              <div className={`p-3 rounded-xl border ${
                result.tier.includes('Tier 1') ? 'bg-blue-950/40 border-blue-500 text-blue-300' : 'bg-gray-900/60 border-gray-800 text-gray-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-bold">
                  <span>Tier 1: Cache & Whitelist</span>
                  {result.tier.includes('Tier 1') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px]">PASSED</span>}
                </div>
                <p className="text-[11px] text-gray-500">In-memory sub-ms LRU cache</p>
              </div>

              {/* Tier 2 */}
              <div className={`p-3 rounded-xl border ${
                result.tier.includes('Tier 2') ? 'bg-red-950/40 border-red-500 text-red-300' : 'bg-gray-900/60 border-gray-800 text-gray-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-bold">
                  <span>Tier 2: STIX / TAXII</span>
                  {result.tier.includes('Tier 2') ? <XCircle className="w-4 h-4 text-red-400" /> : <span className="text-[10px]">CLEAN</span>}
                </div>
                <p className="text-[11px] text-gray-500">Bloom Filter threat feeds</p>
              </div>

              {/* Tier 3 */}
              <div className={`p-3 rounded-xl border ${
                result.tier.includes('Tier 3') ? 'bg-red-950/40 border-red-500 text-red-300' : 'bg-gray-900/60 border-gray-800 text-gray-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-bold">
                  <span>Tier 3: AI DGA Model</span>
                  {result.tier.includes('Tier 3') ? <XCircle className="w-4 h-4 text-red-400" /> : <span className="text-[10px]">BENIGN</span>}
                </div>
                <p className="text-[11px] text-gray-500">ONNX Real-Time Inference</p>
              </div>

              {/* Tier 4 */}
              <div className={`p-3 rounded-xl border ${
                result.tier.includes('Tier 4') ? 'bg-red-950/40 border-red-500 text-red-300' : 'bg-gray-900/60 border-gray-800 text-gray-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-bold">
                  <span>Tier 4: Tunneling Shield</span>
                  {result.tier.includes('Tier 4') ? <XCircle className="w-4 h-4 text-red-400" /> : <span className="text-[10px]">CLEAN</span>}
                </div>
                <p className="text-[11px] text-gray-500">Entropy & Exfil detector</p>
              </div>

            </div>
          </div>

          {/* Explainable AI (XAI) Attribution & Resolved Answers */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            {/* Left: XAI Reasoning */}
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Explainable AI (XAI) Reasoning
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed bg-gray-950 p-3 rounded-lg border border-gray-800/80">
                {result.xai_explanation}
              </p>
            </div>

            {/* Right: Resolved DNS Wire Records */}
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Returned DNS Answer Records (TTL: {result.ttl}s)
              </h4>
              <div className="space-y-1">
                {result.answers?.map((ans, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded bg-gray-950 text-xs border border-gray-800">
                    <span className="text-gray-400">{result.domain}.</span>
                    <span className="text-gray-500">{result.query_type}</span>
                    <span className={result.verdict === 'BLOCK' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {ans}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
