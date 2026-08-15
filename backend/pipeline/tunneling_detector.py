"""
VajraDNS — Statistical DNS Tunneling & Covert Data Exfiltration Detector
Identifies covert channel tools (iodine, dnscat2, DNSExfiltrator) by analyzing
entropy, payload length, base64/hex encoding distributions, and query burst profiles.
"""

import time
import math
import re
from typing import Dict, Any, List, Optional
from collections import defaultdict

BASE64_PATTERN = re.compile(r'^[A-Za-z0-9+/=_-]+$')
HEX_PATTERN = re.compile(r'^[0-9a-fA-F]+$')


class DNSTunnelingDetector:
    """
    Tier 4 Statistical & Behavioral DNS Tunneling Detector.
    Detects high-volume, encrypted, or Base64/Hex chunked exfiltration queries.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        # Client query tracking: ip -> list of (timestamp, domain, query_type)
        self.client_history = defaultdict(list)
        self.history_window_sec = 30.0
        self.subdomain_burst_threshold = 6  # 6+ high-entropy subdomains in 30s triggers alert

    @staticmethod
    def calculate_entropy(s: str) -> float:
        if not s:
            return 0.0
        length = len(s)
        freqs = {}
        for char in s:
            freqs[char] = freqs.get(char, 0) + 1
        entropy = 0.0
        for count in freqs.values():
            p = count / length
            entropy -= p * math.log2(p)
        return float(entropy)

    def analyze_query(self, domain: str, rtype: str = "A", client_ip: str = "127.0.0.1") -> Dict[str, Any]:
        """
        Analyzes a single DNS query for tunneling indicators.
        Returns detection verdict, risk score, and anomaly breakdown.
        """
        domain_clean = domain.lower().strip()
        labels = domain_clean.split('.')
        
        # Extract potential payload (everything except root domain and TLD)
        if len(labels) >= 3:
            subdomain_payload = '.'.join(labels[:-2])
            longest_label = max(labels[:-2], key=len)
        else:
            subdomain_payload = labels[0] if labels else ""
            longest_label = subdomain_payload

        payload_len = len(subdomain_payload)
        longest_label_len = len(longest_label)
        entropy = self.calculate_entropy(longest_label)
        
        # Check encoding patterns
        is_hex = bool(HEX_PATTERN.match(longest_label)) and longest_label_len >= 12
        is_b64 = bool(BASE64_PATTERN.match(longest_label)) and longest_label_len >= 16
        
        reasons = []
        tunneling_score = 0.0
        
        # Rule 1: High Entropy + Long Subdomain Label
        if longest_label_len >= 28 and entropy >= 3.6:
            tunneling_score += 45.0
            reasons.append(f"High-entropy long label (Len: {longest_label_len}, Entropy: {entropy:.2f})")
        elif longest_label_len >= 16 and entropy >= 3.4:
            tunneling_score += 30.0
            reasons.append(f"Elevated entropy payload (Len: {longest_label_len}, Entropy: {entropy:.2f})")
            
        # Rule 2: Encoded Binary Signature (Hex or Base64 payload)
        if is_hex:
            tunneling_score += 30.0
            reasons.append(f"Hex-encoded data chunk detected ({longest_label_len} chars)")
        elif is_b64 and longest_label_len >= 16:
            tunneling_score += 25.0
            reasons.append(f"Base64 data chunk signature detected ({longest_label_len} chars)")
            
        # Rule 3: Abnormal Query Type (TXT or NULL queries with large payloads)
        if rtype.upper() in ("TXT", "NULL") and longest_label_len >= 14:
            tunneling_score += 25.0
            reasons.append(f"Suspicious {rtype.upper()} query with payload-bearing label")
            
        # Rule 4: Total Domain Length Threshold
        if len(domain_clean) >= 45:
            tunneling_score += 20.0
            reasons.append(f"Excessive domain string length ({len(domain_clean)} bytes)")
            
        # Rule 5: Client Subdomain Burst Rate
        now = time.time()
        # Clean older history
        self.client_history[client_ip] = [
            (t, d, q) for (t, d, q) in self.client_history[client_ip]
            if now - t <= self.history_window_sec
        ]
        self.client_history[client_ip].append((now, domain_clean, rtype))
        
        recent_count = len(self.client_history[client_ip])
        if recent_count >= self.subdomain_burst_threshold:
            tunneling_score += 25.0
            reasons.append(f"High burst frequency from client ({recent_count} queries / 30s)")
            
        is_tunneling = tunneling_score >= 45.0
        
        return {
            "is_tunneling": is_tunneling,
            "tunneling_score": min(100.0, round(tunneling_score, 1)),
            "payload_length": payload_len,
            "longest_label_length": longest_label_len,
            "entropy": round(entropy, 2),
            "is_hex_encoded": is_hex,
            "is_base64_encoded": is_b64,
            "reasons": reasons if reasons else ["Normal query structure"]
        }
