# Methods

Companion to the talk *Women in Chess, Through the Data* and to `analysis.ipynb`.
Every number quoted from the stage is derived here. Written so you can check the
arithmetic without running the notebook, and so you can see where it is soft.

Repo: <https://github.com/anp-exe/women-in-chess-analysis> · Write-up: <https://anp-exe.github.io/women-in-chess-analysis>

---

## 1. The data

| Source | What it is | Size |
|---|---|---|
| FIDE monthly standard rating lists | 130 consecutive snapshots, July 2015 to April 2026 | 47M+ player-month records |
| FIDE latest list (April 2026) | Every rated player | 545,549 rated · 11% women |
| FIDE active pool (**the analysis pool**) | Active on **any** of the last 12 monthly lists, May 2025 to April 2026 | 251,137 men · 30,420 women · **8.26 : 1** |
| FIDE active subset (April 2026 alone) | Without the inactivity flag on that single list | 194,192 men · 22,611 women · 8.59 : 1 |
| Chess.com public API | Country-stratified sample of join dates (US, GB, IN, RU, DE, FR) | ~12,000 profiles |

`build_dataset.py` streams each monthly zipped XML with `iterparse` one player at a
time, drops unrated records, and writes typed parquet per month. Memory stays flat
and the pipeline is resumable.

**Two definitions of "active", and which one is used where.** §4 averages each player's
rating across the last twelve monthly snapshots, so its pool has to be everyone active
at some point across those twelve lists, not everyone active on the final one. That
union is the **8.26 : 1** pool, and it is the pool behind every figure in §4 and §5.
Where a claim is about a *single* list instead — the share of the April 2026 list that
is women, or the month-by-month series in §7 — the single-snapshot **8.59 : 1** figure
applies. The two differ because a quarter of the players active during the year are not
flagged active on the final list — 22.7% of the men, 25.7% of the women — and it is that
slightly higher intermittency among women that pulls the union ratio (8.26) below the
single-month ratio (8.59). Both are quoted below; neither is a correction of the other.

**Two things the dataset does not contain.** Only the **standard** lists are
downloaded, so players holding a rapid or blitz rating and nothing else are absent
entirely — an exclusion that falls hardest on juniors and recent registrants. And
FIDE records birth *year* only, so every age in this project is ±1 year.

**One discontinuity.** FIDE applied a one-off rating adjustment in **March 2024**
that raised ratings below 2000 and lifted the published floor from 1000 to 1400,
adding roughly 50,000 men and 10,000 women to the 1400+ pool overnight. Any
longitudinal claim crossing that date is run on a harmonised `rating >= 2000` pool,
which the diagnostic in the notebook shows the adjustment left untouched.

---

## 2. What Bilalić did, and why the curve broke

Bilalić, Smallbone, McLeod & Gobet (2009), *Proc. R. Soc. B* 276, 1161–1165.

They took the German national list (n = 120,399, μ = 1461, σ = 342, roughly 16 men
per woman), fitted a **normal distribution to each sex separately**, and asked what
the expected top-100 values should be under independent sampling. Predicted gap
divided by observed gap ≈ 0.96.

The load-bearing statistics is order statistics: the mean of a sample is stable, the
**maximum is not**. For n independent normal draws,

```
E[max] ≈ μ + σ · Φ⁻¹((n − 0.375)/(n + 0.25))          (Blom)
       ≈ μ + σ · √(2 ln n)                             (asymptotic form)
```

so the expected best player grows with the square root of the log of the pool size.
On the German parameters:

| Pool size | Expected best | z | Gain over previous decade |
|---|---|---|---|
| 10 | 1990 | 1.55 | — |
| 100 | 2316 | 2.50 | +326 |
| 1,000 | 2565 | 3.23 | +249 |
| 10,000 | 2773 | 3.84 | +208 |
| 100,000 | 2955 | 4.37 | +182 |
| 1,000,000 | 3119 | 4.85 | +164 |

Verified against direct Monte Carlo, 400 replications: n = 1,000 gives 2570 against
Blom's 2565; n = 100,000 gives 2957 against 2955.

**Why 16:1 in the pool becomes a gap at the top.** A 16:1 participation ratio does
not mean men are 16 times better at anything. It means that when you go looking for
the single best man and the single best woman you are searching a pool sixteen times
larger in one case. From the table, a 16× difference in pool size is worth roughly
180–250 Elo at the top **with identical underlying distributions for both sexes**.
Any analysis has to subtract that off before claiming anything else.

### Where it fails, precisely

The 96% is a ratio: **predicted gap ÷ observed gap**. The observed gap is real data
and does not move. So the entire figure is driven by the numerator, and the numerator
is not a measurement — it is a property of the curve that was assumed.

Unpack the predicted gap:

```
predicted gap = E[best of n_men] − E[best of n_women]
```

Both terms are read off *the same fitted normal*, at two different depths. On the
German parameters, with 16 men per woman:

| | pool | expected max sits at | predicted rating |
|---|---|---|---|
| men | 113,317 | z = 4.40 | 2964 |
| women | 7,082 | z = 3.75 | 2744 |
| | | **0.65 σ apart** | **gap = 221 Elo** |

So the predicted participation gap is nothing more than **how far the fitted curve
falls between its 1-in-7,000 point and its 1-in-113,000 point** — 0.65 σ, which is
221 Elo purely because σ was estimated at 342. Nobody measured that drop. It is
implied by the choice of distribution family, and a normal has a very particular,
very light tail.

Then check the curve where it is doing the work. The same fit says a German player
around **2964–3010** should exist (the deck quotes 3010; my arithmetic on
N(1461, 342) gives 2964 — same order of magnitude, same argument). No German player
has ever been above 2700. On the modern FIDE active list the same failure shows up
in the opposite direction: a normal fitted to the pooled ratings expects **1.8**
active players above 2700; there are **30**.

Either way the conclusion is the same. **A curve that is hundreds of Elo wrong about
where the top of the list is has no authority about how far apart two points near the
top ought to be** — and that spacing is the whole of the numerator.

**Demonstrated on this dataset.** Same populations, same depths, same Monte Carlo,
changing only the tail model (April 2026 active list, single-month ratings):

| Depth | Predicted gap, real pooled distribution | Predicted gap, fitted normal | Share "explained" |
|---|---|---|---|
| Top 1 | 61 Elo | 128 Elo | 25% → **52%** |
| Top 25 | 114 Elo | 166 Elo | 46% → **67%** |
| Top 100 | 139 Elo | 156 Elo | 52% → **58%** |

Swap the empirical distribution for a fitted normal, change nothing else, and the
share attributed to participation roughly doubles at the top of the list.

> ⚠️ **Unreconciled.** The sensitivity table in §5 puts this same lever at **+3.1 pp**
> at top-25, against +21 pp here. The likely causes are that this run fits the normal
> to the *pooled* distribution and uses single-month April 2026 ratings, while §5
> uses the Q4 baseline with 12-month averages and a different fit. **The direction
> agrees in both; the magnitude does not.** Reconcile before quoting either number
> from the stage.

---

## 3. What Knapp changed

Knapp (2010), *Proc. R. Soc. B* 277, 2269–2270. A published comment on the same data
in the same journal.

Knapp's point is that two independent samples is the wrong sampling frame. There is
one rating list. Everybody sits on one crosstable. The right question is not "what is
the expected best of 100,000 independent draws versus the expected best of 6,000"
but **"in one finite pool of mixed players, where do the women land?"**

Two things change:

1. **Finiteness.** You draw *without replacement* from a fixed population. Men and
   women are not independent of each other; they compete for the same rank slots.
2. **Discreteness.** The question is about ranks — where the k-th woman sits in the
   combined ordering — which is a counting problem, not a continuous one.

The natural distribution for "how many men appear before the k-th woman when you draw
from a finite mixed pool" is the **negative hypergeometric**. In plain terms: roughly
every 17th player on the German list is a woman, so the comparison for the
n-th woman is the player about **17n places above her on the one real list**, not a
value read off a fitted curve that overshoots at the tail.

The effect is largest at the very top, exactly where the 2009 claim was strongest. It
pulls the explained share from 96% down to a mean of about **67%**, ranging 41–71%
depending on how deep you cut.

---

## 4. My own decomposition (the 44–61% figures)

**Null hypothesis:** men's and women's ratings are drawn from *one shared
distribution*; the only difference between the groups is how many draws each gets.

**Specification.**

1. **Active players only** (FIDE inactivity flag). Without this, ~60% of the
   comparison pool is retired players with frozen ratings: Kasparov would rank #2
   among men and the "top woman" would be Judit Polgár's rating frozen since 2014.
2. Average each active player's rating across the **last 12 monthly snapshots** to
   reduce noise.
3. Pool male and female ratings into one **empirical** distribution. **No curve is
   fitted** — precisely because of the tail failure in §2. The empirical distribution
   reproduces the observed order statistics by construction.
4. **Monte Carlo**, 10,000 simulations, seed 42. Draw `N_men` and `N_women` samples
   from the pooled distribution and record the top-1000 order statistics of each.
   (Implementation note: top-k order statistics of n uniforms are generated directly
   via descending records, `u₍ₙ₎ = U^(1/n)`, `u₍ₙ₋₁₎ = u₍ₙ₎ · U^(1/(n−1))`, …, then
   mapped through the empirical quantile function, so n = 250k draws are never
   materialised.)
5. Compare the simulated gap to the observed gap at each depth.

**Result.**

| Depth | Observed gap | Expected from sample size [95% CI] | % explained [95% CI] |
|---|---|---|---|
| Top 1 | 225 Elo | 66 [−38 to 134] | ~29% [−17 to 60%] — **too noisy to quote** |
| Top 25 mean | 253 Elo | 110 [73–146] | **44%** [29–58%] |
| Top 100 mean | 275 Elo | 136 [111–160] | **49%** [40–58%] |
| Top 1000 mean | 346 Elo | 212 [200–224] | **61%** [58–65%] |

**The pattern is the finding: the higher you look, the less participation explains.**
Run continuously across ~160 log-spaced depths, the share rises monotonically from
**37% at top-10 to 68% at top-10,000**. There is no single "share explained by
participation"; the number you get is a choice about where you cut the ranking. Note
also that adjacent points on that curve are not statistically distinguishable — only
top-25 versus top-1000 is separated. Read it as a shape, not a ranking of depths.

### What "44% of the gap" does and does not mean

**It does mean:** if women were drawn in male numbers, and nothing else changed, we
would expect about 110 of the 253 Elo between the top 25 men and the top 25 women to
disappear on its own.

**It does not mean:**

- *"44% of chess ability is explained by participation."* It is a decomposition of
  one gap between two group means, not a variance decomposition of ability.
- *"56% is genetic."* The residual is everything the sampling model does not capture:
  every cultural, developmental and selection effect, plus model error.
- *"This settles it."* One estimator, one comparison, with the caveats below.

### Bounded support

Drawing from an empirical distribution can never produce a rating above the highest
observed one. That is why the null is the **pooled** distribution (support up to
Carlsen's 2839) rather than the female-only distribution, whose ceiling at Hou
Yifan's 2614 would mechanically cap any counterfactual. A GEV fit to block maxima
would allow extrapolation beyond observed support; it has **not** been run, so no
claim is made about what it would show.

---

## 5. Sensitivity: what actually moves the answer

One lever at a time, from the baseline of 44% (world pool, active players, empirical
distribution, top-25):

| Change | Effect |
|---|---|
| Reference pool restricted to club strength (2000+) | **+20.6 pp** → 64% |
| Depth: top-1 rather than top-25 | **−18.4 pp** → 25% |
| Arena: Germany only rather than the world | +11.3 pp → 55% |
| Depth: top-100 rather than top-25 | +5.9 pp → 49% |
| Distribution: fitted normal rather than empirical | +3.1 pp → 47% |
| Activity: inactive players included | +1.2 pp → 45% |

The two largest levers are restatements of the same decision: **who counts as a
player**. The rating floor is the participation ratio in disguise — across the whole
analysis pool the world ratio is 8.26:1, among 2000+ actives it is 19:1, because women's
ratings sit lower in the pool and any floor drawn through it removes proportionally
more women. No player's strength changed.

The distribution assumption — the objection this class of analysis usually attracts —
is the second-smallest entry in the table.

**One specification, nine federations.** Holding everything fixed and varying only
the arena returns **44% (Russia) to 79% (United States), median 72%**, against 49%
for the world pool at the same depth. England is 77%. Every national figure runs
above the world figure because a federation's women's list is short, so a fixed-depth
cut reaches much further down it: the top 100 English women are 41% of the entire
English women's pool, the top 100 women worldwide are 0.3% of theirs. At that depth
the comparison is no longer elite against elite.

**So the claim worth defending is a shape, not a number.** The share runs from
roughly 25% to 79% across individually defensible specifications, and the choice that
dominates is who you count as a player. 49% is the answer for the global elite at
top-100. 77% is the answer for a mid-sized national federation at the same depth.
Both are answers, to different questions.

---

## 6. Peak age

**The claim tested:** elite women peak earlier and burn out faster.

> ⚠️ **Two versions of this analysis exist and they disagree. Only the second is live.**
> The notebook (`analysis.ipynb`, cells 38–42) still contains a superseded version that
> ranked on rating alone with **no activity filter**, and reported mean peak ages of
> **30.1 for women against 29.9 for men** from a pool of 55 men and 50 women. That
> version let retired women's frozen ratings into the elite pool and its figures are
> **withdrawn**. The live version — the one behind the deck's figure, in
> `figs/make_figs.py::fig_peakage` — is active players only and is reported below.
> **The notebook has not been updated to match.** Anyone reproducing from the notebook
> will get the withdrawn numbers.

**Design.** The unit of analysis is the **player**, not the snapshot. For each monthly
snapshot take the top N by rating for each sex, union those sets across all 130
snapshots into an "ever-elite" pool, reconstruct each player's rating-versus-age
trajectory (`age = snapshot year − birth year`), and take the age at each player's
single highest observed rating — one row per player. Restricted to **active players**,
and run at **two ranking depths** so the result is not an artefact of where the cut
falls.

| Depth | Women | Men | Difference | p |
|---|---|---|---|---|
| Top 100 a side | **28.4** | **29.7** | women 1.3 years earlier | 0.20 |
| Top 25 a side | **29.2** | **28.7** | women 0.5 years later | 0.84 |

**Neither difference is significant, and the sign does not survive a change of depth.**
That second fact is the stronger of the two: a real effect does not reverse when you
move the cut from 100 to 25. Report this as *no detectable difference*, not as a small
one in either direction.

Note also that FIDE records birth **year** only, so `age` is an integer. Differences of
well under a year are finer than the resolution of the variable they are computed from.

Separately, mean trajectories plateau around 2750 for men and 2500 for women, and that
~250-point gap barely varies with age — so it is not explained by peak timing, career
length, or age-related decline.

> **Not currently derivable from the deck's figure:** pool sizes, standard deviations
> and confidence intervals for the active-only version. `fig_peakage` carries hardcoded
> means and p-values only. The p-values are enough to support the claim above; a CI
> would need the analysis re-run and stored. Do not reuse the withdrawn version's
> n = 55/50 and σ = 8.0/8.6 to construct one — they belong to a different pool.

### Right-censoring: "how do you know they don't peak next month?"

The fair objection. For any player still active, the observed maximum is a **lower
bound** on the true career peak, and the observed peak age is biased *downward* by
however much career is still to come.

Two things bound the damage:

1. **It is symmetric.** Censoring applies to men and women in the same window under
   the same rule. The quantity reported is a *difference* between two means, and a
   bias that hits both sides equally largely cancels out of it. This assumes the two
   pools sit at comparable career stages relative to the window — see below.
2. **The window is wide relative to the effect claimed.** The burnout hypothesis
   asserts that women peak *substantially* earlier. Eleven years of continuous monthly
   observation, centred on mean peak ages of 28–30, covers the disputed region.

The claim this supports is therefore bounded: **no earlier peak is visible in eleven
years of monthly data.** That is a different sentence from *"women do not peak earlier"*,
and the difference matters, because for anyone still playing the observed peak is a lower
bound on the real one.

**Also note:** trajectories are truncated at the *left* too. Players who peaked before
2015 — Judit Polgár, the Kasparov-era men — appear only in their late careers, which
may inflate the apparent peak age in both distributions.

### On the pool-construction rule

An alternative design is to rank by **career peak rating within the window** and take a
fixed 25 or 50 a side, rather than unioning the monthly top-N. It is defensible but
carries a bias the current rule avoids: peak-within-window is a maximum over however
many months a player was observed, so long-tenured players post higher observed maxima
than equally strong short-tenured ones. That selects the pool toward players already
established in 2015, who are **older** — which is precisely the variable being
measured. The per-month rule compares each player against contemporaries instead.

Worth running as a **robustness check** rather than a replacement: if both rules give
the same answer, that is a one-line strengthening of the result.

## 7. Participation over time

Women were **9.5%** of active FIDE players in July 2015 and are **10.4%** now — both
figures on single monthly lists, so the ratio here is the single-snapshot 8.59:1 rather
than the analysis pool's 8.26:1 (§1). That is less than one percentage point in a
decade, a linear rate of **0.086 pp/year** taken between the two endpoints. Held at that
pace the line crosses 15% around **2080** and 50% around **2485**, and the ratio moves
from 8.59:1 today to 7.0:1 in 25 years.

Those dates are worth about as much as the model behind them, which is not much. A
straight line through a bounded quantity has to break eventually, and fitting the slope
across all 130 snapshots rather than between the endpoints gives 0.059 pp/year, which
pushes 15% out to the 2100s. Read the dates as *"not within any planning horizon"*
rather than as forecasts.

Running the whole decomposition month by month across all 130 snapshots (single-month
ratings, harmonised 2000+ pool) shows **no trend in the residual** over eleven years:
−0.22 pp/year at top-100 (95% CI −0.43 to −0.00, p = 0.046), −0.00 at top-25
(p = 0.97), −0.08 at top-10 (p = 0.42).

**This test has almost no power, and that is the point.** Participation improved from
9.54:1 to 8.59:1, about 10%. Holding both rating distributions frozen at their 2026
shape and moving only the ratio, that improvement predicts the explained share should
fall 3.0 pp. It fell 3.3 pp. The series does exactly what a fixed pair of
distributions and a slowly improving ratio predict, to within a third of a
percentage point — leaving no room to detect distributional convergence either way.

The decomposition is a **snapshot statistic, not a trait estimate**: at 1:1
participation it is 0% by construction. It answers "how much of today's gap is
attributable to today's imbalance". Its flatness is evidence for neither side.

---

## 8. Attrition

**The claim tested:** women leave competitive chess earlier, so the female pool is
younger and less experienced at every rating.

**Design.** Take every player active in April of each year 2016–2021. Ask whether
they are still on the list and still active five years later. Compare women with men
**matched on rating band and cohort** via a Mantel-Haenszel odds ratio (a logistic
model with the same controls agrees to two decimal places). A 1400 rating floor is
applied throughout, because FIDE raised the published bottom from 1000 to 1400 during
2024–25 and women are more than twice as likely to sit below it — without the floor,
administrative removal would be counted as attrition, unevenly by sex.

**The raw gap is almost entirely composition.** Women survive at 48.5% against 55.3%
for men, a 6.8 pp deficit. Match on rating and age and nearly all of it disappears:
the female pool is far younger and slightly weaker, and juniors churn.

What survives matching is confined to one life stage:

| Age at baseline | Men | Women | Odds ratio | 95% CI |
|---|---|---|---|---|
| under 13 | 63.3% | 68.1% | **1.37** | [1.25, 1.50] |
| 13–17 | 43.5% | 44.2% | **1.19** | [1.15, 1.24] |
| 18–24 | 48.9% | 41.5% | **0.86** | [0.83, 0.89] |
| 25–39 | 54.0% | 52.0% | 0.96 | [0.92, 1.00] |
| 40–59 | 61.5% | 60.5% | 1.01 | [0.96, 1.07] |
| 60+ | 55.6% | 53.8% | 0.99 | [0.91, 1.07] |

Girls are *more* likely than matched boys to still be playing five years later. The
reversal happens between 17 and 18 and is gone again by 25. It holds in all six
cohorts separately (0.83–0.90), so it is not a pandemic artefact, and it widens with
horizon (0.97 at two years, 0.86 at five, 0.73 at eight, 0.65 at ten) — a steady leak
rather than a cliff.

**But it is a club-level effect**, which is what matters for §4:

| Ages 18–24, baseline rating | Odds ratio | 95% CI |
|---|---|---|
| 1400+ | 0.86 | [0.83, 0.89] |
| 1600+ | 0.87 | [0.83, 0.91] |
| 1800+ | 0.91 | [0.86, 0.96] |
| 2000+ | 1.05 | [0.96, 1.15] |
| 2200+ | **1.28** | [1.05, 1.55] |

Above 2000 the gap closes; above 2200 it reverses. The top-100 comparison in §4 is
drawn from players rated far above 2200, and in exactly that population women are
retained at least as well as men. **Differential drop-out among established strong
players is not the missing half.** This is a negative result and is reported as one.

What the finding does support is a claim about the *pipeline*: the pool of women who
might one day be elite is thinned at club level in early adulthood, ages 18–24. That
is a statement about where the participation ratio comes from, not about the residual
it leaves behind.

---

## 9. Queen's Gambit

Interrupted time series on monthly first-appearance counts (a player's `fideid`
appearing in a snapshot for the first time), burn-in to July 2017, Covid marker at
March 2020, intervention at October 2020, window closed December 2024. OLS with
HAC(6) standard errors. Chess.com join dates are used as a volume signal only — the
API exposes no gender, and the sample is a convenience sample, not a random one.

**Result:** it worked, but only online. FIDE registrations never spiked, because
Covid had cancelled the tournaments. A good example of an on-ramp that did not reach
the rated game.

---

## 10. Limitations

- **The normal fit overstates the extreme tail.** Sampling-based estimates of the
  very top are optimistic for both sexes. This partly cancels in a comparison, but
  not exactly. It is the reason nothing here fits a curve.
- **n = 1 at the top.** Carlsen versus the top woman is two individuals. Single-point
  extremes are high-variance; that is why top-1 is reported but never headlined.
- **The 130 snapshots are not independent.** Largely the same people month to month.
  Treat it as one longitudinal dataset, not 130 samples.
- **Activity bias.** "Active" is a FIDE administrative category and inactivity rates
  may differ by sex.
- **Matching is not selection control.** A rated woman is a more selected individual
  than a rated man at every level, because the filter into the rated population is
  tighter. Nothing here controls for that.
- **Standard lists only.** Rapid- and blitz-only players are absent (§1).
- **March 2024 rating adjustment.** A genuine discontinuity; handled by the 2000+
  harmonisation wherever a claim crosses it (§1).
- **Chess.com sample.** ~12,000 profiles across six countries, convenience-sampled.

### What the residual could be

Four candidates, named because refusing to name them looks evasive:

1. **Differential selection into the pool.** The women in the FIDE pool are not a
   random sample of women. If more has to go right for a woman to reach rated play at
   all, the female rating distribution is already a filtered object, and its shape
   reflects the filter.
2. **Greater male variance.** The variability hypothesis: same mean, wider male
   spread, so more men at both extremes. The spread difference is **present and
   measurable in this dataset** — on the April 2026 active list, σ = 223 for men
   against 198 for women, a variance ratio of **1.27**, stable across rating floors
   (σ ratio 1.08–1.16 from a 1400 floor up to a 2000 floor, so not a floor artefact).
   That is a fact about *ratings*, not about ability, and **this data cannot separate
   it from (1)**: a rated woman is a more selected individual than a rated man, and
   selection compresses a distribution, so a smaller observed spread is exactly what
   a tighter filter produces. Note also that this difference is not a counterargument
   to §4 — §4's null is one shared distribution, and the residual it measures *is*
   this distributional difference, quantified rather than denied.
3. **Retention and investment.** Time in the game, coaching hours, tournament access.
   These shift both mean and tail without touching innate anything.
4. **Model error.** See above.

---

## 11. Corrections

This analysis has been revised twice, both times downward, both times because the
error was found here rather than by a reviewer.

**The withdrawn 55% figure.** An earlier version fitted a **normal** to the female
population and drew a male-sized sample from it. Two faults: it mixed **inactive**
players' frozen ratings into the comparison, so live ratings were being compared
against ratings frozen years ago, which flattered the sampling explanation; and the
decomposition it produced was internally inconsistent. The fitted normal also missed
the observed female maximum by over 100 Elo — a model that cannot reproduce reality
at the observed N cannot support a counterfactual at a different N. **Do not quote
55%.** The corrected figures are in §4.

**Population figures reconciled.** 545,549 is everyone with a rating on the April 2026
list. The analysis runs on active players only, and "active" means active on any of the
last twelve monthly lists rather than on the April list alone, because §4 averages each
player's rating across those twelve snapshots: 251,137 men and 30,420 women, 8.26:1. On
the April list by itself the figures are 194,192 men and 22,611 women, 8.59:1, which is
the pair §7 quotes. An earlier version of this document labelled the union counts as the
April subset and carried 8.3:1 into §7, where it did not belong.

---

## References

- Bilalić M, Smallbone K, McLeod P, Gobet F (2009). Why are (the best) women so good at chess? Participation rates and gender differences in intellectual domains. *Proc. R. Soc. B* 276(1659), 1161–1165.
- Knapp M (2010). Are participation rates sufficient to explain gender differences in chess performance? *Proc. R. Soc. B* 277(1692), 2269–2270.
- Chabris C & Glickman M (2006). Sex differences in intellectual performance: analysis of a large cohort of competitive chess players. *Psychological Science* 17(12), 1040–1046.
- Arnold S, Bailey R, Ma A, Cimpian A (2023). Checking gender bias: parents and mentors perceive less chess potential in girls. *J. Experimental Psychology: General*.
- Maass A et al. (2008) · Stafford T (2018) · Smerdon D et al. (2020), on stereotype threat at the board.
- Galitis I (2002), on girls in mixed-gender school chess clubs.
- Shahade J (2005). *Chess Queens*. Siles Press.
