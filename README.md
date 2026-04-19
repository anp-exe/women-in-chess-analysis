# FIDE rating analysis

*Four questions about gender and competitive chess, answered with 130 months of FIDE rating data.*

---

## Why this exists

I play chess. Not well — but enough to notice that the women I play against are almost never in the same tournament as the men. FIDE runs separate women's titles, separate women's world championships, separate women's circuits. The implicit logic is that women can't compete with men at the top level.

Judit Polgár played in the men's open her entire career and peaked at world #8. She refused a women's world championship spot at age 15. She is the only woman ever to have broken the top ten.

That's one data point. These are 130 of them.

---

## The data

FIDE publishes a monthly snapshot of every rated player on earth — name, country, sex, rating, title — as a zipped XML file. This project downloads every snapshot from July 2015 to the present (~130 files), streams through each one with `iterparse` to keep memory flat, filters out unrated players, and writes a typed parquet file per month.

```
FIDE archive (monthly zips, ~30–50 MB each compressed)
        ↓
Cached downloader — skips files already on disk, 1s between requests
        ↓
Stream parser — iterparse, one <player> at a time, clear() after each
        ↓
Type conversion + filter (drop players with no rating in any format)
        ↓
data/fide_parquet/YYYY-MM.parquet  (one file per snapshot)
        ↓
Lazy loader — each analysis pulls only the columns + rows it needs
```

The full store is ~1.1 GB on disk. The pipeline is fully resumable: re-running skips anything already processed.

**Setup**

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python build_dataset.py   # ~10 min, safe to interrupt and resume
jupyter notebook fide.ipynb
```

---

## Q1 — The Netflix effect

*Did The Queen's Gambit cause a surge in new female players?*

The Queen's Gambit premiered on Netflix on 23 October 2020 and became one of the most-watched limited series in the platform's history. Chess.com reported a 700% spike in new accounts in the weeks after release. The question is whether any of that translated into rated FIDE players — a higher bar than creating an online account.

To test this, we count active female players in every monthly snapshot and fit a linear pre-trend on the 2015–2020 window, then compare the actual post-release trajectory to the counterfactual. Male player counts serve as a control group: any general chess boom should lift both series; a Queen's Gambit effect should lift women disproportionately.

We also track **true new sign-ups** — players whose FIDE ID appears for the first time in a given year — to distinguish between activating dormant players and recruiting genuinely new ones.

---

## Q2 — The Polgár chapter

*Who is the highest-rated female player of all time?*

Judit Polgár. Not close.

Her peak rating of 2735 (July 2005) remains the highest ever recorded for a female player — and would place her in the top 50 active players today. She spent 25 years in the open (men's) circuit, defeated Kasparov, Karpov, and Anand in classical games, and retired in 2014 to focus on chess education.

This section builds the all-time leaderboard of peak ratings for female players across every snapshot in the dataset, then zooms in on Polgár's career arc: rating over time, the titles she declined, and what her trajectory looks like against the field.

---

## Q3 — Peak age

*When do top female players hit their peak rating, and does it differ from men?*

For every player who ever reached a rating of 2400 or above, we build a trajectory: rating plotted against age (snapshot year minus birth year), and locate the peak. We then compare the distribution of peak ages for women versus men.

Elite chess peak is typically somewhere in the early-to-mid thirties for men. The female distribution is harder to read cleanly because the sample is smaller and career attrition (dropping off the rating list, retirement) is higher. Both effects are worth separating.

Visualisations: overlaid career trajectory plots for the top N players of each sex, and a ridgeline/distribution plot of peak ages.

---

## Q4 — The counterfactual

*If equal numbers of women and men played chess, what would the rating gap look like?*

This is the methodological heart of the project, anchored to a 2009 paper by Bilalić, Smallbone, McLeod & Gobet (*Proceedings of the Royal Society B*). They found that roughly 96% of the gap between the best male and best female German chess players is explained by participation rates alone — a statistical consequence of drawing extremes from populations of very different sizes.

The intuition: if you draw the top value from 100,000 samples versus 12,000 samples from the same underlying distribution, the top value from the larger pool will almost always be higher. It is not a signal about the distribution — it is arithmetic.

**Method**

1. Fit a distribution to current male ratings (normal, log-normal, skew-normal — select by AIC).
2. Fit the same distribution type to female ratings.
3. Compare fitted parameters: are the means materially different once you account for the participation gap?
4. Monte Carlo: draw N_male samples from the *female* fitted distribution, 10,000 iterations. Record the simulated top-100 each time.
5. Plot: actual female top-100 / actual male top-100 / simulated female top-100 at male participation levels.

Headline target: *"If as many women played rated chess as men, we'd expect the top female rating to sit around XXXX ± YY — compared to Polgár's actual peak of 2735."*

---

## Limitations

**Rating inflation.** FIDE ratings have drifted upward over time due to pool expansion and rating floor effects. Cross-era comparisons (e.g. Polgár 2005 vs a 2025 player) are not apples-to-apples.

**Inactive players.** The dataset filters to players with at least one rated game in a given month. Players who stop competing drop off the list; their last known rating is not carried forward. This creates survivorship effects in trajectory analyses.

**Participation ≠ interest.** Getting a FIDE rating requires entering an official tournament, paying fees, and in some countries joining a national federation. The Netflix effect on casual or online play was almost certainly larger than anything visible here.

**Selection effects.** The women who do reach the top of the FIDE list are not a random sample of women interested in chess — they are the ones who navigated a system with fewer female role models, fewer women-only pathways at the junior level, and (in many countries) significant cultural friction. The counterfactual model addresses the participation gap but not the pipeline gap.

---

## What I'd do next

- **Country-level heterogeneity.** The participation gap varies enormously by country. Georgia and China have very different female representation than Western Europe. Disaggregating by federation would sharpen the counterfactual model.
- **Rapid and blitz subsets.** FIDE added rapid and blitz ratings in 2012. The format differences and shorter time commitments may show different gender patterns.
- **Youth ratings.** Junior (under-18) FIDE lists have been published separately. The pipeline for the gender gap starts at the youth level; tracking cohorts from junior to senior ratings would be more informative than a cross-sectional snapshot.
- **Interrupted time series, properly.** The Queen's Gambit analysis here is exploratory. A full ITS model with autoregressive terms and a formal test of the intervention effect would make it publishable.

---

## References

Bilalić, M., Smallbone, K., McLeod, P., & Gobet, F. (2009). Why are (the best) women so good at chess? Participation rates and gender differences in intellectual domains. *Proceedings of the Royal Society B*, 276(1657), 1161–1165.

Howard, R. W. (2014). Gender differences in intellectual performance persist at the limits of individual capabilities. *Journal of Biosocial Science*, 46(3), 386–392.

FIDE rating list archive: http://ratings.fide.com/download_lists.phtml
