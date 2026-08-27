# Contributing

Thanks for being here. This repo is a data journalism project about women in chess,
and the thing it cares most about is being **right**. That means the most valuable
contribution is not always code. Finding a number that does not hold up is worth more
than a new feature.

## Ways to help

**Challenge a finding.** The best contribution. If a figure looks wrong, or a method
looks like it is doing more work than it can support, say so. See
[Challenging a result](#challenging-a-result) below.

**Fix the pipeline.** `pipeline/build_dataset.py` and `pipeline/chesscom_fetch.py` talk to live APIs
that change under us. FIDE has shifted its URL patterns before.

**Add a question.** The notebook answers four. There are more worth asking: title
distributions, junior pipelines, federation level differences, time control splits.
Open an issue with the question and the data you would use before writing code.

**Improve the site.** Lives on a separate branch, see [Two branches](#two-branches).

**Fix prose.** Typos, unclear sentences, broken links. Send the PR straight in, no
issue needed.

For anything larger than a typo, open an issue first. It saves you writing something
that duplicates work already in progress.

## Getting set up

```bash
git clone https://github.com/anp-exe/women-in-chess-analysis.git
cd women-in-chess-analysis
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
jupyter notebook analysis.ipynb
```

Two things worth knowing before you clone:

**The repo is large.** The 130 monthly FIDE parquet snapshots are tracked in git, so
the clone is a couple of gigabytes. The upside is that you do not need to rebuild the
dataset to run the notebook. Everything the analysis reads is already on disk after a
clone.

**You only need `pipeline/build_dataset.py` for new months.** It downloads and parses FIDE's
monthly XML lists into `data/fide_parquet/YYYY-MM.parquet`. It is fully resumable and
skips anything already there, so running it just adds whatever month has appeared
since. A cold build downloads over a gigabyte and takes a while.

`pipeline/chesscom_fetch.py` is slower still, roughly two hours cold, because it rate limits
itself to be polite to the public API. The result is cached at
`data/chesscom/signups.parquet`, which is committed, so you should never need to run it.

## Two branches

| branch            | holds                       | deploy                                          |
|-------------------|-----------------------------|-------------------------------------------------|
| `main`            | notebook, pipeline, figures | none                                            |
| `gh-pages-source` | the Next.js site            | Actions, "Deploy to GitHub Pages", run manually |

Analysis PRs go to `main`. Site PRs go to `gh-pages-source`. They are genuinely
separate trees, so a PR that mixes both cannot be merged cleanly. Deploys are manual
(`workflow_dispatch`) and are not run automatically on merge.

## Working in the notebook

`analysis.ipynb` is the main artefact, and it is read on GitHub as much as it is run.
A few conventions keep it readable:

**Restart and run all before you commit.** Outputs are committed on purpose so the
notebook reads like an article without anyone executing it. Stale outputs sitting
under changed code are worse than no outputs.

**Every analysis cell needs a Findings cell.** Plain language, stating what the
numbers mean and what they do not. If you cannot write the Findings cell, the analysis
is not finished.

**Keep comments short.** Explain the choice a reader would question, not what the code
does. No banner comments, no boxed headers, no paragraphs restating the markdown above
the cell. Reasoning that runs longer than a line or two belongs in the markdown cell
above the code, where a reader will actually find it.

**Newer standalone sections define their own paths and imports** so they can be run
without executing the whole notebook. Follow that pattern for anything new.

Notebook diffs are unreadable in a plain PR view. Describe your change in words in the
PR body, and consider `nbdime` locally.

## Data conventions

- **Active players only.** FIDE's `flag` field contains `i` for inactive. Roughly 60%
  of the database is inactive at any snapshot, carrying ratings frozen at retirement.
  Almost every claim in this project filters them out. If your analysis does not, say
  why in the cell.
- **Ages are integers, plus or minus a year.** FIDE records birth year, not birth date.
  A difference of a few months is finer than the variable's resolution and should not
  be reported as a finding.
- **Parquet snapshots are tracked. Raw zips and CSV exports are not.** See `.gitignore`.
  Never commit `data/fide_raw/`.
- **`figures/` is generated output.** Regenerate it by running the cell, do not hand
  edit a CSV or a PNG.
- **No credentials, ever.** Nothing here needs a key, so nothing here should contain one.

## Challenging a result

This is the part that matters most, so it has its own rules.

The notebook is the record, and it carries its own corrections. This analysis has
already been revised twice, both times downward, both times because the error was found
in house. That is the standard: errors get written up in the open, in the notebook,
with the old figure named, rather than quietly patched.

If you think a number is wrong, open an issue with:

1. which number, and where it appears (notebook cell, README, site)
2. what you ran, or what argument you are making
3. what you got instead

You do not need a fix to file this. A well aimed objection is a contribution.

If a correction moves a headline figure, the PR should update the notebook, the README
and the site copy together, and say plainly in the notebook what the old figure was. A
number that disagrees with itself across three places is how the last error survived as
long as it did.

One standing note: **the withdrawn 55% figure should not be quoted.** It came from a
normal fit that missed the observed female maximum by over 100 Elo and mixed inactive
players into the comparison. The methodological note on the counterfactual, in the
notebook, has the detail. The current figures are 44% at top 25 through 61% at
top 1000.

## Pull requests

One topic per PR. Commit messages that say what changed and why, in plain words.

Before you open it:

- [ ] notebook restarted and run top to bottom
- [ ] every new analysis cell has a Findings cell
- [ ] the notebook's methodological notes updated if a method or a number changed
- [ ] README and site copy updated if a headline number moved
- [ ] figures regenerated rather than edited
- [ ] no raw data, no credentials
- [ ] change described in words in the PR body

## Conduct

This subject attracts strong opinions, and a fair few of them arrive already angry.
The rule here is simple: argue with the data.

Disagreement is the point of the project, so bring it. Bring counter evidence, bring a
better method, bring the paper that says otherwise. What does not belong is arguing
about people rather than results, or treating the repo as a venue for settled opinions
about who belongs in chess. Bad faith gets closed without discussion.

Be generous with people who are new to this, whether new to chess, to statistics, or to
git. Most of them are here because they care about the same question you do.

## Licence

There is no LICENSE file yet. If you want to reuse the code, the derived data, or the
figures, open an issue and ask. The FIDE rating lists are FIDE's, and the Chess.com
sample comes from their public API under their terms.

## Questions

Open an issue. For anything about the analysis itself, tag it `methods` so it does not
get lost among the code.
