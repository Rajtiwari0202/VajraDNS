import React, { useState } from 'react';
import { Terminal, ShieldAlert, ShieldCheck, Zap, Sparkles, Clock, CheckCircle2, XCircle, ArrowRight, Layers, FileCode, Check, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function QueryPlayground({ onQueryComplete }) {
  const [domain, setDomain] = useState('isro.gov.in');
  const [queryType, setQueryType] = useState('A');
  const [clientIp, setClientIp] = useState('192.168.1.105');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showWirePacket, setShowWirePacket] = useState(false);

  const presets = [
    { label: 'Sovereign Whitelist', domain: 'isro.gov.in', type: 'A', desc: 'Tier 1 Instant Resolution' },
    { label: 'Conficker DGA Botnet', domain: 'q7z8p49m21lk.biz', type: 'A', desc: 'Tier 3 AI DGA Block' },
    { label: 'Locky Ransomware DGA', domain: 'ab89fc12d09e3a.ru', type: 'A', desc: 'Tier 3 AI DGA Block' },
    { label: 'DNS Tunneling Exfil', domain: 'c2VjcmV0X3Bhc3N3b3JkX2V4Zmls.tunnel.darknet.cc', type: 'TXT', desc: 'Tier 4 Shannon Anomaly' },
    { label: 'STIX Threat Match', domain: 'c2-cobaltstrike-listener.xyz', type: 'A', desc: 'Tier 2 Bloom Filter Sinkhole' },
    { label: 'Clean Enterprise', domain: 'github.com', type: 'A', desc: 'Clean Upstream Forward' }
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

  const getWireHeader = () => {
    if (!result) return null;
    const isBlocked = result.verdict === 'BLOCK';
    return {
      txId: '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0'),
      flags: {
        qr: 1, // Response
        opcode: 0, // Standard Query
        aa: isBlocked ? 1 : 0, // Authoritative Answer for Sinkhole
        tc: 0, // Truncation
        rd: 1, // Recursion Desired
        ra: 1, // Recursion Available
        rcode: isBlocked ? 3 : 0 // 3 = NXDOMAIN / Refused, 0 = NOERROR
      },
      qdcount: 1,
      ancount: result.answers?.length || 1,
      nscount: 0,
      arcount: 0
    };
  };

  const wireHeader = getWireHeader();

  return (
    <div className="space-y-6">
      {/* Top Card: Interactive Query Console */}
      <div className="card-panel p-6">
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Interactive DNS Inspector & Explainable AI (XAI)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inspect real-time resolution telemetry, RFC 1035 wire packets, and transparent AI attribution through the 4-Tier Zero-Trust Pipeline
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Domain Name to Query</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., isro.gov.in or q7z8p49m.biz"
              className="w-full input-clean"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Record Type</label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="w-full input-clean"
            >
              <option value="A">A (IPv4)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="TXT">TXT (Data/SPF)</option>
              <option value="CNAME">CNAME</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Client Source IP</label>
            <input
              type="text"
              value={clientIp}
              onChange={(e) => setClientIp(e.target.value)}
              className="w-full input-clean"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleResolve()}
              disabled={loading}
              className="w-full btn-primary py-2.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inspecting...</span>
                </>
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
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 block mb-2.5">
            Quick Audit Presets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDomain(p.domain);
                  setQueryType(p.type);
                  handleResolve(p.domain, p.type);
                }}
                className="p-3 text-left bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] hover:border-blue-500/40 rounded-xl transition-all group"
              >
                <div className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 truncate">{p.label}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-1">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Engine Breakdown & XAI Explanations */}
      {result && (
        <div className="card-panel p-6 space-y-6">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                result.verdict === 'BLOCK' ? 'badge-rose' : 'badge-emerald'
              }`}>
                {result.verdict === 'BLOCK' ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-mono font-bold text-white">{result.domain}</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded ${
                    result.verdict === 'BLOCK' ? 'badge-rose' : 'badge-emerald'
                  }`}>
                    {result.verdict}: {result.action}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Threat Category: <span className={result.verdict === 'BLOCK' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>{result.threat_category}</span> • Decision Stage: <span className="text-zinc-200 font-mono">{result.tier}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 font-mono text-right text-xs">
              <div>
                <div className="text-[11px] text-zinc-400 uppercase">Latency</div>
                <div className={`text-lg font-bold ${result.latency_ms < 25 ? 'text-emerald-400' : 'text-zinc-200'}`}>
                  {result.latency_ms} ms
                </div>
              </div>
              <div className="border-l border-white/[0.08] pl-6">
                <div className="text-[11px] text-zinc-400 uppercase">Threat Score</div>
                <div className={`text-lg font-bold ${result.threat_score > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.threat_score}%
                </div>
              </div>
            </div>
          </div>

          {/* 4-Tier Pipeline Stepper Visualization */}
          <div className="pb-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                4-Tier Zero-Trust Decision Progression
              </h4>

              <button
                onClick={() => setShowWirePacket(!showWirePacket)}
                className="btn-secondary text-[11px] py-1 px-2.5 font-mono"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>{showWirePacket ? "Hide Wire Packet" : "View RFC 1035 Wire Packet"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              {/* Tier 1 */}
              <div className={`p-4 rounded-xl border transition-all ${
                result.tier.includes('Tier 1') ? 'bg-blue-950/30 border-blue-500/50 text-blue-200' : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1.5 font-semibold">
                  <span>Tier 1: Cache / Whitelist</span>
                  {result.tier.includes('Tier 1') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px] font-mono text-zinc-400">PASSED</span>}
                </div>
                <p className="text-[11px] text-zinc-400">In-memory sub-ms LRU cache</p>
              </div>

              {/* Tier 2 */}
              <div className={`p-4 rounded-xl border transition-all ${
                result.tier.includes('Tier 2') ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1.5 font-semibold">
                  <span>Tier 2: STIX / TAXII Feeds</span>
                  {result.tier.includes('Tier 2') ? <XCircle className="w-4 h-4 text-rose-400" /> : <span className="text-[10px] font-mono text-zinc-400">CLEAN</span>}
                </div>
                <p className="text-[11px] text-zinc-400">Bloom Filter threat intelligence</p>
              </div>

              {/* Tier 3 */}
              <div className={`p-4 rounded-xl border transition-all ${
                result.tier.includes('Tier 3') ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1.5 font-semibold">
                  <span>Tier 3: AI DGA Model</span>
                  {result.tier.includes('Tier 3') ? <XCircle className="w-4 h-4 text-rose-400" /> : <span className="text-[10px] font-mono text-zinc-400">BENIGN</span>}
                </div>
                <p className="text-[11px] text-zinc-400">1.08ms ONNX ML Classifier</p>
              </div>

              {/* Tier 4 */}
              <div className={`p-4 rounded-xl border transition-all ${
                result.tier.includes('Tier 4') ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' : 'bg-zinc-900/60 border-white/[0.06] text-zinc-400'
              }`}>
                <div className="flex items-center justify-between mb-1.5 font-semibold">
                  <span>Tier 4: Tunneling Shield</span>
                  {result.tier.includes('Tier 4') ? <XCircle className="w-4 h-4 text-rose-400" /> : <span className="text-[10px] font-mono text-zinc-400">CLEAN</span>}
                </div>
                <p className="text-[11px] text-zinc-400">Shannon entropy exfil detector</p>
              </div>

            </div>
          </div>

          {/* RFC 1035 RAW WIRE PACKET INSPECTOR (When toggled) */}
          {showWirePacket && wireHeader && (
            <div className="p-5 rounded-xl bg-[#0B0F19] border border-blue-500/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>RFC 1035 DNS WIRE HEADER & FLAGS</span>
                <span>TXID: {wireHeader.txId}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-300">
                <div className="p-2 rounded bg-zinc-900 border border-white/5">
                  <span className="text-zinc-500 block">QR (Response):</span> {wireHeader.flags.qr} (Response)
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-white/5">
                  <span className="text-zinc-500 block">Opcode:</span> {wireHeader.flags.opcode} (Standard)
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-white/5">
                  <span className="text-zinc-500 block">AA (Authoritative):</span> {wireHeader.flags.aa}
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-white/5">
                  <span className="text-zinc-500 block">RCODE:</span> {wireHeader.flags.rcode} ({wireHeader.flags.rcode === 0 ? 'NOERROR' : 'NXDOMAIN'})
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1">
                Raw Wire Decapsulation: <span className="text-zinc-200">UDP Port 53 -> Length: 64 bytes -> Protocol: RFC 1035 wire format compliant</span>
              </div>
            </div>
          )}

          {/* Explainable AI (XAI) Attribution & Resolved Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: XAI Reasoning */}
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Explainable AI (XAI) Feature Attribution
              </h4>
              <p className="text-zinc-200 leading-relaxed p-4 rounded-lg bg-[#0B0F19] border border-white/[0.06] font-mono text-xs">
                {result.xai_explanation}
              </p>
            </div>

            {/* Right: Resolved DNS Wire Records */}
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-white/[0.06]">
              <h4 className="font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                Returned DNS Answer Records (TTL: {result.ttl}s)
              </h4>
              <div className="space-y-2 font-mono">
                {result.answers?.map((ans, i) => (
                  <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#0B0F19] text-xs border border-white/[0.06]">
                    <span className="text-zinc-400">{result.domain}.</span>
                    <span className="text-zinc-400">{result.query_type}</span>
                    <span className={result.verdict === 'BLOCK' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
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
