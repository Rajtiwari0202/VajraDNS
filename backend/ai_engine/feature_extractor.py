"""
VajraDNS — Lexical and Statistical Domain Feature Extractor
Extracts 15+ orthogonal features from raw domain names to distinguish between 
benign human-registered domains, DGA botnets, and DNS tunneling exfiltration payloads.
"""

import math
import re
from typing import Dict, List, Any, Union

# Common English bigram frequencies (log-probabilities) for naturalness scoring
COMMON_ENGLISH_BIGRAMS = {
    'th': 3.56, 'he': 3.07, 'in': 2.43, 'er': 2.05, 'an': 1.99, 're': 1.85,
    'on': 1.76, 'at': 1.49, 'en': 1.45, 'nd': 1.35, 'ti': 1.34, 'es': 1.34,
    'or': 1.28, 'te': 1.20, 'of': 1.17, 'ed': 1.17, 'is': 1.13, 'it': 1.12,
    'al': 1.09, 'ar': 1.07, 'st': 1.05, 'to': 1.04, 'nt': 1.04, 'ng': 0.95,
    'se': 0.93, 'ha': 0.93, 'as': 0.87, 'ou': 0.87, 'io': 0.83, 'le': 0.83,
    've': 0.83, 'co': 0.79, 'me': 0.79, 'de': 0.76, 'hi': 0.76, 'ri': 0.73,
    'ro': 0.73, 'ic': 0.70, 'ne': 0.69, 'ea': 0.69, 'ra': 0.69, 'ce': 0.65
}

# High-risk TLDs known for malware abuse and dynamic registration
HIGH_RISK_TLDS = {
    'xyz': 0.8, 'top': 0.85, 'tk': 0.95, 'ml': 0.9, 'ga': 0.9, 'cf': 0.9,
    'gq': 0.9, 'bid': 0.85, 'win': 0.8, 'loan': 0.85, 'click': 0.75,
    'country': 0.8, 'biz': 0.7, 'info': 0.6, 'ru': 0.65, 'cn': 0.6
}

# Trusted high-reputation TLDs
TRUSTED_TLDS = {
    'gov': 0.05, 'gov.in': 0.02, 'edu': 0.05, 'ac.in': 0.05, 'mil': 0.01,
    'org': 0.2, 'isro.gov.in': 0.01, 'nic.in': 0.02
}

VOWELS = set('aeiou')
HEX_CHARS = set('0123456789abcdef')


class DomainFeatureExtractor:
    """
    High-performance feature extraction engine for DNS domain names.
    Extracts lexical, statistical, and linguistic properties in <0.05ms.
    """

    @staticmethod
    def clean_domain(domain: str) -> str:
        """Sanitizes and normalizes the domain string."""
        domain = domain.lower().strip()
        if domain.endswith('.'):
            domain = domain[:-1]
        # Remove protocol if accidentally passed
        if domain.startswith(('http://', 'https://')):
            domain = domain.split('://', 1)[1]
        if '/' in domain:
            domain = domain.split('/', 1)[0]
        if ':' in domain:
            domain = domain.split(':', 1)[0]
        return domain

    @staticmethod
    def extract_sld(domain: str) -> str:
        """
        Extracts the Second-Level Domain (SLD) or main domain name without standard TLDs.
        e.g., 'isro.gov.in' -> 'isro', 'google.com' -> 'google', 'q7z8p49m.biz' -> 'q7z8p49m'
        """
        parts = domain.split('.')
        if len(parts) >= 3 and parts[-2] in ('gov', 'ac', 'co', 'org', 'net', 'edu', 'com'):
            return parts[-3]
        elif len(parts) >= 2:
            return parts[-2]
        return parts[0]

    @staticmethod
    def calculate_shannon_entropy(s: str) -> float:
        """
        Computes the Shannon Entropy of string s:
        H(X) = -sum(P(x) * log2(P(x)))
        """
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

    @staticmethod
    def get_max_consecutive_consonants(s: str) -> int:
        """Returns the maximum consecutive consonant count."""
        max_c = 0
        curr_c = 0
        for ch in s:
            if ch.isalpha() and ch not in VOWELS:
                curr_c += 1
                if curr_c > max_c:
                    max_c = curr_c
            else:
                curr_c = 0
        return max_c

    @staticmethod
    def get_max_consecutive_digits(s: str) -> int:
        """Returns the maximum consecutive digit count."""
        max_d = 0
        curr_d = 0
        for ch in s:
            if ch.isdigit():
                curr_d += 1
                if curr_d > max_d:
                    max_d = curr_d
            else:
                curr_d = 0
        return max_d

    @staticmethod
    def calculate_bigram_score(s: str) -> float:
        """
        Calculates the average English bigram likelihood.
        Higher scores mean more natural English syllables.
        """
        clean_s = re.sub(r'[^a-z]', '', s)
        if len(clean_s) < 2:
            return 0.0
        
        score = 0.0
        total_bigrams = len(clean_s) - 1
        for i in range(total_bigrams):
            bg = clean_s[i:i+2]
            score += COMMON_ENGLISH_BIGRAMS.get(bg, 0.05)
        return float(score / total_bigrams)

    @staticmethod
    def get_tld_risk_score(domain: str) -> float:
        """Assigns a risk weight to the TLD."""
        for tld, weight in TRUSTED_TLDS.items():
            if domain.endswith('.' + tld) or domain == tld:
                return weight
        for tld, weight in HIGH_RISK_TLDS.items():
            if domain.endswith('.' + tld):
                return weight
        return 0.4  # Default neutral TLD risk

    @classmethod
    def extract_features(cls, raw_domain: str) -> Dict[str, float]:
        """
        Extracts all 15 numerical features for a given domain name.
        Returns a dictionary of named features suitable for tabular models and vectorization.
        """
        domain = cls.clean_domain(raw_domain)
        sld = cls.extract_sld(domain)
        
        domain_len = len(domain)
        sld_len = len(sld) if sld else 1
        
        # Character breakdown
        num_vowels = sum(1 for ch in sld if ch in VOWELS)
        num_digits = sum(1 for ch in sld if ch.isdigit())
        num_consonants = sum(1 for ch in sld if ch.isalpha() and ch not in VOWELS)
        num_hex = sum(1 for ch in sld if ch in HEX_CHARS)
        num_special = sum(1 for ch in sld if not ch.isalnum())
        
        vowel_ratio = num_vowels / (num_consonants + 1e-5)
        digit_ratio = num_digits / sld_len
        consonant_ratio = num_consonants / sld_len
        hex_ratio = num_hex / sld_len
        special_ratio = num_special / sld_len
        
        # Entropy measurements
        domain_entropy = cls.calculate_shannon_entropy(domain)
        sld_entropy = cls.calculate_shannon_entropy(sld)
        
        # Structural measurements
        subdomain_labels = domain.split('.')
        label_count = len(subdomain_labels)
        max_label_len = max(len(lbl) for lbl in subdomain_labels) if subdomain_labels else 0
        
        # Linguistic & unpronounceability metrics
        max_cons = cls.get_max_consecutive_consonants(sld)
        max_digs = cls.get_max_consecutive_digits(sld)
        bigram_score = cls.calculate_bigram_score(sld)
        tld_risk = cls.get_tld_risk_score(domain)
        
        # Gini Impurity of character set in SLD
        if sld:
            char_counts = {}
            for c in sld:
                char_counts[c] = char_counts.get(c, 0) + 1
            gini = 1.0 - sum((cnt / sld_len) ** 2 for cnt in char_counts.values())
        else:
            gini = 0.0

        return {
            "domain_length": float(domain_len),
            "sld_length": float(sld_len),
            "sld_entropy": float(sld_entropy),
            "domain_entropy": float(domain_entropy),
            "vowel_ratio": float(vowel_ratio),
            "digit_ratio": float(digit_ratio),
            "consonant_ratio": float(consonant_ratio),
            "hex_ratio": float(hex_ratio),
            "special_char_ratio": float(special_ratio),
            "max_consecutive_consonants": float(max_cons),
            "max_consecutive_digits": float(max_digs),
            "bigram_score": float(bigram_score),
            "tld_risk": float(tld_risk),
            "label_count": float(label_count),
            "max_label_length": float(max_label_len),
            "gini_impurity": float(gini)
        }

    @classmethod
    def to_feature_vector(cls, raw_domain: str) -> List[float]:
        """Returns the ordered numerical feature vector for model prediction."""
        features = cls.extract_features(raw_domain)
        return [
            features["domain_length"],
            features["sld_length"],
            features["sld_entropy"],
            features["domain_entropy"],
            features["vowel_ratio"],
            features["digit_ratio"],
            features["consonant_ratio"],
            features["hex_ratio"],
            features["special_char_ratio"],
            features["max_consecutive_consonants"],
            features["max_consecutive_digits"],
            features["bigram_score"],
            features["tld_risk"],
            features["label_count"],
            features["max_label_length"],
            features["gini_impurity"]
        ]
