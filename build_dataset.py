"""
FIDE longitudinal dataset builder.

Downloads every monthly FIDE rating list from July 2015 to today,
parses each XML into a typed parquet file, and provides helpers to
load the resulting dataset with optional filters.

Fully resumable — re-running skips anything already on disk.

Usage:
    python build_dataset.py
"""

import gc
import time
import zipfile
from datetime import date, datetime
from pathlib import Path
import xml.etree.ElementTree as ET

import requests
import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.dataset as ds


DATA_DIR = Path("data")
RAW_DIR = DATA_DIR / "fide_raw"
PARQUET_DIR = DATA_DIR / "fide_parquet"

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun",
          "jul", "aug", "sep", "oct", "nov", "dec"]

URL_PATTERNS = [
    "https://ratings.fide.com/download/standard_{mon}{yy}frl_xml.zip",
    "http://ratings.fide.com/download/standard_{mon}{yy}frl_xml.zip",
    "https://ratings.fide.com/download/standard_{mon}{yy}frl.zip",
]

CHUNK_SIZE = 200_000
REQUEST_TIMEOUT = 180
SLEEP_BETWEEN = 1.0
MIN_VALID_SIZE = 10_000

SCHEMA = pa.schema([
    ("fideid", pa.int64()),
    ("name", pa.string()),
    ("country", pa.string()),
    ("sex", pa.string()),
    ("title", pa.string()),
    ("w_title", pa.string()),
    ("o_title", pa.string()),
    ("rating", pa.int16()),
    ("games", pa.int16()),
    ("k", pa.int8()),
    ("rapid_rating", pa.int16()),
    ("rapid_games", pa.int16()),
    ("rapid_k", pa.int8()),
    ("blitz_rating", pa.int16()),
    ("blitz_games", pa.int16()),
    ("blitz_k", pa.int8()),
    ("birthday", pa.int16()),
    ("flag", pa.string()),
    ("snapshot_date", pa.date32()),
])


def ensure_dirs():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PARQUET_DIR.mkdir(parents=True, exist_ok=True)


def month_range(start, end):
    y, m = start
    ey, em = end
    while (y, m) <= (ey, em):
        yield y, m
        m += 1
        if m > 12:
            m, y = 1, y + 1


def current_year_month():
    now = datetime.now()
    return now.year, now.month


def try_download(url, dest):
    tmp = dest.with_suffix(dest.suffix + ".part")
    try:
        with requests.get(url, timeout=REQUEST_TIMEOUT, stream=True, allow_redirects=True) as resp:
            if resp.status_code != 200:
                return False, f"http {resp.status_code}"
            ctype = resp.headers.get("Content-Type", "").lower()
            if "html" in ctype or "text" in ctype:
                return False, "got html not zip"
            with open(tmp, "wb") as f:
                for block in resp.iter_content(chunk_size=1 << 20):
                    if block:
                        f.write(block)
        if tmp.stat().st_size < MIN_VALID_SIZE:
            tmp.unlink()
            return False, "response too small"
        with zipfile.ZipFile(tmp) as z:
            if not z.namelist():
                tmp.unlink()
                return False, "empty zip"
        tmp.rename(dest)
        return True, "ok"
    except zipfile.BadZipFile:
        if tmp.exists():
            tmp.unlink()
        return False, "not a valid zip"
    except requests.RequestException as e:
        if tmp.exists():
            tmp.unlink()
        return False, f"request error: {type(e).__name__}"


def download_snapshot(year, month):
    dest = RAW_DIR / f"{year:04d}-{month:02d}.zip"
    if dest.exists() and dest.stat().st_size > MIN_VALID_SIZE:
        return dest, "cached"
    mon = MONTHS[month - 1]
    yy = f"{year % 100:02d}"
    last_error = "no url worked"
    for pattern in URL_PATTERNS:
        url = pattern.format(mon=mon, yy=yy)
        ok, detail = try_download(url, dest)
        if ok:
            return dest, "downloaded"
        last_error = detail
    return None, last_error


def safe_int(v):
    if v is None or v == "":
        return None
    try:
        return int(v)
    except (ValueError, TypeError):
        return None


def empty_buffers():
    return {f.name: [] for f in SCHEMA}


def flush_buffers(buffers, writer):
    if not buffers["fideid"]:
        return
    table = pa.table(buffers, schema=SCHEMA)
    writer.write_table(table)
    for key in buffers:
        buffers[key].clear()
    del table
    gc.collect()


def parse_zip_to_parquet(zip_path, parquet_path, snapshot):
    buffers = empty_buffers()
    total = 0
    kept = 0
    tmp_parquet = parquet_path.with_suffix(parquet_path.suffix + ".part")
    writer = pq.ParquetWriter(tmp_parquet, SCHEMA, compression="snappy")
    try:
        with zipfile.ZipFile(zip_path) as z:
            xml_names = [n for n in z.namelist() if n.lower().endswith(".xml")]
            xml_name = xml_names[0] if xml_names else z.namelist()[0]
            with z.open(xml_name) as xml_stream:
                for _, elem in ET.iterparse(xml_stream, events=("end",)):
                    if elem.tag != "player":
                        continue
                    total += 1
                    rating = safe_int(elem.findtext("rating"))
                    rapid = safe_int(elem.findtext("rapid_rating"))
                    blitz = safe_int(elem.findtext("blitz_rating"))
                    if not rating and not rapid and not blitz:
                        elem.clear()
                        continue
                    buffers["fideid"].append(safe_int(elem.findtext("fideid")))
                    buffers["name"].append(elem.findtext("name"))
                    buffers["country"].append(elem.findtext("country"))
                    buffers["sex"].append(elem.findtext("sex"))
                    buffers["title"].append(elem.findtext("title"))
                    buffers["w_title"].append(elem.findtext("w_title"))
                    buffers["o_title"].append(elem.findtext("o_title"))
                    buffers["rating"].append(rating)
                    buffers["games"].append(safe_int(elem.findtext("games")))
                    buffers["k"].append(safe_int(elem.findtext("k")))
                    buffers["rapid_rating"].append(rapid)
                    buffers["rapid_games"].append(safe_int(elem.findtext("rapid_games")))
                    buffers["rapid_k"].append(safe_int(elem.findtext("rapid_k")))
                    buffers["blitz_rating"].append(blitz)
                    buffers["blitz_games"].append(safe_int(elem.findtext("blitz_games")))
                    buffers["blitz_k"].append(safe_int(elem.findtext("blitz_k")))
                    buffers["birthday"].append(safe_int(elem.findtext("birthday")))
                    buffers["flag"].append(elem.findtext("flag"))
                    buffers["snapshot_date"].append(snapshot)
                    kept += 1
                    elem.clear()
                    if kept % CHUNK_SIZE == 0:
                        flush_buffers(buffers, writer)
                flush_buffers(buffers, writer)
    except Exception:
        writer.close()
        if tmp_parquet.exists():
            tmp_parquet.unlink()
        raise
    writer.close()
    tmp_parquet.rename(parquet_path)
    gc.collect()
    return total, kept


def process_snapshot(year, month):
    parquet_path = PARQUET_DIR / f"{year:04d}-{month:02d}.parquet"
    if parquet_path.exists() and parquet_path.stat().st_size > 1000:
        return "parquet cached", None
    zip_path, status = download_snapshot(year, month)
    if zip_path is None:
        return "download failed", status
    try:
        snapshot = date(year, month, 1)
        total, kept = parse_zip_to_parquet(zip_path, parquet_path, snapshot)
        return "ok", f"{total} parsed, {kept} kept"
    except Exception as e:
        return "parse failed", f"{type(e).__name__}: {e}"


def run_pipeline(start=(2015, 7), end=None):
    ensure_dirs()
    if end is None:
        end = current_year_month()
    targets = list(month_range(start, end))
    results = []
    successes = 0
    failures = 0
    print(f"Pipeline: {len(targets)} snapshots from {start[0]}-{start[1]:02d} to {end[0]}-{end[1]:02d}")
    print(f"Raw zips:      {RAW_DIR.resolve()}")
    print(f"Parquet store: {PARQUET_DIR.resolve()}")
    print("Safe to interrupt; re-running resumes from cache.\n")
    for i, (year, month) in enumerate(targets, 1):
        prefix = f"[{i:3d}/{len(targets)}] {year}-{month:02d}"
        status, detail = process_snapshot(year, month)
        line = f"{prefix}  {status}"
        if detail:
            line += f"  ({detail})"
        print(line, flush=True)
        results.append((year, month, status, detail))
        if status in ("ok", "parquet cached"):
            successes += 1
        else:
            failures += 1
        time.sleep(SLEEP_BETWEEN)
    print(f"\nDone. {successes} ok, {failures} failed.")
    if failures:
        print("\nFailed snapshots:")
        for year, month, status, detail in results:
            if status not in ("ok", "parquet cached"):
                print(f"  {year}-{month:02d}: {status} ({detail})")
    return results


def load_snapshots(columns=None, sex=None, min_rating=None,
                   countries=None, date_from=None, date_to=None):
    dataset = ds.dataset(str(PARQUET_DIR), format="parquet")
    filters = []
    if sex is not None:
        filters.append(ds.field("sex") == sex)
    if min_rating is not None:
        filters.append(ds.field("rating") >= min_rating)
    if countries is not None:
        filters.append(ds.field("country").isin(list(countries)))
    if date_from is not None:
        filters.append(ds.field("snapshot_date") >= date_from)
    if date_to is not None:
        filters.append(ds.field("snapshot_date") <= date_to)
    combined = None
    for f in filters:
        combined = f if combined is None else combined & f
    table = dataset.to_table(columns=columns, filter=combined)
    return table.to_pandas()


def load_snapshot_counts(sex=None):
    dataset = ds.dataset(str(PARQUET_DIR), format="parquet")
    filter_expr = None
    if sex is not None:
        filter_expr = ds.field("sex") == sex
    table = dataset.to_table(columns=["snapshot_date", "fideid"], filter=filter_expr)
    df = table.to_pandas()
    return df.groupby("snapshot_date").size().rename("player_count").reset_index()


if __name__ == "__main__":
    run_pipeline()
