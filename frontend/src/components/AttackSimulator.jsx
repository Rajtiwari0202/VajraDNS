import React, { useState } from 'react';
import { Zap, ShieldAlert, ShieldCheck, Play, CheckCircle2, Terminal } from 'lucide-react';
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

  const simulationCards = [
    {
      id: 'dga',
      title: 'Botnet DGA Attack',
      desc: 'Simulates Conficker, Locky, and GameOver Zeus algorithmic C2 queries.',
      badge: 'Tier 3 AI Defense',
      actionLabel: 'Launch DGA Simulation',
      statusTag: 'Malware Defense'
    },
    {
      id: 'tunneling',
      title: 'DNS Tunneling Exfiltration',
      desc: 'Fires high-entropy Base64/Hex chunks simulating covert channel data theft.',
      badge: 'Tier 4 Anomaly Defense',
      actionLabel: 'Launch Tunneling Simulation',
      statusTag: 'Exfiltration Shield'
    },
    {
      id: 'clean',
      title: 'Clean Sovereign Traffic',
      desc: 'Resolves legitimate Indian defense (ISRO, DRDO, NIC) and enterprise domains.',
      badge: 'Tier 1 Whitelist & Cache',
      actionLabel: 'Send Clean Traffic',
      statusTag: 'Baseline Resolution'
    },
    {
      id: 'all',
      title: 'Full Mixed Traffic Batch',
      desc: 'Synchronized mixed stream of benign lookups and live cyber attack variants.',
      badge: 'Full Pipeline Audit',
      actionLabel: 'Run Mixed Batch',
      statusTag: 'Full-Scale Audit'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-card p-5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Live Threat & Traffic Simulator
            </h2>
            <p className="text-[11px] text-zinc-400">
              Inject synthetic attack patterns and clean traffic batches to audit the 4-Tier Zero-Trust Engine
            </p>
          </div>
        </div>
      </div>

      {/* 4 Clean Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {simulationCards.map((c) => (
          <div key={c.id} className="surface-card p-4 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/[0.08]">
                  {c.statusTag}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">{c.badge}</span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{c.title}</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                {c.desc}
              </p>
            </div>

            <button
              onClick={() => triggerAttack(c.id)}
              disabled={running}
              className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium rounded-lg border border-white/10 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-zinc-400" />
              <span>{c.actionLabel}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Live Simulation Batch Log */}
      {lastBatch && (
        <div className="surface-card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <span className="text-xs text-zinc-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Executed Batch ({lastBatch.simulated_count} Telemetry Events)
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Streamed to WebSocket Hub</span>
          </div>

          <div className="divide-y divide-white/[0.04] max-h-60 overflow-y-auto font-mono text-xs">
            {lastBatch.events?.map((ev, i) => {
              const isBlock = ev.verdict === 'BLOCK';
              return (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isBlock ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                    <span className="text-zinc-200">{ev.domain}</span>
                    <span className="text-zinc-400 text-[10px]">({ev.client_ip})</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[11px] ${isBlock ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ev.threat_category}
                    </span>
                    <span className="text-zinc-400">{ev.latency_ms}ms</span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                      isBlock ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {ev.verdict}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
