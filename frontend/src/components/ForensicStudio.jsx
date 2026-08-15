import React, { useState } from 'react';
import { FileSearch, Upload, FileCode, CheckCircle, AlertTriangle, ShieldAlert, Clock, ArrowRight, Download } from 'lucide-react';
import { api } from '../services/api';

export default function ForensicStudio() {
  const [activeFileTab, setActiveFileTab] = useState('PCAP'); // PCAP or ZEEK
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

  // Generate Sample PCAP / Zeek Data directly if user doesn't have a file ready
  const runDemoAnalysis = async () => {
    setLoading(true);
    // Synthetic Zeek TSV with real DGA and tunneling samples
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
      const file = new File([blob], "sample_incident_dns.log");
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
      {/* Header */}
      <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100 font-mono">Passive Forensic Studio</h2>
              <p className="text-xs text-gray-400">Offline batch ingestion of PCAP packet dumps and Zeek TSV logs</p>
            </div>
          </div>

          {/* Mode Switch */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFileTab('PCAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeFileTab === 'PCAP' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              PCAP Network Capture
            </button>
            <button
              onClick={() => setActiveFileTab('ZEEK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeFileTab === 'ZEEK' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              Zeek dns.log TSV
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition ${
            dragOver ? 'border-blue-500 bg-blue-950/20' : 'border-gray-800 bg-gray-950/60 hover:border-gray-700'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-blue-400 mb-3 border border-gray-800">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-sm font-semibold text-gray-200">
              Drag & Drop your {activeFileTab === 'PCAP' ? '.pcap / .pcapng' : 'Zeek dns.log'} file here
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Extracts DNS sessions, correlates C2 beaconing, and identifies infected internal hosts.
            </p>

            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-lg shadow-blue-600/20">
                Browse File
                <input
                  type="file"
                  accept={activeFileTab === 'PCAP' ? '.pcap,.pcapng,.cap' : '.tsv,.log,.txt'}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <button
                onClick={runDemoAnalysis}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl transition border border-gray-700"
              >
                Load Sample Incident Trace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Report Output */}
      {loading && (
        <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-12 text-center font-mono text-sm text-gray-400">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <div>Parsing wire packets and running 4-Tier batch AI evaluation...</div>
        </div>
      )}

      {report && report.status === 'SUCCESS' && (
        <div className="bg-[#0D1322] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Top Summary Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800 font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  ANALYSIS COMPLETE
                </span>
                <span className="text-sm font-bold text-gray-200">{report.filename}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Processed in {report.analysis_duration_sec}s</p>
            </div>

            <div className="flex items-center space-x-4 text-right">
              <div>
                <span className="text-xs text-gray-500 block">TOTAL PACKETS</span>
                <span className="text-lg font-bold text-gray-200">{report.total_dns_records_parsed || report.total_dns_packets_parsed}</span>
              </div>
              <div className="border-l border-gray-800 pl-4">
                <span className="text-xs text-gray-500 block">THREATS IDENTIFIED</span>
                <span className="text-lg font-bold text-red-400">{report.malicious_queries_detected} ({report.threat_percentage}%)</span>
              </div>
            </div>
          </div>

          {/* Compromised Host Quarantine Cards */}
          <div>
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              IDENTIFIED COMPROMISED HOSTS (QUARANTINE LIST)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
              {report.compromised_hosts?.map((host, idx) => (
                <div key={idx} className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-300">{host.ip}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded font-bold">
                        {host.severity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Threat Ratio: <span className="text-red-400 font-bold">{host.infection_ratio_pct}%</span> ({host.blocked_queries} / {host.total_queries} queries)
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Types: {host.threat_types?.join(', ')}
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition shadow">
                    Quarantine Host
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Parsed Event Log */}
          <div>
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-3">
              EXTRACTED INCIDENT SESSIONS
            </h3>
            <div className="divide-y divide-gray-800 bg-gray-950 rounded-xl border border-gray-800 max-h-60 overflow-y-auto font-mono text-xs">
              {report.sample_events?.map((ev, i) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-gray-900">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${ev.verdict === 'BLOCK' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="text-gray-200 font-semibold">{ev.domain}</span>
                    <span className="text-gray-500 text-[10px]">{ev.client_ip}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={ev.verdict === 'BLOCK' ? 'text-red-400' : 'text-emerald-400'}>
                      {ev.threat_category}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      ev.verdict === 'BLOCK' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'
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
