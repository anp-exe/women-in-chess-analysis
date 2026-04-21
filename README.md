# Women in Chess Analysis ♟️

*A data-heavy chess story about ratings, gender gaps, and one very famous Netflix show.*

This project asks a simple question:

> Are the biggest claims in chess culture actually true in the data?

Instead of hot takes, we use monthly FIDE (Fédération Internationale des Échecs, the World Chess Federation) rating snapshots (from July 2015 onward), a sampled slice of Chess.com signups, and run reproducible analysis in `analysis.ipynb`.

## What This Project Does

- Builds a longitudinal FIDE dataset month by month (resumable and memory-safe)
- Pulls a country-stratified Chess.com signup sample for volume signals FIDE doesn't carry
- Tests the *Queen's Gambit* surge with both an interrupted time series and a Prophet counterfactual
(Meta's open-source time series forecasting tool, designed to capture trend and seasonality)
- Reconstructs elite player trajectories and compares peak ages across sexes
- Runs a Monte Carlo simulation of a participation-equalized world to estimate how much of the rating gap is pure sample-size math

If you like chess + stats + "wait... is that actually true?", you're in the right repo.

## Data Pipeline (the fun part where your laptop does not explode)

FIDE publishes monthly rating lists as zipped XML files.

This repo's `build_dataset.py` pipeline:

1. Downloads monthly snapshots from FIDE (`2015-07` to current month)
2. Skips files already downloaded/processed (fully resumable)
3. Streams XML with `iterparse` one player at a time
4. Drops unrated records
5. Writes typed parquet snapshots to `data/fide_parquet/YYYY-MM.parquet`

Result: flat memory usage, restart-safe processing, and fast downstream analysis.

## The Other Half of the Data

FIDE tells you about rated, over-the-board players. It does not tell you how many people went and made a Chess.com account the week after Beth Harmon won them a tournament on Netflix. For that we need a different source.

`chesscom_fetch.py` does a small, polite job:

1. Pulls member lists for six countries (US, GB, IN, RU, DE, FR)
2. Randomly samples up to 2,000 usernames per country
3. Hits the public Chess.com profile API for each sampled user's join timestamp
4. Caches the result to `data/chesscom/signups.parquet`

It runs at ~0.25s per request and takes a couple of hours fresh. Once cached, the notebook just reads the parquet. Sample is not gender-tagged (the API doesn't expose it), so this source is used purely as a signup-volume signal.

## Quick Start

At the root of the project, run:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python build_dataset.py
jupyter notebook analysis.ipynb
```

## Repo Map

- `build_dataset.py` - downloads and parses FIDE monthly lists into parquet
- `chesscom_fetch.py` - samples Chess.com profiles and builds signup timestamps cache
- `analysis.ipynb` - main analysis notebook and visualisations
- `data/fide_parquet/` - month-by-month FIDE parquet snapshots
- `data/chesscom/signups.parquet` - cached Chess.com signup sample

## The Analysis Arc

Coverage validation across the full panel, sex breakdown, and a top-player snapshot to confirm the parquet pipeline matches what FIDE actually publishes.

- **Q1: *The Queen's Gambit* Effect**: Did female participation jump after October 2020, and by how much versus trend? Tested two ways: an interrupted time series on FIDE female signups (with Newey-West HAC standard errors), and a Prophet counterfactual forecast on the Chess.com signup sample.
- **Q2: The Polgar Chapter**: Where does Judit Polgar rank relative to top women in the modern snapshot window, and what does her trajectory look like in historical context?
- **Q3: Peak Age**: Do elite women and men peak at different ages? Punchline: no. Mean peak ages land around 30.1 for women and 29.9 for men — peak timing is essentially identical. The gap is in level, not age.
- **Q4: Counterfactual Participation**: If women participated at male volumes, how much of the top-end Elo gap would remain? Punchline: roughly 55% of the gap at the top is explained by sample-size math alone, given the observed ~8:1 male-to-female participation ratio.

## Methods Used

So you know what's under the hood before opening the notebook:

- Interrupted time series with Newey-West HAC standard errors (`statsmodels`)
- Prophet time-series forecasting with prediction intervals
- Monte Carlo simulation with normal-fit decomposition (`scipy`)
- Lazy parquet loading via `pyarrow.dataset`

## Why This Is Interesting?

Chess debates often jump straight to biology. This project checks whether participation, selection, and structure can explain a large share of observed gaps before making stronger claims.

In short: fewer opinions, more evidence.

## Notes and Caveats

- FIDE data reflects rated over-the-board activity, not casual or online-only players
- Cross-era Elo comparisons can be distorted by rating pool changes
- The Chess.com slice is a stratified sample of six countries, not the full platform
- Counterfactual results are directional estimates, not immutable constants

## References

- Bilalic, M., Smallbone, K., McLeod, P., & Gobet, F. (2009). *Proceedings of the Royal Society B*, 276(1657), 1161-1165.
- Howard, R. W. (2014). *Journal of Biosocial Science*, 46(3), 386-392.
- FIDE rating list archive: http://ratings.fide.com/download_lists.phtml
