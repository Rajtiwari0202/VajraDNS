import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Clock, Globe, Info, Filter, ArrowUpRight, Cpu, Radio } from 'lucide-react';

export default function LiveThreatTicker({ queries = [], onSelectQuery }) {
  const [filter, setFilter] = useState('ALL'); // ALL, BLOCKED, ALLOWED
  const [search, setSearch] = useState('');

  const filteredQueries = queries.filter(q => {
    if (filter === 'BLOCKED' && q.verdict !== 'BLOCK') return false;
    if (filter === 'ALLOWED' && q.verdict !== 'ALLOW') return false;
    if (search && !q.domain.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-[#0D1322] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              Live DNS Threat Stream
              <span className="px-2 py-0.5 text-xs font-mono bg-gray-800 text-gray-300 rounded-full">
                {filteredQueries.length} Events
              </span>
            </h2>
            <p className="text-xs text-gray-400">Real-time 4-Tier Zero-Trust query telemetry</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-gray-900/90 border border-gray-700/60 rounded-lg text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-full sm:w-44"
          />
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'ALL' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white bg-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('BLOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'BLOCKED' ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'text-gray-400 hover:text-red-400 bg-gray-900'
            }`}
          >
            Blocked
          </button>
          <button
            onClick={() => setFilter('ALLOWED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'ALLOWED' ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-emerald-400 bg-gray-900'
            }`}
          >
            Allowed
          </button>
        </div>
      </div>

      {/* Query Stream List */}
      <div className="divide-y divide-gray-800/60 max-h-[520px] overflow-y-auto mt-2 font-mono">
        {filteredQueries.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No DNS telemetry events found. Run the attack simulator or test a query to view live streaming logs.
          </div>
        ) : (
          filteredQueries.map((q, idx) => {
            const isBlock = q.verdict === 'BLOCK';
            return (
              <div
                key={idx}
                onClick={() => onSelectQuery && onSelectQuery(q)}
                className="py-3 px-2 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-800/40 cursor-pointer transition group"
              >
                {/* Left: Verdict & Domain */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    isBlock ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isBlock ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-200 truncate group-hover:text-blue-400 transition">
                        {q.domain}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                        {q.query_type || 'A'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 hidden sm:inline">
                        {q.protocol || 'Do53'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-0.5">
                      <span className={isBlock ? 'text-red-400 font-medium' : 'text-emerald-400'}>
                        {q.threat_category}
                      </span>
                      <span>•</span>
                      <span className="text-gray-500 truncate">{q.tier}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Latency & Telemetry */}
                <div className="flex items-center space-x-4 self-end sm:self-center flex-shrink-0 text-xs">
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1 text-gray-300">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className={`font-semibold ${q.latency_ms < 20 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {q.latency_ms}ms
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">{q.client_ip}</span>
                  </div>

                  <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded ${
                    isBlock ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {q.action || q.verdict}
                  </span>

                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
