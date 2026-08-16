import React, { useState } from 'react';
import { FileSearch, Upload, ShieldAlert, CheckCircle2, Clock, ArrowRight, Server, AlertTriangle, ShieldCheck, Download, Lock } from 'lucide-react';
import { api } from '../services/api';

export default function ForensicStudio() {
  const [activeFileTab, setActiveFileTab] = useState('PCAP');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [quarantinedIps, setQuarantinedIps] = useState(new Set());

  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    setReport(null);
    try {
      let res;
      if (activeFileTab === 'PCAP') {
        res = await api.uploadPcap(file);
      } else {
        res = await api.uploadZeek(file);
      }
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const runDemoAnalysis = async () => {
    setLoading(true);
    const sampleZeek = `#separator \\x09
#set_separator	,
#empty_spec	(empty)
#unset_spec	-
#path	dns
#fields	ts	uid	id.orig_h	id.orig_p	id.resp_h	id.resp_p	proto	trans_id	rtt	query	qclass_name	qtype_name	rcode_name	answers	TTLs
1723450001.12	Cabc123	192.168.1.104	54321	192.168.1.1	53	udp	101	0.012	isro.gov.in	C_INTERNET	A	NOERROR	115.112.238.106	300
1723450002.34	Cabc124	192.168.1.104	54322	192.168.1.1	53	udp	102	0.015	q7z8p49m21lk.biz	C_INTERNET	A	NOERROR	0.0.0.0	60
1723450003.56	Cabc125	192.168.1.104	54323	192.168.1.1	53	udp	103	0.011	ab89fc12d09e3a.ru	C_INTERNET	A	NOERROR	0.0.0.0	60
1723450004.78	Cabc126	192.168.1.115	54324	192.168.1.1	53	udp	104	0.022	c2VjcmV0X3Bhc3N3b3JkX2V4Zmls.tunnel.darknet.cc	C_INTERNET	TXT	NOERROR	0.0.0.0	60
1723450005.90	Cabc127	192.168.1.115	54325	192.168.1.1	53	udp	105	0.010	google.com	C_INTERNET	A	NOERROR	142.250.190.46	300
1723450006.12	Cabc128	10.0.4.22	54326	192.168.1.1	53	udp	106	0.018	c2-cobaltstrike-listener.xyz	C_INTERNET	A	NOERROR	0.0.0.0	60
1723450007.24	Cabc129	10.0.4.22	54327	192.168.1.1	53	udp	107	0.019	dga-locky-9938f.net	C_INTERNET	A	NOERROR	0.0.0.0	60
`;
    try {
      const blob = new Blob([sampleZeek], { type: 'text/plain' });
      const file = new File([blob], "APT29_DNS_Tunnel_Trace.log");
      const res = await api.uploadZeek(file);
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuarantine = (ip) => {
    setQuarantinedIps(prev => {
      const next = new Set(prev);
      if (next.has(ip)) {
        next.delete(ip);
      } else {
        next.add(ip);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-panel p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                Passive Incident Forensics & PCAP Analysis
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Offline wire packet inspection, Zeek log extraction, C2 beacon correlation, and automated host isolation
              </p>
            </div>
          </div>

          <div className="flex items-center p-1 bg-[#131926] rounded-xl border border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setActiveFileTab('PCAP')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeFileTab === 'PCAP' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              PCAP Wire Stream
            </button>
            <button
              onClick={() => setActiveFileTab('ZEEK')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeFileTab === 'ZEEK' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Zeek Log TSV
            </button>
          </div>
        </div>

        {/* Dual Upload Section: Drag & Drop + Instant Incident Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-6">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`lg:col-span-8 border border-dashed rounded-xl p-7 text-center transition-all ${
              dragOver ? 'border-blue-500 bg-blue-950/20' : 'border-white/10 bg-[#0B0F19]/60 hover:border-white/20'
            }`}
          >
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3 border border-white/10 shadow-sm">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Drag and drop your {activeFileTab === 'PCAP' ? '.pcap / .pcapng' : 'Zeek dns.log'} capture file
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-5">
                Automatically extracts DNS transactions, identifies malicious entropy, and flags compromised hosts.
              </p>

              <label className="btn-primary cursor-pointer">
                <span>Select File from Machine</span>
                <input
                  type="file"
                  accept={activeFileTab === 'PCAP' ? '.pcap,.pcapng,.cap' : '.tsv,.log,.txt'}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Quick Incident Sandbox Card */}
          <div className="lg:col-span-4 card-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Pre-Packaged Incident Trace</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">APT29 Covert Tunneling Trace</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Contains simulated DNS tunneling payloads, Conficker algorithmic beacons, and sovereign ISRO queries.
              </p>
            </div>

            <button
              onClick={runDemoAnalysis}
              disabled={loading}
              className="mt-4 w-full btn-secondary text-xs font-semibold py-2.5"
            >
              <FileSearch className="w-4 h-4 text-emerald-400" />
              <span>Load Sample Incident Trace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card-panel p-10 text-center font-mono text-xs text-zinc-400">
          <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-sm font-semibold text-white">Parsing wire packets through 4-Tier Engine...</div>
          <div className="text-xs text-zinc-400 mt-1">Extracting DNS sessions and correlating C2 beacons</div>
        </div>
      )}

      {/* Forensic Report Output */}
      {report && report.status === 'SUCCESS' && (
        <div className="card-panel p-6 space-y-6">
          {/* Top Summary Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded badge-emerald">
                  ANALYSIS COMPLETE
                </span>
                <span className="text-sm font-mono font-bold text-white">{report.filename}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Completed batch evaluation in <span className="text-emerald-400 font-mono font-semibold">{report.analysis_duration_sec}s</span>
              </p>
            </div>

            <div className="flex items-center space-x-6 text-right font-mono text-xs">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase block">Total Sessions</span>
                <span className="text-lg font-bold text-white">{report.total_dns_records_parsed || report.total_dns_packets_parsed}</span>
              </div>
              <div className="border-l border-white/[0.08] pl-6">
                <span className="text-[11px] text-zinc-400 uppercase block">Malicious Detected</span>
                <span className="text-lg font-bold text-rose-400">{report.malicious_queries_detected} ({report.threat_percentage}%)</span>
              </div>
            </div>
          </div>

          {/* Compromised Host Quarantine Cards */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Identified Compromised Endpoints ({report.compromised_hosts?.length || 0})
              </h3>
              <span className="text-xs text-zinc-400 font-mono">Automated Zero-Trust Isolation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {report.compromised_hosts?.map((host, idx) => {
                const isQuarantined = quarantinedIps.has(host.ip);
                return (
                  <div key={idx} className={`p-4 rounded-xl border transition-all ${
                    isQuarantined ? 'bg-rose-950/20 border-rose-500/40' : 'bg-zinc-900/80 border-white/[0.08]'
                  } flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-white">{host.ip}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded badge-rose">
                          {host.severity}
                        </span>
                        {isQuarantined && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-600 text-white flex items-center gap-1">
                            <Lock className="w-3 h-3" /> QUARANTINED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1.5 font-sans">
                        Infection Ratio: <span className="text-rose-400 font-mono font-bold">{host.infection_ratio_pct}%</span> ({host.blocked_queries} / {host.total_queries} queries malicious)
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Threat Types: <span className="text-zinc-200">{host.threat_types?.join(', ')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleQuarantine(host.ip)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border ${
                        isQuarantined
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10'
                          : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isQuarantined ? 'Release' : 'Quarantine'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Parsed Event Log */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Extracted Incident DNS Sessions
            </h3>
            <div className="divide-y divide-white/[0.05] bg-[#0B0F19] rounded-xl border border-white/[0.08] max-h-56 overflow-y-auto font-mono text-xs">
              {report.sample_events?.map((ev, i) => {
                const isBlock = ev.verdict === 'BLOCK';
                return (
                  <div key={i} className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                    <div className="flex items-center space-x-3">
                      <span className={`w-2 h-2 rounded-full ${isBlock ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                      <span className="text-zinc-100 font-medium">{ev.domain}</span>
                      <span className="text-zinc-400 text-[11px]">({ev.client_ip})</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-[11px] ${isBlock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {ev.threat_category}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${
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

        </div>
      )}
    </div>
  );
}
