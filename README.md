# Women in chess analysis

*A data-heavy chess story about ratings, gender gaps, and one very famous Netflix show.*

This project asks a simple question: are the biggest claims in chess culture actually true in the data?

Instead of hot takes, we use monthly FIDE rating snapshots (from July 2015 onward), parse them into parquet, and run reproducible analysis in `fide.ipynb`.

## What this project does

- Builds a longitudinal FIDE dataset month by month (resumable and memory-safe)
- Compares female and male player trends over time
- Tests the Queen's Gambit surge with counterfactual modeling
- Reconstructs elite player trajectories and peak ages
- Simulates a participation-equalized world to estimate how much of the rating gap is pure sample-size math

If you like chess + stats + "wait... is that actually true?", you're in the right repo.

## Data pipeline (the fun part where your laptop does not explode)

FIDE publishes monthly rating lists as zipped XML files.

This repo's `build_dataset.py` pipeline:

1. Downloads monthly snapshots from FIDE (`2015-07` to current month)
2. Skips files already downloaded/processed (fully resumable)
3. Streams XML with `iterparse` one player at a time
4. Drops unrated records
5. Writes typed parquet snapshots to `data/fide_parquet/YYYY-MM.parquet`

Result: flat memory usage, restart-safe processing, and fast downstream analysis.

## Quick start

At the root for the project, run:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python build_dataset.py
jupyter notebook fide.ipynb
```

## Repo map

- `build_dataset.py` - downloads and parses FIDE monthly lists into parquet
- `chesscom_fetch.py` - samples Chess.com profiles and builds signup timestamps cache
- `fide.ipynb` - main analysis notebook and visualizations
- `data/fide_parquet/` - month-by-month FIDE parquet snapshots
- `data/chesscom/signups.parquet` - cached Chess.com signup sample

## The analysis arc

### Q1: The Queen's Gambit effect
Did female FIDE signups jump after October 2020, and by how much versus trend?

### Q2: The Polgar chapter
Where does Judit Polgar rank relative to top women in the modern snapshot window?

### Q3: Peak age
Do elite women and men peak at different ages, or is timing similar and level different?

### Q4: Counterfactual participation
If women participated at male volumes, how much of the top-end Elo gap would remain?

## Why this is interesting

Chess debates often jump straight to biology. This project checks whether participation, selection, and structure can explain a large share of observed gaps before making stronger claims.

In short: fewer opinions, more evidence.

## Notes and caveats

- FIDE data reflects rated over-the-board activity, not casual/online-only players
- Cross-era Elo comparisons can be distorted by rating pool changes
- Some analyses rely on sampled Chess.com data (`chesscom_fetch.py`) rather than complete platform totals
- Counterfactual results are directional estimates, not immutable constants

## Optional extras

Some notebook cells also use packages not listed in `requirements.txt` (for example `prophet` and `scipy`). Install them only if you plan to run those sections.

## References

- Bilalic, M., Smallbone, K., McLeod, P., & Gobet, F. (2009). *Proceedings of the Royal Society B*, 276(1657), 1161-1165.
- Howard, R. W. (2014). *Journal of Biosocial Science*, 46(3), 386-392.
- FIDE rating list archive: http://ratings.fide.com/download_lists.phtml
