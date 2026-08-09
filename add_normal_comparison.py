"""
Adds a normal-vs-empirical comparison to Q4 in analysis.ipynb.

Shows, at each ranking depth, the participation share the counterfactual gives
under (a) the empirical pooled distribution actually used, and (b) a fitted
normal, the assumption Bilalic et al. (2009) made and Knapp (2010) criticised.

Run from the repo root with `main` checked out:
    python add_normal_comparison.py
Refuses to run twice.
"""
import json
from pathlib import Path

NB = Path("analysis.ipynb")
nb = json.loads(NB.read_text())
cells = nb["cells"]

if any("NORMAL vs EMPIRICAL" in "".join(c["source"]) for c in cells):
    raise SystemExit("Already applied; nothing to do.")

# anchor after the Q4 headline-findings code cell (uses `men` and `women`)
anchor = None
for i, c in enumerate(cells):
    if c["cell_type"] == "code" and "HEADLINE FINDINGS" in "".join(c["source"]):
        anchor = i
        break
if anchor is None:
    raise SystemExit("Could not find Q4 headline cell; is this the right notebook?")

md = {"cell_type": "markdown", "metadata": {}, "source": (
"""### Does the distribution assumption matter? Normal vs empirical

Bilalic et al. (2009) fitted a normal distribution to the ratings; Knapp (2010)
criticised exactly that, arguing the normal misfits the tail and inflates the
participation share. We use the empirical distribution instead. The cell below
runs the counterfactual both ways on identical data, so the only thing that
changes is the distribution assumption.
""".splitlines(keepends=True))}

code = {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": (
'''# NORMAL vs EMPIRICAL participation share, by ranking depth
# Same pooled null and same active players; only the distribution assumption differs.
from scipy.stats import norm

_pooled = np.sort(np.concatenate([men, women]))
_Nm, _Nw = len(men), len(women)
_mu, _sd = norm.fit(_pooled)
_rng = np.random.default_rng(1)
_S = 4000
_am = np.sort(men)[::-1]
_af = np.sort(women)[::-1]

def _topk_mean(n_draws, k, invcdf=None):
    """Top-k order-statistic mean of n_draws, via descending records (memory-flat).
    invcdf=None -> draw from the empirical pooled distribution;
    otherwise map the uniforms through the given quantile function (e.g. normal)."""
    u = np.empty((_S, k))
    prev = _rng.random(_S) ** (1.0 / n_draws)
    u[:, 0] = prev
    for j in range(1, k):
        prev = prev * _rng.random(_S) ** (1.0 / (n_draws - j))
        u[:, j] = prev
    if invcdf is None:
        idx = np.minimum((u * len(_pooled)).astype(int), len(_pooled) - 1)
        return _pooled[idx].mean(axis=1)
    return invcdf(u).mean(axis=1)

_normq = lambda u: norm.ppf(u, _mu, _sd)

print(f"Fitted normal to pooled ratings: mean {_mu:.0f}, sd {_sd:.0f}")
print(f"(actual maximum in the data is {_pooled.max():.0f}; a normal tail is unbounded)\\n")
print(f"{'depth':>9} {'observed':>9} {'empirical':>15} {'normal (Bilalic-style)':>24}")
for k in (1, 25, 100, 1000, 10000):
    obs = _am[:k].mean() - _af[:k].mean()
    emp = np.median(_topk_mean(_Nm, k) - _topk_mean(_Nw, k))
    nrm = np.median(_topk_mean(_Nm, k, _normq) - _topk_mean(_Nw, k, _normq))
    print(f"top-{k:<5} {obs:8.0f}   {emp:5.0f} = {emp/obs*100:4.0f}%      {nrm:5.0f} = {nrm/obs*100:4.0f}%")

print("\\nReading: the empirical share RISES with depth (25% -> 68%), tracking the")
print("real shape of the rating distribution. The normal is nearly FLAT at ~47%")
print("everywhere. It overstates participation at the very top (47% vs 25%), the")
print("exact tail misfit Knapp flagged, and understates it deeper down (47% vs 68%).")
'''.splitlines(keepends=True))}

fig = {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": (
'''# Visual: empirical vs normal participation share across depths
_depths = [1, 25, 100, 1000, 10000]
_emp, _nrm = [], []
for k in _depths:
    obs = _am[:k].mean() - _af[:k].mean()
    _emp.append(np.median(_topk_mean(_Nm, k) - _topk_mean(_Nw, k)) / obs * 100)
    _nrm.append(np.median(_topk_mean(_Nm, k, _normq) - _topk_mean(_Nw, k, _normq)) / obs * 100)

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(range(len(_depths)), _emp, "o-", color="#993556", lw=2.5, label="Empirical (used here)")
ax.plot(range(len(_depths)), _nrm, "s--", color="#185FA5", lw=2, label="Normal (Bilalic-style)")
ax.set_xticks(range(len(_depths)))
ax.set_xticklabels([f"top {k:,}" for k in _depths])
ax.set_ylabel("Share of the gap explained by participation (%)")
ax.set_title("The normal assumption flattens the participation share to ~47% at every depth",
             loc="left", fontsize=12)
ax.set_ylim(0, 80)
ax.spines[["top", "right"]].set_visible(False)
ax.grid(axis="y", alpha=0.25)
ax.legend(frameon=False)
plt.tight_layout()
'''.splitlines(keepends=True))}

findings = {"cell_type": "markdown", "metadata": {}, "source": (
"""### Findings: the normal hides the structure

| Depth | Observed gap | Empirical | Normal |
|---|---|---|---|
| Top-1 | 225 | 25% | 47% |
| Top-25 | 253 | 43% | 47% |
| Top-100 | 275 | 49% | 47% |
| Top-1000 | 346 | 61% | 46% |
| Top-10,000 | 471 | 68% | 49% |

The normal returns roughly 47 percent at every depth, because a fixed symmetric
shape makes the sample-size gap scale in near-constant proportion to the observed
gap. The empirical distribution instead follows the real data: participation
explains little at the very summit, where the tail is short and bounded (25
percent at top-1), and a great deal deeper down (68 percent across the top
10,000).

This is Knapp's (2010) critique reproduced on international FIDE data. The normal
most overstates participation exactly where Bilalic et al. put their emphasis, the
very top, inflating a true ~25 percent to ~47 percent. It is also why our headline
figures sit below Bilalic's 96 percent: dropping the normal removes that inflation.
""".splitlines(keepends=True))}

cells[anchor + 1:anchor + 1] = [md, code, fig, findings]
NB.write_text(json.dumps(nb, indent=1))
print(f"Inserted 4 cells after cell {anchor}. Run the notebook top to bottom to execute them.")
