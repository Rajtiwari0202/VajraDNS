import React from 'react';
import { Shield, Activity, Terminal, BarChart2, Database, FileSearch, Zap, BookOpen } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isConnected, metrics }) {
  const tabs = [
    { id: 'overview', label: 'Whitepaper & Specs', icon: BookOpen },
    { id: 'dashboard', label: 'SOC Console', icon: Activity },
    { id: 'playground', label: 'DNS Inspector & XAI', icon: Terminal },
    { id: 'analytics', label: 'Threat Metrics', icon: BarChart2 },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Database },
    { id: 'forensics', label: 'Forensic Studio', icon: FileSearch },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap }
  ];

  return (
    <header className="border-b border-white/[0.08] bg-[#0D121F]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Meta */}
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner group-hover:border-blue-400/50 transition">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white">
                  Vajra<span className="text-blue-400 font-semibold">DNS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-zinc-800 text-zinc-300 rounded border border-white/10">
                  SIH1524
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-none mt-0.5">Sovereign AI Threat Defense Gateway</p>
            </div>
          </div>

          {/* Segmented Navigation */}
          <nav className="hidden lg:flex items-center p-1 bg-[#131926] rounded-xl border border-white/[0.08]">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Telemetry & Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#131926] border border-white/[0.08] text-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-rose-500'}`} />
              <span className={isConnected ? 'text-zinc-200 font-medium text-[11px]' : 'text-rose-400 text-[11px]'}>
                {isConnected ? 'Telemetry Active' : 'Offline'}
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-4 pl-4 border-l border-white/[0.08]">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block leading-none">Queries</span>
                <span className="text-xs font-mono font-bold text-white mt-1 block">
                  {metrics?.total_queries !== undefined ? metrics.total_queries : 0}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-zinc-400 block leading-none">Block Rate</span>
                <span className="text-xs font-mono font-bold text-rose-400 mt-1 block">
                  {metrics?.block_rate_pct !== undefined ? metrics.block_rate_pct : 0}%
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
