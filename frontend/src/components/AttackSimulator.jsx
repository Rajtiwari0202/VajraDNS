import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, ShieldAlert, Cpu, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function AttackSimulator({ onAttackTriggered }) {
  const [running, setRunning] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [lastBatch, setLastBatch] = useState(null);

  const triggerAttack = async (type) => {
    setRunning(true);
    setActiveSimulation(type);
    setLastBatch(null);
    try {
      const data = await api.simulateAttack(type);
      setLastBatch(data);
      if (onAttackTriggered) onAttackTriggered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
      setActiveSimulation(null);
    }
  };

  const simulationCards = [
    {
      id: 'dga',
      title: 'Botnet DGA Attack',
      desc: 'Simulates Conficker, Locky, and GameOver Zeus algorithmic C2 domains.',
      badge: 'Tier 3 AI Defense',
      badgeClass: 'badge-rose',
      actionLabel: 'Launch DGA Attack',
      icon: Cpu,
      accentColor: 'text-rose-400'
    },
    {
      id: 'tunneling',
      title: 'DNS Tunneling Exfiltration',
      desc: 'Fires high-entropy Base64/Hex data chunks over TXT records.',
      badge: 'Tier 4 Shannon Shield',
      badgeClass: 'badge-amber',
      actionLabel: 'Launch Tunneling',
      icon: ShieldAlert,
      accentColor: 'text-amber-400'
    },
    {
      id: 'clean',
      title: 'Clean Sovereign Traffic',
      desc: 'Resolves legitimate Indian defense (ISRO, DRDO, NIC) and enterprise domains.',
      badge: 'Tier 1 Cache / Upstream',
      badgeClass: 'badge-emerald',
      actionLabel: 'Send Clean Traffic',
      icon: ShieldCheck,
      accentColor: 'text-emerald-400'
    },
    {
      id: 'all',
      title: 'Full Mixed Traffic Warfare',
      desc: 'Synchronized mixed burst of benign lookups and cyber attack variants.',
      badge: 'Full Pipeline Audit',
      badgeClass: 'badge-blue',
      actionLabel: 'Run Full Simulation',
      icon: Activity,
      accentColor: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel p-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Live Cyber Warfare & Attack Simulator
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inject synthetic algorithmic attacks and clean query streams into the active 4-Tier Zero-Trust Engine
            </p>
          </div>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {simulationCards.map((c) => {
          const Icon = c.icon;
          const isThisRunning = running && activeSimulation === c.id;
          return (
            <div key={c.id} className="card-panel-interactive p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-zinc-900/90 border border-white/10 flex items-center justify-center ${c.accentColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${c.badgeClass}`}>
                    {c.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2">{c.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                  {c.desc}
                </p>
              </div>

              <button
                onClick={() => triggerAttack(c.id)}
                disabled={running}
                className="w-full btn-secondary text-xs font-semibold py-2.5 disabled:opacity-50"
              >
                {isThisRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    <span>Executing Batch...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.actionLabel}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Live Simulation Batch Log */}
      {lastBatch && (
        <div className="card-panel p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Executed Batch Simulation ({lastBatch.simulated_count} Real-Time Events)
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Streamed to Live WebSocket Ticker</span>
          </div>

          <div className="divide-y divide-white/[0.05] max-h-64 overflow-y-auto font-mono text-xs">
            {lastBatch.events?.map((ev, i) => {
              const isBlock = ev.verdict === 'BLOCK';
              return (
                <div key={i} className="py-2.5 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-md transition">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${isBlock ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'}`} />
                    <span className="text-zinc-200 font-medium">{ev.domain}</span>
                    <span className="text-zinc-400 text-[11px]">({ev.client_ip})</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-[11px] ${isBlock ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}`}>
                      {ev.threat_category}
                    </span>
                    <span className="text-zinc-400 text-[11px]">{ev.latency_ms}ms</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase ${
                      isBlock ? 'badge-rose' : 'badge-emerald'
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
