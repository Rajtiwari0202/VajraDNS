import React from 'react';
import { Shield, Activity, Terminal, BarChart2, Database, FileSearch, Zap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isConnected, metrics }) {
  const tabs = [
    { id: 'dashboard', label: 'SOC Console', icon: Activity },
    { id: 'playground', label: 'DNS Inspector & XAI', icon: Terminal },
    { id: 'analytics', label: 'Threat Metrics', icon: BarChart2 },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Database },
    { id: 'forensics', label: 'Forensic Studio', icon: FileSearch },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap }
  ];

  return (
    <header className="border-b border-white/[0.07] bg-[#0A0D14]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Product Meta */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-blue-400 shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                Vajra<span className="text-zinc-400 font-normal">DNS</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800/80 text-zinc-300 rounded border border-white/10">
                SIH1524
              </span>
            </div>
          </div>

          {/* Segmented Navigation */}
          <nav className="hidden md:flex items-center p-0.5 bg-zinc-900/90 rounded-lg border border-white/[0.06]">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Telemetry & Connection Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className={isConnected ? 'text-zinc-300 font-medium' : 'text-rose-400'}>
                {isConnected ? 'Live Telemetry' : 'Offline'}
              </span>
            </div>

            <div className="hidden lg:flex items-center space-x-3 pl-3 border-l border-white/[0.08] text-xs">
              <div>
                <span className="text-zinc-400 text-[11px] block">QUERIES</span>
                <span className="text-white font-mono font-medium text-xs">{metrics?.total_queries || 0}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-[11px] block">BLOCK RATE</span>
                <span className="text-rose-400 font-mono font-medium text-xs">{metrics?.block_rate_pct || 0}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
