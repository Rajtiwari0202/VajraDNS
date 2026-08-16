import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Search, Filter, ArrowUpRight } from 'lucide-react';

export default function LiveThreatTicker({ queries = [], onSelectQuery }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredQueries = queries.filter(q => {
    if (filter === 'BLOCKED' && q.verdict !== 'BLOCK') return false;
    if (filter === 'ALLOWED' && q.verdict !== 'ALLOW') return false;
    if (search && !q.domain.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="surface-card p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Live DNS Threat Stream
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10">
              {filteredQueries.length} Events
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Real-time 4-Tier Zero-Trust query telemetry</p>
        </div>

        {/* Search & Segmented Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex items-center p-0.5 bg-zinc-900 rounded-lg border border-white/[0.06] text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'ALL' ? 'bg-zinc-800 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('BLOCKED')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'BLOCKED' ? 'bg-rose-500/20 text-rose-300 font-medium' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              Blocked
            </button>
            <button
              onClick={() => setFilter('ALLOWED')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'ALLOWED' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              Allowed
            </button>
          </div>
        </div>
      </div>

      {/* Query Stream List Table */}
      <div className="divide-y divide-white/[0.04] max-h-[460px] overflow-y-auto">
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
                className="py-2.5 px-2 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition group"
              >
                {/* Left: Domain, Type & Threat info */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`p-1 rounded-md flex-shrink-0 ${
                    isBlock ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isBlock ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-xs font-medium text-zinc-200 truncate group-hover:text-blue-400 transition">
                        {q.domain}
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-white/5">
                        {q.query_type || 'A'}
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-white/5 hidden sm:inline">
                        {q.protocol || 'Do53'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className={isBlock ? 'text-rose-400' : 'text-emerald-400'}>
                        {q.threat_category}
                      </span>
                      <span>•</span>
                      <span className="text-zinc-500 truncate">{q.tier}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Latency, Client IP & Verdict */}
                <div className="flex items-center space-x-3 self-end sm:self-center flex-shrink-0 font-mono text-xs">
                  <div className="text-right">
                    <span className={`font-medium ${q.latency_ms < 25 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {q.latency_ms}ms
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{q.client_ip}</span>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded border ${
                    isBlock ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {q.action || q.verdict}
                  </span>

                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
