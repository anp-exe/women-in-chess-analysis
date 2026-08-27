import requests
import time
import random
import pandas as pd
from datetime import datetime
from pathlib import Path

COUNTRIES = ["US", "GB", "IN", "RU", "DE", "FR"]
SAMPLE_N  = 2000
SLEEP     = 0.25
CACHE     = Path("data/chesscom/signups.parquet")
HEADERS   = {"User-Agent": "chess-research-project/1.0 (academic)"}


def country_members(code):
    r = requests.get(f"https://api.chess.com/pub/country/{code}/players",
                     headers=HEADERS, timeout=30)
    return r.json().get("players", []) if r.status_code == 200 else []


def joined_ts(username):
    try:
        r = requests.get(f"https://api.chess.com/pub/player/{username}",
                         headers=HEADERS, timeout=10)
        if r.status_code == 200:
            return r.json().get("joined")
    except Exception:
        pass
    return None


def fetch_signups(countries=COUNTRIES, sample_n=SAMPLE_N, sleep=SLEEP, cache=CACHE):
    cache.parent.mkdir(parents=True, exist_ok=True)
    records = []
    for country in countries:
        print(f"\n{country}: fetching member list...", end=" ", flush=True)
        members = country_members(country)
        sample  = random.sample(members, min(sample_n, len(members)))
        print(f"{len(members):,} total → sampling {len(sample)}", flush=True)
        for i, username in enumerate(sample):
            ts = joined_ts(username)
            if ts:
                records.append({"country": country,
                                "joined": datetime.fromtimestamp(ts)})
            time.sleep(sleep)
            if (i + 1) % 100 == 0:
                print(f"  {i+1}/{len(sample)}", flush=True)
    df = pd.DataFrame(records)
    df.to_parquet(cache, index=False)
    print(f"\nDone — {len(df):,} profiles saved to {cache}")
    return df


if __name__ == "__main__":
    fetch_signups()