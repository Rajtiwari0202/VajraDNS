"""
VajraDNS — Cyber Attack & Traffic Simulator
Generates realistic traffic batches for live hackathon jury demonstrations:
1. Benign sovereign & enterprise traffic
2. DGA botnet attacks (Conficker, Locky, GameOver Zeus, Banjori)
3. Covert DNS Tunneling & data exfiltration bursts
"""

import time
import random
import string
import requests
from typing import List, Dict, Any

from pipeline.decision_engine import DecisionEngine

CLEAN_DOMAINS = [
    "isro.gov.in", "drdo.gov.in", "nic.in", "digitalindia.gov.in", "meity.gov.in",
    "google.com", "github.com", "cloudflare.com", "aiims.edu", "iitd.ac.in",
    "irctc.co.in", "sbi.co.in", "rbi.org.in", "incometax.gov.in", "wikipedia.org"
]

DGA_SAMPLES = [
    ("q7z8p49m21lk.biz", "Conficker Botnet"),
    ("ab89fc12d09e3a.ru", "Locky Ransomware"),
    ("v1b89qp0z1a789c.org", "GameOver Zeus"),
    ("lkjasdfkjlskdjf.com", "Banjori Infostealer"),
    ("zmnxcbvqwer89.net", "Banjori Infostealer"),
    ("77e8a91bc02d.info", "Locky Ransomware"),
    ("xk99102mzbqp.xyz", "Conficker Botnet"),
    ("c2-cobaltstrike-listener.xyz", "Threat Intel Match"),
    ("ransomware-payment-gateway.top", "Threat Intel Match")
]

TUNNELING_PAYLOADS = [
    ("c2VjcmV0X3Bhc3N3b3JkX2V4Zmls", "tunnel.darknet.cc"),
    ("a7f9c2e0b1d4c8e7a6f5d4e3b2a1", "exfil.payload-drop.biz"),
    ("TXlTdXBlclNlY3JldEtleTEyMzQ1Ng", "data.covert-channel.org"),
    ("48656c6c6f576f726c6446726f6d4953524f", "dns.exfiltration-hub.ru")
]

SOURCE_IPS = [
    "192.168.1.104", "192.168.1.115", "10.0.4.22", "172.16.0.45",
    "192.168.1.200", "10.20.1.55", "172.16.8.99"
]


def run_simulated_batch(attack_type: str = "all") -> List[Dict[str, Any]]:
    """Runs a batch of simulated queries through the decision engine."""
    engine = DecisionEngine.get_instance()
    results = []
    
    # 1. Clean Queries
    if attack_type in ("all", "clean"):
        for d in random.sample(CLEAN_DOMAINS, min(4, len(CLEAN_DOMAINS))):
            src = random.choice(SOURCE_IPS)
            res = engine.process_query(domain=d, rtype="A", client_ip=src, protocol="SIMULATOR")
            results.append(res)
            
    # 2. DGA Botnet Queries
    if attack_type in ("all", "dga"):
        for d, family in random.sample(DGA_SAMPLES, min(4, len(DGA_SAMPLES))):
            src = random.choice(SOURCE_IPS[:3])  # Simulate 1 or 2 infected machines
            res = engine.process_query(domain=d, rtype="A", client_ip=src, protocol="SIMULATOR")
            results.append(res)
            
    # 3. DNS Tunneling Queries
    if attack_type in ("all", "tunneling"):
        for chunk, root in TUNNELING_PAYLOADS:
            src = "192.168.1.104"  # Single compromised insider endpoint
            qname = f"{chunk}.{root}"
            res = engine.process_query(domain=qname, rtype="TXT", client_ip=src, protocol="SIMULATOR")
            results.append(res)
            
    return results


def run_cli_interactive():
    print("=" * 60)
    print("VajraDNS -- Live Cyber Attack Simulator (CLI)")
    print("=" * 60)
    
    print("\nSelect Simulation Mode:")
    print("  [1] Send 10 Clean Sovereign/Enterprise Lookups")
    print("  [2] Launch DGA Botnet Attack (Conficker, Locky, Zeus)")
    print("  [3] Launch Covert DNS Tunneling Exfiltration")
    print("  [4] Launch Mixed Realistic Network Traffic")
    print("  [5] Exit")
    
    while True:
        choice = input("\nEnter choice [1-5]: ").strip()
        if choice == "1":
            print("\n[*] Sending clean queries...")
            res = run_simulated_batch("clean")
        elif choice == "2":
            print("\n[*] Firing DGA botnet queries...")
            res = run_simulated_batch("dga")
        elif choice == "3":
            print("\n[*] Firing DNS tunneling exfiltration payloads...")
            res = run_simulated_batch("tunneling")
        elif choice == "4":
            print("\n[*] Firing full mixed traffic batch...")
            res = run_simulated_batch("all")
        elif choice == "5":
            break
        else:
            print("[!] Invalid choice")
            continue
            
        print(f"\n[+] Processed {len(res)} queries:")
        for r in res:
            verdict_badge = "[BLOCK]" if r["verdict"] == "BLOCK" else "[ALLOW]"
            print(f"  {verdict_badge:<7} | {r['domain']:<38} | {r['tier']:<25} | {r['latency_ms']}ms | {r['threat_category']}")


if __name__ == "__main__":
    run_cli_interactive()
