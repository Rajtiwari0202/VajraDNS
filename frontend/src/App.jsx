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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        metrics={metrics}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: SOC DASHBOARD (Unified View) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <ThreatAnalytics metrics={metrics} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <LiveThreatTicker queries={queries} onSelectQuery={setSelectedQuery} />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <AttackSimulator onAttackTriggered={() => {}} />
              </div>
            </div>
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
          <div className="space-y-8">
            <AttackSimulator onAttackTriggered={() => {}} />
            <LiveThreatTicker queries={queries} onSelectQuery={setSelectedQuery} />
          </div>
        )}

      </main>

      {/* Query Detail Modal / Drawer for XAI Attribution */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded ${
                  selectedQuery.verdict === 'BLOCK' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {selectedQuery.verdict}: {selectedQuery.action}
                </span>
                <span className="text-base font-bold text-gray-100">{selectedQuery.domain}</span>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-1 rounded-lg bg-gray-900 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">DECISION STAGE</span>
                <span className="text-gray-200 font-bold">{selectedQuery.tier}</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">THREAT CATEGORY</span>
                <span className={selectedQuery.verdict === 'BLOCK' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedQuery.threat_category}
                </span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">RESPONSE LATENCY</span>
                <span className="text-emerald-400 font-bold">{selectedQuery.latency_ms} ms</span>
              </div>
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-gray-500 block mb-1">CLIENT SOURCE IP</span>
                <span className="text-gray-300 font-bold">{selectedQuery.client_ip}</span>
              </div>
            </div>

            {/* XAI Explanation */}
            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-xs text-indigo-400 font-bold flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4" /> Explainable AI (XAI) Reasoning
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedQuery.xai_explanation}
              </p>
            </div>

            {/* Resolved IP List */}
            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4" /> Returned DNS Answers (TTL: {selectedQuery.ttl}s)
              </span>
              <div className="space-y-1">
                {selectedQuery.answers?.map((ans, i) => (
                  <div key={i} className="flex justify-between px-3 py-1.5 bg-gray-900 rounded text-xs">
                    <span className="text-gray-400">{selectedQuery.domain}</span>
                    <span className={selectedQuery.verdict === 'BLOCK' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {ans}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#080C14] py-6 text-center text-xs font-mono text-gray-500">
        <p>VajraDNS — Autonomous AI Threat Defense Gateway • Built for SIH1524 (ISRO / Space Technology)</p>
      </footer>
    </div>
  );
}
