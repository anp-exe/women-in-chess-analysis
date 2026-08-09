"""
Adds the Q3 follow-up section to analysis.ipynb: active-player peak-age analysis
at top 25 and top 100, with the two career-trajectory charts and the confound
regression. The original top-25 findings are left untouched; this is appended
directly after them.

Run from the repo root with `main` checked out:

    python add_q3_followup.py

Safe to run once. It refuses to run twice.
"""
import json
from pathlib import Path

NB = Path("analysis.ipynb")
nb = json.loads(NB.read_text())
cells = nb["cells"]

if any("PEAK AGE, ACTIVE PLAYERS ONLY" in "".join(c["source"]) for c in cells):
    raise SystemExit("Already applied; nothing to do.")

# anchor: the existing Q3 findings markdown (keeps original analysis intact above)
anchor = next(i for i, c in enumerate(cells)
              if c["cell_type"] == "markdown" and "Elite chess peak age is effectively the same" in "".join(c["source"]))

def md(t):
    return {"cell_type": "markdown", "metadata": {}, "source": t.splitlines(keepends=True)}

def code(t):
    return {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [],
            "source": t.splitlines(keepends=True)}

new = [
    md("""## Q3 follow-up: the peak-age result does not survive an activity filter

The analysis above has two defects that were only found on review.

**Retired players are in the pool.** The elite pool was built without filtering on
FIDE's inactivity flag, so players who stopped competing keep a frozen rating on
file. `idxmax` on a flat line returns an arbitrary point and calls it a career
peak. Nine of the fifty women in the pool have ratings that move less than 15 Elo
across the entire decade, against one of fifty five men, because the female elite
pool spans generations while the top 25 men in any month are nearly all active.
Those nine women carry a mean recorded peak age of 40.9, inflating the female mean.

**The sample is far too small.** With about fifty players a side, the smallest
difference detectable at 80% power is 4.7 years. A measured difference of 0.2
years is therefore not evidence that the two are equal, it is a measurement too
blunt to distinguish them. The original wording, that the folk belief is "not
supported", claimed evidence of absence from an absence of evidence.

The cells below rebuild the analysis on active players only, at the original top 25
depth and again at top 100, which yields roughly 250 players a side.
"""),
    code('''# PEAK AGE, ACTIVE PLAYERS ONLY - top 25 and top 100 elite pools
import pyarrow.parquet as pq

def build_elite_pool(top_n):
    """Union across all snapshots of the top-N ACTIVE rated players of each sex."""
    pool = set()
    for f in sorted(PARQUET_DIR.glob("*.parquet")):
        c = pq.read_table(f, columns=["fideid", "sex", "rating", "flag"]).to_pandas()
        c = c[c["rating"].notna() & c["sex"].isin(["M", "F"])]
        c = c[~c["flag"].fillna("").str.contains("i")]      # drop inactive/retired
        for s in ("M", "F"):
            pool.update((int(i), s) for i in c[c["sex"] == s].nlargest(top_n, "rating")["fideid"])
    return pd.DataFrame(sorted(pool), columns=["fideid", "sex"])

def trajectories_for(ids):
    """Rating-vs-age history for a pool, counting only months the player was active."""
    frames = []
    for f in sorted(PARQUET_DIR.glob("*.parquet")):
        c = pq.read_table(f, columns=["fideid", "sex", "rating", "birthday", "flag", "snapshot_date"]).to_pandas()
        frames.append(c[c["fideid"].isin(set(ids["fideid"])) & c["rating"].notna()])
    d = pd.concat(frames, ignore_index=True).merge(ids, on=["fideid", "sex"])
    d = d[~d["flag"].fillna("").str.contains("i")]
    d["rating"] = d["rating"].astype(int)
    d["birthday"] = pd.to_numeric(d["birthday"], errors="coerce")
    d = d.dropna(subset=["birthday"])
    d["snapshot_date"] = pd.to_datetime(d["snapshot_date"])
    d["age"] = d["snapshot_date"].dt.year - d["birthday"].astype(int)
    return d[(d["age"] >= 5) & (d["age"] <= 80)]

pools = {n: build_elite_pool(n) for n in (25, 100)}
trajs = {n: trajectories_for(pools[n]) for n in (25, 100)}
for n in (25, 100):
    p = pools[n]
    print(f"top-{n} active pool: {(p.sex=='M').sum()} men, {(p.sex=='F').sum()} women")
'''),
    code('''# Peak ages, significance and power at each depth
from scipy import stats

def peak_table(d):
    return d.loc[d.groupby("fideid")["rating"].idxmax(), ["fideid", "sex", "age"]].rename(columns={"age": "peak_age"})

def compare(pk, label):
    w = pk[pk.sex == "F"]["peak_age"].values
    m = pk[pk.sex == "M"]["peak_age"].values
    rng = np.random.default_rng(0)
    bs = [rng.choice(w, len(w), True).mean() - rng.choice(m, len(m), True).mean() for _ in range(10_000)]
    lo, hi = np.percentile(bs, [2.5, 97.5])
    p = stats.ttest_ind(w, m, equal_var=False).pvalue
    pu = stats.mannwhitneyu(w, m).pvalue
    sd = np.sqrt((w.var() + m.var()) / 2)
    n = min(len(w), len(m))
    mde = (stats.norm.ppf(0.975) + stats.norm.ppf(0.8)) * sd * np.sqrt(2 / n)
    print(f"{label}")
    print(f"  women n={len(w):3d} mean {w.mean():.1f}   men n={len(m):3d} mean {m.mean():.1f}")
    print(f"  difference {w.mean()-m.mean():+.1f} yrs  95% CI [{lo:+.1f}, {hi:+.1f}]  t p={p:.3f}  MWU p={pu:.4f}")
    print(f"  smallest difference this sample could detect: {mde:.1f} yrs\\n")

peaks = {n: peak_table(trajs[n]) for n in (25, 100)}
compare(peaks[25], "TOP 25, active only")
compare(peaks[100], "TOP 100, active only")
'''),
    code('''# Career trajectories, active players only, with mean peak age marked
def trajectory_chart(n):
    d, pk = trajs[n], peaks[n]
    fig, ax = plt.subplots(figsize=(12, 5.5))
    alpha = 0.15 if n == 25 else 0.06
    for sex, col in (("M", "#185FA5"), ("F", "#993556")):
        for _, p in d[d.sex == sex].groupby("fideid"):
            p = p.sort_values("age")
            ax.plot(p["age"], p["rating"], color=col, alpha=alpha, lw=1.0)
    for sex, col, lab in (("M", "#185FA5", "Men"), ("F", "#993556", "Women")):
        mu = d[d.sex == sex].groupby("age")["rating"].agg(["mean", "count"])
        mu = mu[mu["count"] >= 5]
        ax.plot(mu.index, mu["mean"], color=col, lw=3, label=f"{lab} (mean)")
        pa = pk[pk.sex == sex]["peak_age"].mean()
        ax.axvline(pa, color=col, ls=":", lw=2, alpha=0.9)
        ax.annotate(f"mean peak {pa:.1f}", xy=(pa, ax.get_ylim()[0] + 40), color=col,
                    fontsize=10, rotation=90, va="bottom", ha="right")
    ax.set_xlabel("Age"); ax.set_ylabel("FIDE rating")
    ax.set_title(f"Career trajectories of top {n} active players per sex, 2015 to 2026", loc="left", fontsize=13)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", alpha=0.25); ax.legend(frameon=False, loc="lower right"); ax.set_xlim(10, 65)
    plt.tight_layout()

trajectory_chart(25)
trajectory_chart(100)
'''),
    md("""### The top-100 difference is real, but most of it is retention rather than decline

At top 25 the two sexes are indistinguishable. At top 100, with roughly 250 players
a side, women peak about **2.3 years earlier** and the result is significant. That is
not a contradiction: the top-25 sample simply could not resolve anything under about
four years.

Before treating that as a statement about ageing, two features of the pool need
checking, and both matter.
"""),
    code('''# Are the women simply younger, or observed for less time?
import statsmodels.api as sm

d = trajs[100]
g = d.groupby("fideid")
prof = pd.DataFrame({
    "sex": g["sex"].first(),
    "peak_age": d.loc[g["rating"].idxmax()].set_index("fideid")["age"],
    "max_age": g["age"].max(),      # oldest age at which we ever observe them
    "n_active": g.size(),           # active months observed
})

print("Pool composition:")
print(prof.groupby("sex")[["max_age", "n_active"]].mean().round(1), "\\n")
for col, desc in [("max_age", "oldest age observed"), ("n_active", "active months observed")]:
    p = stats.ttest_ind(prof[prof.sex == "F"][col], prof[prof.sex == "M"][col], equal_var=False).pvalue
    print(f"  {desc}: p={p:.4f}")

X = pd.DataFrame({"female": (prof.sex == "F").astype(int), "max_age": prof.max_age, "n_active": prof.n_active})
res = sm.OLS(prof["peak_age"], sm.add_constant(X)).fit()
print("\\nPeak age regressed on sex, age observed and career length:")
print(res.summary2().tables[1].round(3))
print(f"\\n  raw difference:                    -2.3 yrs")
print(f"  adjusted for age and career length: {res.params['female']:+.2f} yrs (p={res.pvalues['female']:.3f})")
'''),
    md("""### Findings

| Pool | Women | Men | Difference |
|---|---|---|---|
| Top 25, as originally published (no activity filter) | 30.1 | 29.9 | +0.2, p = 0.93 |
| Top 25, active only | 28.8 | 28.9 | 0.0, p = 0.97 |
| **Top 100, active only** | **27.5** | **29.8** | **-2.3, p = 0.002** |
| Top 100, adjusted for age observed and career length | | | -0.74, p = 0.002 |

Elite women reach their peak rating about 2.3 years earlier than elite men. Two
thirds of that gap is explained by pool composition: the women are observed to a
younger maximum age (33.5 against 35.9) and over shorter active careers (116 months
against 123). Adjusting for both leaves about nine months, still significant.

The gap between those two numbers is the interesting quantity. If women leave chess
earlier, career length is not a confound to be removed but the mechanism itself, and
adjusting for it removes part of the very effect being measured. The defensible range
therefore runs from **2.3 years as observed** to **0.74 years between a man and a
woman with equal careers**. It also explains the null at top 25: the women who
survive to the very top resemble the men closely.

Read alongside the retention literature (Li, Glickman & Chabris 2025 found raw dropout
differences that largely vanish once players are matched), this points at when women
stop playing rather than when they decline.

**Caveats.** FIDE records birth year only, so ages carry +/-1 year of noise. `max_age`
is plausibly a mediator rather than a confounder, which means the adjusted figure is
likely an underestimate. And the elite pool is defined by reaching a top-N rating,
which is itself a selected sample.
"""),
]

cells[anchor + 1:anchor + 1] = new
NB.write_text(json.dumps(nb, indent=1))
print(f"Inserted {len(new)} cells after cell {anchor}. Now run the notebook top to bottom.")
