import React, { useState } from 'react';
import { Zap, ShieldAlert, ShieldCheck, Flame, Radio, Play, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AttackSimulator({ onAttackTriggered }) {
  const [running, setRunning] = useState(false);
  const [lastBatch, setLastBatch] = useState(null);

  const triggerAttack = async (type) => {
    setRunning(true);
    setLastBatch(null);
    try {
      const data = await api.simulateAttack(type);
      setLastBatch(data);
      if (onAttackTriggered) onAttackTriggered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 font-mono">Live Cyber Attack & Traffic Simulator</h2>
            <p className="text-xs text-gray-400">Launch real-time DGA botnet attacks, covert DNS tunneling bursts, and clean queries for live demonstration</p>
          </div>
        </div>
      </div>

      {/* 4 Simulation Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: DGA Botnet Attack */}
        <div className="bg-[#0D1322] border border-red-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-red-500 transition">
          <div>
            <div className="flex items-center space-x-2 text-red-400 font-mono text-xs font-bold mb-2">
              <Zap className="w-4 h-4" />
              <span>BOTNET DGA ATTACK</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fires randomized domain generation queries simulating Conficker, Locky, and GameOver Zeus C2 lookups.
            </p>
          </div>
          <button
            onClick={() => triggerAttack('dga')}
            disabled={running}
            className="mt-4 w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch DGA Attack</span>
          </button>
        </div>

        {/* Card 2: DNS Tunneling Exfiltration */}
        <div className="bg-[#0D1322] border border-yellow-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-yellow-500 transition">
          <div>
            <div className="flex items-center space-x-2 text-yellow-400 font-mono text-xs font-bold mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>COVERT DNS TUNNELING</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fires high-entropy Base64/Hex data chunks via TXT and A records simulating active data theft.
            </p>
          </div>
          <button
            onClick={() => triggerAttack('tunneling')}
            disabled={running}
            className="mt-4 w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold font-mono rounded-xl transition shadow-lg shadow-yellow-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch DNS Tunneling</span>
          </button>
        </div>

        {/* Card 3: Clean Sovereign Traffic */}
        <div className="bg-[#0D1322] border border-emerald-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500 transition">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>CLEAN SOVEREIGN TRAFFIC</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Resolves legitimate Indian defense, space (ISRO, DRDO, NIC), and enterprise domains with sub-25ms latency.
            </p>
          </div>
          <button
            onClick={() => triggerAttack('clean')}
            disabled={running}
            className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Send Clean Queries</span>
          </button>
        </div>

        {/* Card 4: Full Mixed Cyber Warfare */}
        <div className="bg-[#0D1322] border border-purple-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-purple-500 transition">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold mb-2">
              <Flame className="w-4 h-4" />
              <span>FULL MIXED SIMULATION</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Triggers a synchronized mixed batch of clean, DGA, and tunneling queries simultaneously.
            </p>
          </div>
          <button
            onClick={() => triggerAttack('all')}
            disabled={running}
            className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-mono rounded-xl transition shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Full Warfare Sim</span>
          </button>
        </div>

      </div>

      {/* Live Simulation Batch Log */}
      {lastBatch && (
        <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl font-mono">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
            <span className="text-xs text-gray-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SIMULATED BATCH EXECUTED ({lastBatch.simulated_count} QUERIES)
            </span>
            <span className="text-xs text-gray-500">Events streamed over WebSockets</span>
          </div>

          <div className="divide-y divide-gray-800/80 max-h-72 overflow-y-auto text-xs">
            {lastBatch.events?.map((ev, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${ev.verdict === 'BLOCK' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className="text-gray-200 font-semibold">{ev.domain}</span>
                  <span className="text-gray-500 text-[10px]">{ev.client_ip}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={ev.verdict === 'BLOCK' ? 'text-red-400' : 'text-emerald-400'}>
                    {ev.threat_category}
                  </span>
                  <span className="text-gray-500">{ev.latency_ms}ms</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    ev.verdict === 'BLOCK' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {ev.verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
