import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveThreatTicker from './components/LiveThreatTicker';
import QueryPlayground from './components/QueryPlayground';
import ThreatAnalytics from './components/ThreatAnalytics';
import ThreatIntelManager from './components/ThreatIntelManager';
import ForensicStudio from './components/ForensicStudio';
import AttackSimulator from './components/AttackSimulator';
import { api, connectTelemetrySocket } from './services/api';
import { Shield, Sparkles, X, Layers, Clock, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);

  // Initial Fetch & Live WebSocket Ingestion
  useEffect(() => {
    // Initial stats fetch
    api.getStats().then(data => {
      if (data?.summary) setMetrics(data.summary);
      if (data?.recent_queries) setQueries(data.recent_queries);
    }).catch(console.error);

    // Connect WebSocket
    const cleanupWs = connectTelemetrySocket(
      (payload) => {
        if (payload.type === 'INITIAL_STATE') {
          setMetrics(payload.metrics);
          setQueries(payload.recent_queries || []);
        } else if (payload.type === 'QUERY_EVENT') {
          setQueries(prev => [payload.data, ...prev.slice(0, 500)]);
          if (payload.metrics) setMetrics(payload.metrics);
        }
      },
      (connected) => setIsConnected(connected)
    );

    return () => cleanupWs();
  }, []);

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        metrics={metrics}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: SOC DASHBOARD (Unified View) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <ThreatAnalytics metrics={metrics} />
            <AttackSimulator onAttackTriggered={() => {}} />
            <LiveThreatTicker queries={queries} onSelectQuery={setSelectedQuery} />
          </div>
        )}

        {/* TAB 2: INTERACTIVE PLAYGROUND & XAI */}
        {activeTab === 'playground' && (
          <QueryPlayground onQueryComplete={() => {}} />
        )}

        {/* TAB 3: THREAT ANALYTICS */}
        {activeTab === 'analytics' && (
          <ThreatAnalytics metrics={metrics} />
        )}

        {/* TAB 4: THREAT INTEL & STIX/TAXII */}
        {activeTab === 'threat-intel' && (
          <ThreatIntelManager />
        )}

        {/* TAB 5: PASSIVE FORENSICS (PCAP / ZEEK) */}
        {activeTab === 'forensics' && (
          <ForensicStudio />
        )}

        {/* TAB 6: ATTACK SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <AttackSimulator onAttackTriggered={() => {}} />
            <LiveThreatTicker queries={queries} onSelectQuery={setSelectedQuery} />
          </div>
        )}

      </main>

      {/* Query Detail Modal / Drawer for XAI Attribution */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="surface-card max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 text-xs font-mono font-semibold uppercase rounded border ${
                  selectedQuery.verdict === 'BLOCK' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {selectedQuery.verdict}: {selectedQuery.action}
                </span>
                <span className="text-sm font-mono font-semibold text-zinc-100">{selectedQuery.domain}</span>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-900/80 rounded-lg border border-white/[0.04]">
                <span className="text-zinc-400 text-[10px] block mb-1">DECISION STAGE</span>
                <span className="text-zinc-200 font-semibold">{selectedQuery.tier}</span>
              </div>
              <div className="p-3 bg-zinc-900/80 rounded-lg border border-white/[0.04]">
                <span className="text-zinc-400 text-[10px] block mb-1">THREAT CLASSIFICATION</span>
                <span className={selectedQuery.verdict === 'BLOCK' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {selectedQuery.threat_category}
                </span>
              </div>
              <div className="p-3 bg-zinc-900/80 rounded-lg border border-white/[0.04]">
                <span className="text-zinc-400 text-[10px] block mb-1">LATENCY SLA</span>
                <span className="text-emerald-400 font-semibold">{selectedQuery.latency_ms} ms</span>
              </div>
              <div className="p-3 bg-zinc-900/80 rounded-lg border border-white/[0.04]">
                <span className="text-zinc-400 text-[10px] block mb-1">CLIENT SOURCE IP</span>
                <span className="text-zinc-300 font-semibold">{selectedQuery.client_ip}</span>
              </div>
            </div>

            {/* XAI Explanation */}
            <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-white/[0.04]">
              <span className="text-xs text-blue-400 font-semibold flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Explainable AI (XAI) Feature Attribution
              </span>
              <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950 p-2.5 rounded border border-white/[0.04]">
                {selectedQuery.xai_explanation}
              </p>
            </div>

            {/* Resolved IP List */}
            <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-white/[0.04]">
              <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5 mb-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Resolved DNS Wire Records (TTL: {selectedQuery.ttl}s)
              </span>
              <div className="space-y-1 font-mono">
                {selectedQuery.answers?.map((ans, i) => (
                  <div key={i} className="flex justify-between px-3 py-1.5 bg-zinc-950 rounded text-xs border border-white/[0.03]">
                    <span className="text-zinc-400">{selectedQuery.domain}.</span>
                    <span className={selectedQuery.verdict === 'BLOCK' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {ans}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1 text-right">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#090B10] py-4 text-center text-[11px] font-mono text-zinc-400">
        <p>VajraDNS — Sovereign Autonomous AI Threat Defense Gateway • SIH1524 (ISRO / Space Technology)</p>
      </footer>
    </div>
  );
}
