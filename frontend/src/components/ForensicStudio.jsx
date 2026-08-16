import React, { useState } from 'react';
import { FileSearch, Upload, ShieldAlert, CheckCircle, Clock, ArrowRight, Server } from 'lucide-react';
import { api } from '../services/api';

export default function ForensicStudio() {
  const [activeFileTab, setActiveFileTab] = useState('PCAP');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [dragOver, setDragOver] = useState(false);

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
`;
    try {
      const blob = new Blob([sampleZeek], { type: 'text/plain' });
      const file = new File([blob], "incident_trace_dns.log");
      const res = await api.uploadZeek(file);
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="surface-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
              <FileSearch className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Passive Forensic Studio
              </h2>
              <p className="text-[11px] text-zinc-400">Offline batch ingestion of PCAP wire captures and Zeek TSV logs</p>
            </div>
          </div>

          <div className="flex items-center p-0.5 bg-zinc-900 rounded-lg border border-white/[0.06] text-xs font-medium">
            <button
              onClick={() => setActiveFileTab('PCAP')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeFileTab === 'PCAP' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              PCAP Capture
            </button>
            <button
              onClick={() => setActiveFileTab('ZEEK')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeFileTab === 'ZEEK' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Zeek Log TSV
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-5 border border-dashed rounded-xl p-8 text-center transition ${
            dragOver ? 'border-blue-500 bg-blue-950/10' : 'border-white/10 bg-zinc-900/40 hover:border-white/20'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 mb-3 border border-white/10">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200">
              Drop your {activeFileTab === 'PCAP' ? '.pcap / .pcapng' : 'Zeek dns.log'} capture file here
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 mb-4">
              Extracts DNS sessions, correlates C2 beaconing, and isolates compromised hosts.
            </p>

            <div className="flex items-center gap-2.5">
              <label className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg cursor-pointer transition shadow-sm">
                Select File
                <input
                  type="file"
                  accept={activeFileTab === 'PCAP' ? '.pcap,.pcapng,.cap' : '.tsv,.log,.txt'}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={runDemoAnalysis}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition border border-white/10"
              >
                Load Sample Incident Trace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Report Output */}
      {loading && (
        <div className="surface-card p-10 text-center font-mono text-xs text-zinc-400">
          <div className="inline-block w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mb-2.5" />
          <div>Parsing wire packets and running 4-Tier batch evaluation...</div>
        </div>
      )}

      {report && report.status === 'SUCCESS' && (
        <div className="surface-card p-6 space-y-6">
          {/* Top Summary Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  ANALYSIS COMPLETE
                </span>
                <span className="text-xs font-mono font-medium text-zinc-200">{report.filename}</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Parsed in {report.analysis_duration_sec}s</p>
            </div>

            <div className="flex items-center space-x-6 text-right font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block">TOTAL RECORDS</span>
                <span className="text-sm font-semibold text-zinc-200">{report.total_dns_records_parsed || report.total_dns_packets_parsed}</span>
              </div>
              <div className="border-l border-white/[0.08] pl-6">
                <span className="text-[10px] text-zinc-400 block">MALICIOUS IDENTIFIED</span>
                <span className="text-sm font-semibold text-rose-400">{report.malicious_queries_detected} ({report.threat_percentage}%)</span>
              </div>
            </div>
          </div>

          {/* Compromised Host Quarantine Cards */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Identified Compromised Endpoints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {report.compromised_hosts?.map((host, idx) => (
                <div key={idx} className="p-3.5 bg-zinc-900/80 border border-white/[0.06] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-100">{host.ip}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-semibold">
                        {host.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Infection Ratio: <span className="text-rose-400 font-semibold">{host.infection_ratio_pct}%</span> ({host.blocked_queries} / {host.total_queries} queries)
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                      Types: {host.threat_types?.join(', ')}
                    </div>
                  </div>

                  <button className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium rounded border border-white/10 transition">
                    Quarantine
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Parsed Event Log */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2.5">
              Extracted Incident DNS Sessions
            </h3>
            <div className="divide-y divide-white/[0.04] bg-zinc-900/60 rounded-lg border border-white/[0.06] max-h-52 overflow-y-auto font-mono text-xs">
              {report.sample_events?.map((ev, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between hover:bg-white/[0.02]">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${ev.verdict === 'BLOCK' ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                    <span className="text-zinc-200 font-medium">{ev.domain}</span>
                    <span className="text-zinc-400 text-[10px]">({ev.client_ip})</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[11px] ${ev.verdict === 'BLOCK' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {ev.threat_category}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                      ev.verdict === 'BLOCK' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {ev.verdict}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
