import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Search, Filter, ArrowUpRight, Radio } from 'lucide-react';

export default function LiveThreatTicker({ queries = [], onSelectQuery }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const displayQueries = queries.length > 0 ? queries : [
    {
      domain: "isro.gov.in",
      query_type: "A",
      client_ip: "192.168.1.104",
      protocol: "Do53",
      verdict: "ALLOW",
      action: "RESOLVED",
      tier: "Tier 1 (Whitelist)",
      threat_category: "Trusted / Whitelisted",
      latency_ms: 12.4,
      answers: ["115.112.238.106"]
    },
    {
      domain: "q7z8p49m21lk.biz",
      query_type: "A",
      client_ip: "10.0.4.22",
      protocol: "DoH_JSON",
      verdict: "BLOCK",
      action: "SINKHOLED",
      tier: "Tier 3 (AI/ML DGA Classifier)",
      threat_category: "DGA Botnet (Conficker)",
      latency_ms: 1.08,
      answers: ["0.0.0.0"]
    },
    {
      domain: "c2VjcmV0X3Bhc3N3b3JkX2V4Zmls.tunnel.darknet.cc",
      query_type: "TXT",
      client_ip: "192.168.1.115",
      protocol: "Do53",
      verdict: "BLOCK",
      action: "SINKHOLED",
      tier: "Tier 4 (DNS Tunneling Shield)",
      threat_category: "Covert Data Exfiltration",
      latency_ms: 0.45,
      answers: ["0.0.0.0"]
    }
  ];

  const filteredQueries = displayQueries.filter(q => {
    if (filter === 'BLOCKED' && q.verdict !== 'BLOCK') return false;
    if (filter === 'ALLOWED' && q.verdict !== 'ALLOW') return false;
    if (search && !q.domain.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="card-panel p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Live DNS Threat Stream
            </h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-white/10">
              {filteredQueries.length} Events
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time 4-Tier Zero-Trust query telemetry stream</p>
        </div>

        {/* Search & Segmented Filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0B0F19] border border-white/10 rounded-lg text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
            />
          </div>

          <div className="flex items-center p-1 bg-[#131926] rounded-xl border border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'ALL' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('BLOCKED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'BLOCKED' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              Blocked
            </button>
            <button
              onClick={() => setFilter('ALLOWED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'ALLOWED' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              Allowed
            </button>
          </div>
        </div>
      </div>

      {/* Query Stream List Table */}
      <div className="divide-y divide-white/[0.05] max-h-[480px] overflow-y-auto">
        {filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-mono">
            No DNS events matching filter. Run the attack simulator or query a domain to view live logs.
          </div>
        ) : (
          filteredQueries.map((q, idx) => {
            const isBlock = q.verdict === 'BLOCK';
            return (
              <div
                key={idx}
                onClick={() => onSelectQuery && onSelectQuery(q)}
                className="py-3 px-2 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/[0.03] cursor-pointer transition-all group"
              >
                {/* Left: Domain, Type & Threat info */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    isBlock ? 'badge-rose' : 'badge-emerald'
                  }`}>
                    {isBlock ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition">
                        {q.domain}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-white/5">
                        {q.query_type || 'A'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-white/5 hidden sm:inline">
                        {q.protocol || 'Do53'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-1 font-sans">
                      <span className={isBlock ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {q.threat_category}
                      </span>
                      <span>•</span>
                      <span className="text-zinc-500 font-mono text-[11px] truncate">{q.tier}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Latency, Client IP & Verdict */}
                <div className="flex items-center space-x-4 self-end sm:self-center flex-shrink-0 font-mono text-xs">
                  <div className="text-right">
                    <span className={`font-bold ${q.latency_ms < 25 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {q.latency_ms}ms
                    </span>
                    <span className="text-[11px] text-zinc-500 block">{q.client_ip}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                    isBlock ? 'badge-rose' : 'badge-emerald'
                  }`}>
                    {q.action || q.verdict}
                  </span>

                  <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-200 transition" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
