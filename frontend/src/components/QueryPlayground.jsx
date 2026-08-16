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
      <div className="surface-card p-6">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-blue-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Interactive DNS Inspector & XAI
            </h2>
            <p className="text-[11px] text-zinc-400">Audit live domain resolution through the 4-Tier Zero-Trust Pipeline</p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
          <div className="md:col-span-6">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Domain Name to Query</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., isro.gov.in or q7z8p49m.biz"
              className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Record Type</label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-500 transition"
            >
              <option value="A">A (IPv4)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="TXT">TXT (Data/SPF)</option>
              <option value="CNAME">CNAME</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Client Source IP</label>
            <input
              type="text"
              value={clientIp}
              onChange={(e) => setClientIp(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleResolve()}
              disabled={loading}
              className="w-full py-2 px-4 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-sm"
            >
              {loading ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Inspect Query</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-mono text-zinc-400 block mb-2">QUICK AUDIT SAMPLES:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDomain(p.domain);
                  setQueryType(p.type);
                  handleResolve(p.domain, p.type);
                }}
                className="p-2.5 text-left bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.05] hover:border-white/15 rounded-lg transition group"
              >
                <div className="text-xs font-medium text-zinc-200 group-hover:text-blue-400 truncate">{p.label}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Engine Breakdown & XAI Explanations */}
      {result && (
        <div className="surface-card p-6 space-y-6">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
            <div className="flex items-center space-x-3.5">
              <div className={`p-2.5 rounded-lg ${
                result.verdict === 'BLOCK' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {result.verdict === 'BLOCK' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-base font-mono font-semibold text-zinc-100">{result.domain}</h3>
                  <span className={`px-2 py-0.5 text-[11px] font-mono font-semibold uppercase rounded border ${
                    result.verdict === 'BLOCK' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {result.verdict}: {result.action}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Category: <span className={result.verdict === 'BLOCK' ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>{result.threat_category}</span> • Decision Stage: <span className="text-zinc-300 font-mono">{result.tier}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-5 font-mono text-right text-xs">
              <div>
                <div className="text-[11px] text-zinc-400">Total Latency</div>
                <div className={`text-base font-semibold ${result.latency_ms < 25 ? 'text-emerald-400' : 'text-zinc-200'}`}>
                  {result.latency_ms} ms
                </div>
              </div>
              <div className="border-l border-white/[0.08] pl-5">
                <div className="text-[11px] text-zinc-400">Threat Score</div>
                <div className={`text-base font-semibold ${result.threat_score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.threat_score}%
                </div>
              </div>
            </div>
          </div>

          {/* 4-Tier Pipeline Stepper Visualization */}
          <div className="pb-5 border-b border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              4-Tier Zero-Trust Decision Path
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              {/* Tier 1 */}
              <div className={`p-3 rounded-lg border ${
                result.tier.includes('Tier 1') ? 'bg-blue-950/20 border-blue-500/40 text-blue-300' : 'bg-zinc-900/60 border-white/[0.05] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-medium">
                  <span>Tier 1: Cache & Whitelist</span>
                  {result.tier.includes('Tier 1') ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px] font-mono">PASSED</span>}
                </div>
                <p className="text-[11px] text-zinc-400">In-memory sub-ms LRU cache</p>
              </div>

              {/* Tier 2 */}
              <div className={`p-3 rounded-lg border ${
                result.tier.includes('Tier 2') ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' : 'bg-zinc-900/60 border-white/[0.05] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-medium">
                  <span>Tier 2: STIX / TAXII</span>
                  {result.tier.includes('Tier 2') ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> : <span className="text-[10px] font-mono">CLEAN</span>}
                </div>
                <p className="text-[11px] text-zinc-400">Bloom Filter threat feeds</p>
              </div>

              {/* Tier 3 */}
              <div className={`p-3 rounded-lg border ${
                result.tier.includes('Tier 3') ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' : 'bg-zinc-900/60 border-white/[0.05] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-medium">
                  <span>Tier 3: AI DGA Model</span>
                  {result.tier.includes('Tier 3') ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> : <span className="text-[10px] font-mono">BENIGN</span>}
                </div>
                <p className="text-[11px] text-zinc-400">ONNX Real-Time Inference</p>
              </div>

              {/* Tier 4 */}
              <div className={`p-3 rounded-lg border ${
                result.tier.includes('Tier 4') ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' : 'bg-zinc-900/60 border-white/[0.05] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1 font-medium">
                  <span>Tier 4: Tunneling Shield</span>
                  {result.tier.includes('Tier 4') ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> : <span className="text-[10px] font-mono">CLEAN</span>}
                </div>
                <p className="text-[11px] text-zinc-400">Entropy & Exfil detector</p>
              </div>

            </div>
          </div>

          {/* Explainable AI (XAI) Attribution & Resolved Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: XAI Reasoning */}
            <div className="p-4 rounded-lg bg-zinc-900/70 border border-white/[0.06]">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Explainable AI (XAI) Reasoning
              </h4>
              <p className="text-zinc-300 leading-relaxed p-3 rounded bg-zinc-950 border border-white/[0.04] font-mono text-[11px]">
                {result.xai_explanation}
              </p>
            </div>

            {/* Right: Resolved DNS Wire Records */}
            <div className="p-4 rounded-lg bg-zinc-900/70 border border-white/[0.06]">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Returned DNS Answer Records (TTL: {result.ttl}s)
              </h4>
              <div className="space-y-1.5 font-mono">
                {result.answers?.map((ans, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded bg-zinc-950 text-[11px] border border-white/[0.04]">
                    <span className="text-zinc-400">{result.domain}.</span>
                    <span className="text-zinc-500">{result.query_type}</span>
                    <span className={result.verdict === 'BLOCK' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
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
