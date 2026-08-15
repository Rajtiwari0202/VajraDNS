import React from 'react';
import { Shield, Zap, Radio, Terminal, BarChart3, Database, FileSearch, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isConnected, metrics }) {
  const tabs = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: Activity },
    { id: 'playground', label: 'DNS Playground & XAI', icon: Terminal },
    { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
    { id: 'threat-intel', label: 'Threat Intel & STIX', icon: Database },
    { id: 'forensics', label: 'PCAP / Zeek Forensics', icon: FileSearch },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap }
  ];

  return (
    <header className="border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  VAJRA<span className="text-blue-500">DNS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-blue-900/60 text-blue-300 rounded border border-blue-700/50">
                  ISRO / SIH1524
                </span>
              </div>
              <p className="text-[11px] text-gray-400 tracking-tight">Autonomous AI Threat Defense & Zero-Trust Resolver</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
              <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
                {isConnected ? 'LIVE WS' : 'OFFLINE'}
              </span>
            </div>

            <div className="hidden lg:flex flex-col text-right text-[11px] font-mono text-gray-400">
              <span className="text-gray-200 font-semibold">{metrics?.total_queries || 0} Queries</span>
              <span className="text-red-400">{metrics?.blocked_queries || 0} Blocked ({metrics?.block_rate_pct || 0}%)</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
