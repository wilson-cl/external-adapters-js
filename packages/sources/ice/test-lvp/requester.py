#!/usr/bin/env python3
"""
ICE EA LVP Test Requester

Sends requests to the ICE EA for various FX pairs to test
Last Value Persistence during market closures.
"""

import os
import time
import json
import requests
from datetime import datetime

EA_URL = os.environ.get('EA_URL', 'http://localhost:8080')
REQUEST_INTERVAL = int(os.environ.get('REQUEST_INTERVAL', 60))

# FX pairs to test - mix of G10 (always active) and EM (market closures)
PAIRS = [
    # G10 - should have continuous prices
    ("AUD", "USD"),
    ("EUR", "USD"),
    ("GBP", "USD"),
    ("NZD", "USD"),
    ("USD", "CAD"),
    ("USD", "CHF"),
    ("USD", "DKK"),
    ("USD", "JPY"),
    ("USD", "NOK"),
    ("USD", "SEK"),
    # EM / exotic - may have market closures
    ("USD", "ARS"),
    ("USD", "BRL"),
    ("USD", "CLP"),
    ("USD", "CNH"),
    ("USD", "CNY"),
    ("USD", "COP"),
    ("USD", "CZK"),
    ("USD", "GHS"),
    ("USD", "HKD"),
    ("USD", "HUF"),
    ("USD", "IDR"),
    ("USD", "ILS"),
    ("USD", "INR"),
    ("USD", "KES"),
    ("USD", "KRW"),
    ("USD", "MXN"),
    ("USD", "NGN"),
    ("USD", "PHP"),
    ("USD", "PLN"),
    ("USD", "SGD"),
    ("USD", "THB"),
    ("USD", "TRY"),
    ("USD", "XOF"),
    ("USD", "ZAR"),
    # Precious metals
    ("XAG", "USD"),
    ("XAU", "USD"),
    ("XPD", "USD"),
    ("XPT", "USD"),
]

def make_request(base: str, quote: str) -> dict:
    """Make a request to the EA for a given pair."""
    payload = {
        "data": {
            "base": base,
            "quote": quote
        }
    }
    
    try:
        response = requests.post(EA_URL, json=payload, timeout=30)
        return {
            "status": response.status_code,
            "body": response.json() if response.status_code == 200 else response.text
        }
    except Exception as e:
        return {
            "status": -1,
            "error": str(e)
        }

def log_result(pair: tuple, result: dict, log_file):
    """Log the result with timestamp."""
    timestamp = datetime.utcnow().isoformat()
    base, quote = pair
    
    if result["status"] == 200:
        body = result["body"]
        price = body.get("result")
        provider_time = body.get("data", {}).get("providerIndicatedTimeUnixMs")
        cache_info = body.get("debug", {}).get("cacheHit", "unknown")
        
        log_entry = {
            "timestamp": timestamp,
            "pair": f"{base}/{quote}",
            "price": price,
            "providerTime": provider_time,
            "cacheHit": cache_info,
            "status": "OK"
        }
    else:
        log_entry = {
            "timestamp": timestamp,
            "pair": f"{base}/{quote}",
            "status": "ERROR",
            "error": result.get("error") or result.get("body")
        }
    
    log_line = json.dumps(log_entry)
    print(log_line)
    log_file.write(log_line + "\n")
    log_file.flush()

def main():
    print(f"Starting ICE EA LVP Test Requester")
    print(f"EA URL: {EA_URL}")
    print(f"Request interval: {REQUEST_INTERVAL}s")
    print(f"Testing {len(PAIRS)} pairs")
    print("-" * 60)
    
    os.makedirs("/app/logs", exist_ok=True)
    log_filename = f"/app/logs/lvp-test-{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jsonl"
    
    with open(log_filename, "w") as log_file:
        cycle = 0
        while True:
            cycle += 1
            print(f"\n=== Cycle {cycle} at {datetime.utcnow().isoformat()} ===")
            
            for pair in PAIRS:
                result = make_request(pair[0], pair[1])
                log_result(pair, result, log_file)
                time.sleep(0.5)  # Small delay between requests
            
            print(f"Sleeping {REQUEST_INTERVAL}s until next cycle...")
            time.sleep(REQUEST_INTERVAL)

if __name__ == "__main__":
    main()

