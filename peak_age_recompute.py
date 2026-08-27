# -*- coding: utf-8 -*-
"""Peak age by sex, recomputed from the monthly FIDE snapshots.

This is the code behind slide 15 of the deck. It existed only as hardcoded
means before (METHODS.md section 6 notes that pool sizes, standard deviations
and CIs "are not currently derivable from the deck's figure"); this script
stores the per-player rows so they are.

Design, per METHODS.md section 6:
  * unit of analysis is the PLAYER, not the snapshot
  * for each monthly snapshot take the top N by standard rating for each sex,
    counting ACTIVE players only (FIDE flag without "i")
  * union those sets across all snapshots -> the "ever-elite" pool
  * reconstruct each player's rating-versus-age trajectory over active rows,
    age = snapshot year - birth year (FIDE stores birth year only)
  * one row per player: the age at their single highest observed rating,
    taking the earliest month if that rating is held for several

Run at two depths (25 and 100) so the result is not an artefact of the cut.

    python3 peak_age_recompute.py                # writes figures/peak_ages_active.csv

Output columns: fideid, sex, peak_rating, age_first_at_peak, age_last_at_peak,
in_top25, in_top100.  age_last_at_peak is there so the tie-break can be varied
without a re-run: the top-25 difference is -0.05 years on the earliest month
and -0.16 on the latest, i.e. the choice does not change the conclusion.
"""
import csv
import glob
import os

import pyarrow.parquet as pq

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "fide_parquet")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "figures", "peak_ages_active.csv")
COLS = ["fideid", "sex", "rating", "birthday", "flag", "snapshot_date"]
DEPTHS = (25, 100)
AGE_MIN, AGE_MAX = 8, 95


def is_active(flag):
    """FIDE flag: "" active man, "w" active woman, "i"/"wi" inactive."""
    return "i" not in (flag or "")


def main():
    files = sorted(glob.glob(os.path.join(DATA, "*.parquet")))
    if not files:
        raise SystemExit("no snapshots under %s" % DATA)

    # ---- pass 1: the ever-elite pool at each depth, active players only
    elite = {d: {"M": set(), "F": set()} for d in DEPTHS}
    for f in files:
        t = pq.read_table(f, columns=COLS).to_pydict()
        per = {"M": [], "F": []}
        for fid, sx, rt, fl in zip(t["fideid"], t["sex"], t["rating"], t["flag"]):
            if sx in ("M", "F") and fid is not None and rt is not None and is_active(fl):
                per[sx].append((rt, fid))
        for sx in ("M", "F"):
            per[sx].sort(key=lambda x: -x[0])
            for d in DEPTHS:
                elite[d][sx].update(fid for _, fid in per[sx][:d])

    sex_of = {}
    for d in DEPTHS:
        for sx in ("M", "F"):
            for fid in elite[d][sx]:
                sex_of[fid] = sx
        print("depth %3d pool: %d women, %d men" % (d, len(elite[d]["F"]), len(elite[d]["M"])))

    # ---- pass 2: trajectories over active rows, age at the single highest rating
    best = {}   # fid -> [peak_rating, first_age_at_peak, last_age_at_peak]
    for f in files:
        t = pq.read_table(f, columns=COLS).to_pydict()
        for fid, rt, bd, fl, sd in zip(t["fideid"], t["rating"], t["birthday"],
                                       t["flag"], t["snapshot_date"]):
            if fid not in sex_of or rt is None or bd is None or not is_active(fl):
                continue
            age = sd.year - int(bd)
            if not (AGE_MIN <= age <= AGE_MAX):
                continue
            cur = best.get(fid)
            if cur is None or rt > cur[0]:
                best[fid] = [rt, age, age]
            elif rt == cur[0]:
                cur[1] = min(cur[1], age)
                cur[2] = max(cur[2], age)

    with open(OUT, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["fideid", "sex", "peak_rating", "age_first_at_peak",
                    "age_last_at_peak", "in_top25", "in_top100"])
        for fid in sorted(sex_of):
            if fid not in best:
                continue     # elite but no usable birth year
            sx = sex_of[fid]
            rt, a1, a2 = best[fid]
            w.writerow([fid, sx, rt, a1, a2,
                        int(fid in elite[25][sx]), int(fid in elite[100][sx])])
    print("wrote", OUT)

    # ---- summary
    for d in DEPTHS:
        line = []
        for sx in ("F", "M"):
            v = [best[fid][1] for fid in elite[d][sx] if fid in best]
            mean = sum(v) / len(v)
            sd_ = (sum((x - mean) ** 2 for x in v) / (len(v) - 1)) ** 0.5
            line.append("%s n=%3d mean=%.2f sd=%.2f" % (sx, len(v), mean, sd_))
        print("depth %3d  %s | %s" % (d, line[0], line[1]))


if __name__ == "__main__":
    main()
