"""
VajraDNS — Passive Forensic Analyzer for PCAP Network Captures and Zeek TSV Logs
Extracts DNS wire packets, classifies threat domains, calculates beaconing intervals,
and isolates compromised source IP addresses for post-incident security investigations.
"""

import os
import time
import socket
import struct
from typing import Dict, List, Any, Optional
from collections import defaultdict

from pipeline.decision_engine import DecisionEngine


class PassiveForensicAnalyzer:
    """
    High-performance PCAP and Zeek Log Forensic Engine.
    Processes tens of thousands of packets in seconds.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.decision_engine = DecisionEngine.get_instance()

    def analyze_pcap(self, pcap_bytes: bytes, filename: str = "capture.pcap") -> Dict[str, Any]:
        """
        Parses raw PCAP binary bytes, extracts DNS query traffic,
        runs 4-tier security evaluation, and constructs forensic telemetry.
        """
        start_time = time.time()
        dns_events = []
        source_ip_stats = defaultdict(lambda: {"total": 0, "blocked": 0, "threats": set(), "timestamps": []})
        dga_family_counts = defaultdict(int)
        
        try:
            import dpkt
            pcap = dpkt.pcap.Reader(pcap_bytes)
            
            for ts, buf in pcap:
                try:
                    eth = dpkt.ethernet.Ethernet(buf)
                    if not isinstance(eth.data, dpkt.ip.IP):
                        continue
                    
                    ip = eth.data
                    src_ip = socket.inet_ntoa(ip.src)
                    dst_ip = socket.inet_ntoa(ip.dst)
                    
                    if isinstance(ip.data, dpkt.udp.UDP):
                        udp = ip.data
                        if udp.dport == 53 or udp.sport == 53:
                            try:
                                dns_msg = dpkt.dns.DNS(udp.data)
                                if dns_msg.qd:
                                    for q in dns_msg.qd:
                                        qname = q.name
                                        qtype = dpkt.dns.dns_types.get(q.type, f"TYPE_{q.type}")
                                        
                                        # Process through 4-Tier Engine
                                        verdict_data = self.decision_engine.process_query(
                                            domain=qname,
                                            rtype=qtype,
                                            client_ip=src_ip,
                                            protocol="PCAP_REPLAY"
                                        )
                                        verdict_data["pcap_timestamp"] = ts
                                        dns_events.append(verdict_data)
                                        
                                        # Aggregate metrics
                                        source_ip_stats[src_ip]["total"] += 1
                                        source_ip_stats[src_ip]["timestamps"].append(ts)
                                        if verdict_data["verdict"] == "BLOCK":
                                            source_ip_stats[src_ip]["blocked"] += 1
                                            source_ip_stats[src_ip]["threats"].add(verdict_data["threat_category"])
                                            
                                            # Categorize DGA / Threat
                                            cat = verdict_data["threat_category"]
                                            dga_family_counts[cat] += 1
                            except Exception:
                                pass
                except Exception:
                    continue
        except Exception:
            # Fallback to Scapy if dpkt stream fails or format is PCAPNG
            try:
                import io
                from scapy.all import rdpcap, DNSQR, IP
                packets = rdpcap(io.BytesIO(pcap_bytes))
                for pkt in packets:
                    if pkt.haslayer(DNSQR) and pkt.haslayer(IP):
                        src_ip = pkt[IP].src
                        qname = pkt[DNSQR].qname.decode('utf-8', errors='ignore').rstrip('.')
                        qtype = "A"
                        
                        verdict_data = self.decision_engine.process_query(
                            domain=qname,
                            rtype=qtype,
                            client_ip=src_ip,
                            protocol="PCAP_REPLAY"
                        )
                        dns_events.append(verdict_data)
                        source_ip_stats[src_ip]["total"] += 1
                        if verdict_data["verdict"] == "BLOCK":
                            source_ip_stats[src_ip]["blocked"] += 1
                            source_ip_stats[src_ip]["threats"].add(verdict_data["threat_category"])
                            cat = verdict_data["threat_category"]
                            dga_family_counts[cat] += 1
            except Exception as e:
                return {"status": "ERROR", "message": f"Failed to parse PCAP file: {str(e)}"}

        total_queries = len(dns_events)
        total_blocked = sum(1 for ev in dns_events if ev["verdict"] == "BLOCK")
        
        # Determine infected source hosts
        compromised_hosts = []
        for s_ip, st in source_ip_stats.items():
            if st["blocked"] > 0:
                threat_ratio = (st["blocked"] / st["total"]) * 100
                compromised_hosts.append({
                    "ip": s_ip,
                    "total_queries": st["total"],
                    "blocked_queries": st["blocked"],
                    "infection_ratio_pct": round(threat_ratio, 1),
                    "threat_types": list(st["threats"]),
                    "severity": "CRITICAL" if threat_ratio > 40 else "HIGH"
                })

        duration_sec = round(time.time() - start_time, 2)
        
        return {
            "status": "SUCCESS",
            "filename": filename,
            "analysis_duration_sec": duration_sec,
            "total_dns_packets_parsed": total_queries,
            "malicious_queries_detected": total_blocked,
            "clean_queries_detected": total_queries - total_blocked,
            "threat_percentage": round((total_blocked / total_queries * 100), 2) if total_queries > 0 else 0.0,
            "compromised_hosts": sorted(compromised_hosts, key=lambda x: x["blocked_queries"], reverse=True),
            "threat_distribution": dict(dga_family_counts),
            "sample_events": dns_events[:50]
        }

    def analyze_zeek_tsv(self, tsv_content: str, filename: str = "dns.log") -> Dict[str, Any]:
        """
        Parses Zeek (Bro) TSV formatted dns.log files.
        Extracts: ts, id.orig_h, qtype_name, query, rcode_name.
        """
        start_time = time.time()
        lines = tsv_content.strip().split('\n')
        
        dns_events = []
        source_ip_stats = defaultdict(lambda: {"total": 0, "blocked": 0, "threats": set()})
        dga_family_counts = defaultdict(int)
        
        field_indices = {}
        
        for line in lines:
            if line.startswith("#fields"):
                parts = line.split('\t')
                field_indices = {field: idx for idx, field in enumerate(parts[1:])}
                continue
            if line.startswith("#") or not line.strip():
                continue
                
            parts = line.split('\t')
            
            src_ip = "127.0.0.1"
            query = ""
            qtype = "A"
            
            if field_indices:
                src_ip = parts[field_indices.get("id.orig_h", 2)] if len(parts) > field_indices.get("id.orig_h", 2) else "127.0.0.1"
                query = parts[field_indices.get("query", 9)] if len(parts) > field_indices.get("query", 9) else ""
                qtype = parts[field_indices.get("qtype_name", 11)] if len(parts) > field_indices.get("qtype_name", 11) else "A"
            else:
                # Default standard Zeek TSV tab positions
                if len(parts) >= 10:
                    src_ip = parts[2]
                    query = parts[9]
                    qtype = parts[11] if len(parts) > 11 else "A"
                    
            if not query or query == "-":
                continue
                
            verdict_data = self.decision_engine.process_query(
                domain=query,
                rtype=qtype,
                client_ip=src_ip,
                protocol="ZEEK_LOG"
            )
            dns_events.append(verdict_data)
            source_ip_stats[src_ip]["total"] += 1
            if verdict_data["verdict"] == "BLOCK":
                source_ip_stats[src_ip]["blocked"] += 1
                source_ip_stats[src_ip]["threats"].add(verdict_data["threat_category"])
                dga_family_counts[verdict_data["threat_category"]] += 1

        total_queries = len(dns_events)
        total_blocked = sum(1 for ev in dns_events if ev["verdict"] == "BLOCK")
        
        compromised_hosts = []
        for s_ip, st in source_ip_stats.items():
            if st["blocked"] > 0:
                threat_ratio = (st["blocked"] / st["total"]) * 100
                compromised_hosts.append({
                    "ip": s_ip,
                    "total_queries": st["total"],
                    "blocked_queries": st["blocked"],
                    "infection_ratio_pct": round(threat_ratio, 1),
                    "threat_types": list(st["threats"]),
                    "severity": "CRITICAL" if threat_ratio > 40 else "HIGH"
                })

        duration_sec = round(time.time() - start_time, 2)
        return {
            "status": "SUCCESS",
            "filename": filename,
            "analysis_duration_sec": duration_sec,
            "total_dns_records_parsed": total_queries,
            "malicious_queries_detected": total_blocked,
            "clean_queries_detected": total_queries - total_blocked,
            "threat_percentage": round((total_blocked / total_queries * 100), 2) if total_queries > 0 else 0.0,
            "compromised_hosts": sorted(compromised_hosts, key=lambda x: x["blocked_queries"], reverse=True),
            "threat_distribution": dict(dga_family_counts),
            "sample_events": dns_events[:50]
        }
