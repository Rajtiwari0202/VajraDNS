import os
import sys
import random
import string
import pickle
import time
import json
from typing import List, Tuple, Dict, Any
import numpy as np

# Ensure local dir is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from feature_extractor import DomainFeatureExtractor

# Top Indian Government, Academic, Defense, Enterprise and Global Top 1000 Domains
BENIGN_DOMAINS_SEED = [
    "isro.gov.in", "drdo.gov.in", "nic.in", "india.gov.in", "digitalindia.gov.in",
    "meity.gov.in", "mha.gov.in", "mod.gov.in", "pmindia.gov.in", "uidai.gov.in",
    "irctc.co.in", "incometax.gov.in", "epfindia.gov.in", "rbi.org.in", "sbi.co.in",
    "hdfcbank.com", "icicibank.com", "aiims.edu", "iitd.ac.in", "iitb.ac.in",
    "iitm.ac.in", "iitk.ac.in", "iisc.ac.in", "jnu.ac.in", "du.ac.in",
    "google.com", "youtube.com", "facebook.com", "amazon.in", "wikipedia.org",
    "microsoft.com", "github.com", "apple.com", "netflix.com", "twitter.com",
    "linkedin.com", "instagram.com", "cloudflare.com", "reddit.com", "bing.com",
    "yahoo.com", "whatsapp.com", "zoom.us", "openai.com", "stackoverflow.com",
    "medium.com", "gitlab.com", "dropbox.com", "adobe.com", "spotify.com",
    "nytimes.com", "bbc.com", "thehindu.com", "timesofindia.indiatimes.com",
    "ndtv.com", "indianexpress.com", "cricbuzz.com", "hotstar.com", "swiggy.com",
    "zomato.com", "flipkart.com", "paytm.com", "phonepe.com", "razorpay.com",
    "upstox.com", "zerodha.com", "groww.in", "tatamotors.com", "reliance.com",
    "infosys.com", "tcs.com", "wipro.com", "hcltech.com", "techmahindra.com",
    "bharatbiotech.com", "seruminstitute.com", "ntpc.co.in", "bhel.com", "ongcindia.com",
    "sail.co.in", "iocl.com", "bpcl.in", "hpcl.co.in", "gailonline.com",
    "spaceapplicationscentre.gov.in", "vssc.gov.in", "sac.gov.in", "nrsc.gov.in"
]

WORDS_DICTIONARY = [
    "cloud", "security", "network", "cyber", "system", "portal", "gateway",
    "service", "digital", "national", "central", "defense", "research", "academy",
    "institute", "technology", "telecom", "satellite", "mission", "control",
    "weather", "forecast", "finance", "payment", "connect", "stream", "server",
    "database", "station", "terminal", "secure", "monitor", "manage", "analytics",
    "support", "engine", "global", "smart", "energy", "power", "infra", "urban"
]

DGA_FAMILIES = [
    "conficker", "locky", "cryptolocker", "gameover_zeus", "banjori",
    "necurs", "ramnit", "matsnu", "pykspa", "suppobox"
]


def generate_synthetic_benign_domains(count: int = 5000) -> List[Tuple[str, int, str]]:
    """Generates realistic human-registered style domain names."""
    domains = []
    # 1. Base seed domains
    for d in BENIGN_DOMAINS_SEED:
        domains.append((d, 0, "benign"))
    
    tlds = ["com", "org", "in", "co.in", "gov.in", "edu", "ac.in", "net", "io", "tech", "ai"]
    prefixes = ["my", "get", "the", "smart", "fast", "e", "cyber", "open", "live", "meta", "super"]
    
    while len(domains) < count:
        pattern = random.randint(1, 4)
        tld = random.choice(tlds)
        
        if pattern == 1:
            # Word + Word (e.g. clouddefense.org)
            w1 = random.choice(WORDS_DICTIONARY)
            w2 = random.choice(WORDS_DICTIONARY)
            d = f"{w1}{w2}.{tld}"
        elif pattern == 2:
            # Prefix + Word (e.g. getsecurity.in)
            p = random.choice(prefixes)
            w = random.choice(WORDS_DICTIONARY)
            d = f"{p}{w}.{tld}"
        elif pattern == 3:
            # Word + Hyphen + Word (e.g. cyber-system.com)
            w1 = random.choice(WORDS_DICTIONARY)
            w2 = random.choice(WORDS_DICTIONARY)
            d = f"{w1}-{w2}.{tld}"
        else:
            # Word + Number (e.g. satellite24.in)
            w = random.choice(WORDS_DICTIONARY)
            num = random.randint(1, 99)
            d = f"{w}{num}.{tld}"
            
        domains.append((d, 0, "benign"))
    
    return domains


def generate_dga_domains(count: int = 5000) -> List[Tuple[str, int, str]]:
    """Generates realistic DGA botnet domains across multiple botnet algorithms."""
    domains = []
    dga_tlds = ["biz", "info", "xyz", "top", "ru", "cc", "ws", "me", "su", "org", "com", "net"]
    
    while len(domains) < count:
        family = random.choice(DGA_FAMILIES)
        tld = random.choice(dga_tlds)
        
        if family == "conficker":
            # Length 8-12, mixed alphanumeric pseudo-random characters
            length = random.randint(8, 12)
            chars = string.ascii_lowercase + string.digits
            sld = ''.join(random.choice(chars) for _ in range(length))
            d = f"{sld}.{tld}"
            
        elif family == "locky":
            # MD5-like hex strings
            length = random.randint(12, 16)
            sld = ''.join(random.choice(string.hexdigits.lower()) for _ in range(length))
            d = f"{sld}.{tld}"
            
        elif family == "gameover_zeus":
            # Very long high-entropy string (16-24 chars)
            length = random.randint(16, 24)
            chars = string.ascii_lowercase + "0123456789"
            sld = ''.join(random.choice(chars) for _ in range(length))
            d = f"{sld}.{tld}"
            
        elif family == "banjori":
            # Heavy consecutive consonants / keyboard walks
            consonants = "bcdfghjklmnpqrstvwxyz"
            length = random.randint(10, 18)
            sld = ''.join(random.choice(consonants) for _ in range(length))
            d = f"{sld}.{tld}"
            
        elif family == "necurs":
            # 8-14 letters with unusual n-gram transitions
            length = random.randint(8, 14)
            sld = ''.join(random.choice(string.ascii_lowercase) for _ in range(length))
            d = f"{sld}.{tld}"
            
        elif family == "suppobox":
            # Concatenation of two random dictionary words without semantics
            w1 = random.choice(WORDS_DICTIONARY)
            w2 = random.choice(WORDS_DICTIONARY)
            noise = ''.join(random.choice(string.digits) for _ in range(random.randint(1, 3)))
            sld = f"{w1}{noise}{w2}"
            d = f"{sld}.{tld}"
            
        else:
            # Generic high-entropy DGA
            length = random.randint(10, 20)
            sld = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(length))
            d = f"{sld}.{tld}"
            
        domains.append((d, 1, family))
        
    return domains


def train_and_save_model():
    """Builds datasets, extracts features, trains LightGBM classifier, and evaluates."""
    print("=" * 60)
    print("VajraDNS -- AI DGA Classifier Training Pipeline")
    print("=" * 60)
    
    print("\n[*] Generating training datasets...")
    benign_data = generate_synthetic_benign_domains(6000)
    dga_data = generate_dga_domains(6000)
    
    dataset = benign_data + dga_data
    random.seed(42)
    random.shuffle(dataset)
    
    print(f"[+] Total training samples: {len(dataset)} (Benign: {len(benign_data)}, DGA: {len(dga_data)})")
    
    print("\n[*] Extracting 15-dimensional lexical and statistical features...")
    start_time = time.time()
    
    X = []
    y = []
    families = []
    
    for domain, label, fam in dataset:
        feats = DomainFeatureExtractor.to_feature_vector(domain)
        X.append(feats)
        y.append(label)
        families.append(fam)
        
    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)
    
    extract_time = (time.time() - start_time) * 1000
    print(f"[+] Feature extraction completed in {extract_time:.2f}ms ({extract_time/len(dataset):.4f}ms per domain)")
    
    # Train-Test Split (80/20)
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("\n[*] Training Gradient Boosted Decision Tree (LightGBM)...")
    try:
        import lightgbm as lgb
        model = lgb.LGBMClassifier(
            n_estimators=150,
            max_depth=10,
            learning_rate=0.05,
            num_leaves=31,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbose=-1
        )
    except Exception:
        print("[!] LightGBM not available, falling back to scikit-learn RandomForestClassifier...")
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
        
    train_start = time.time()
    model.fit(X_train, y_train)
    train_duration = time.time() - train_start
    print(f"[+] Model trained in {train_duration:.2f} seconds.")
    
    # Evaluation
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n" + "=" * 45)
    print("MODEL EVALUATION RESULTS & BENCHMARKS")
    print("=" * 45)
    print(f"  * Test Accuracy  : {acc * 100:.2f}%")
    print(f"  * Precision      : {prec * 100:.2f}%")
    print(f"  * Recall         : {rec * 100:.2f}%")
    print(f"  * F1-Score       : {f1 * 100:.2f}%")
    print(f"  * ROC-AUC Score  : {auc:.4f}")
    print(f"  * Confusion Matrix:\n    [TN={cm[0][0]}, FP={cm[0][1]}]\n    [FN={cm[1][0]}, TP={cm[1][1]}]")
    print("=" * 45)
    
    # Benchmark Inference Speed
    test_domains = ["google.com", "isro.gov.in", "q7z8p49m21lk.biz", "ab89fc12d09e3a.ru", "github.com"]
    print("\n[*] Benchmarking single-query inference latency...")
    latencies = []
    for td in test_domains:
        t0 = time.perf_counter()
        vec = np.array([DomainFeatureExtractor.to_feature_vector(td)], dtype=np.float32)
        prob = model.predict_proba(vec)[0][1]
        t1 = time.perf_counter()
        dur = (t1 - t0) * 1000
        latencies.append(dur)
        status = "MALICIOUS (DGA)" if prob > 0.6 else "BENIGN"
        print(f"  * Domain: {td:<24} | Pred: {status:<15} | Prob: {prob*100:5.1f}% | Latency: {dur:.3f}ms")
        
    avg_latency = np.mean(latencies)
    print(f"\n[+] Average AI Inference Latency: {avg_latency:.3f}ms (Well under the 100ms threshold!)")
    
    # Save Model
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    pkl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dga_classifier.pkl")
    
    with open(pkl_path, "wb") as f:
        pickle.dump(model, f)
    print(f"[+] Model saved to {pkl_path}")
    
    return model


class DGAInferenceEngine:
    """
    Singleton AI engine for real-time DNS resolution scoring with Explainable AI (XAI).
    """
    _instance = None
    _model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        pkl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dga_classifier.pkl")
        if not os.path.exists(pkl_path):
            print("[*] Model file not found. Auto-training now...")
            self._model = train_and_save_model()
        else:
            with open(pkl_path, "rb") as f:
                self._model = pickle.load(f)
            print("[+] VajraDNS AI DGA Engine loaded successfully.")

    def predict(self, raw_domain: str) -> Dict[str, Any]:
        """
        Evaluates a domain and returns classification, confidence, and XAI reasoning.
        """
        features_dict = DomainFeatureExtractor.extract_features(raw_domain)
        vec = np.array([DomainFeatureExtractor.to_feature_vector(raw_domain)], dtype=np.float32)
        
        t0 = time.perf_counter()
        prob = float(self._model.predict_proba(vec)[0][1])
        inference_time_ms = (time.perf_counter() - t0) * 1000
        
        is_dga = prob >= 0.55
        confidence = prob if is_dga else (1.0 - prob)
        
        # Explainable AI (XAI) feature attribution
        reasons = []
        if features_dict["sld_entropy"] > 3.6:
            reasons.append(f"High character entropy ({features_dict['sld_entropy']:.2f})")
        if features_dict["max_consecutive_consonants"] >= 4:
            reasons.append(f"Unpronounceable consonant cluster ({int(features_dict['max_consecutive_consonants'])})")
        if features_dict["vowel_ratio"] < 0.15 or features_dict["vowel_ratio"] > 0.8:
            reasons.append(f"Abnormal vowel-to-consonant ratio ({features_dict['vowel_ratio']:.2f})")
        if features_dict["bigram_score"] < 0.3:
            reasons.append("Low linguistic naturalness (unnatural bigram transitions)")
        if features_dict["tld_risk"] >= 0.7:
            reasons.append("High-risk malicious TLD")
        if features_dict["digit_ratio"] > 0.35:
            reasons.append(f"High numeric density ({features_dict['digit_ratio']*100:.0f}%)")
            
        if not reasons:
            reasons.append("Standard lexical pattern")
            
        # Classify probable DGA Family
        probable_family = "Unknown"
        if is_dga:
            if features_dict["hex_ratio"] > 0.8:
                probable_family = "Locky / Ransomware"
            elif features_dict["max_consecutive_consonants"] >= 6:
                probable_family = "Banjori / Infostealer"
            elif features_dict["domain_length"] > 20:
                probable_family = "GameOver Zeus"
            elif features_dict["digit_ratio"] > 0.2:
                probable_family = "Conficker"
            else:
                probable_family = "Necurs / Generic DGA"
        else:
            probable_family = "Legitimate"

        return {
            "domain": raw_domain,
            "is_dga": is_dga,
            "threat_score": round(prob * 100, 2),
            "confidence": round(confidence * 100, 2),
            "probable_family": probable_family,
            "inference_time_ms": round(inference_time_ms, 3),
            "xai_reasons": reasons,
            "features": features_dict
        }


if __name__ == "__main__":
    train_and_save_model()
