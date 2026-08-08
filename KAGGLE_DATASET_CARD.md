# FIDE Chess Ratings: 130 Monthly Snapshots (2015 to 2026)

**Subtitle:** Every FIDE standard rating list from July 2015 to April 2026, one tidy row per player per month.

## Overview

This dataset is a longitudinal panel of the official FIDE (International Chess Federation) standard rating list. It stitches together 130 consecutive monthly snapshots into a single tidy table, with one row per player per month. That structure lets you track how any player's rating, activity, and title changed over more than a decade, and how the global chess population grew and shifted.

It covers all rated players of every federation, sex, age, and strength, from the 1001 rating floor up to the world number one. It is a general chess dataset: nothing is filtered to a subgroup.

At a glance:

- **47,759,284** rows (player month observations)
- **575,624** unique players
- **130** monthly snapshots, **July 2015** through **April 2026**
- **210** national federations represented
- **24,653** unique titled players (GM, IM, FM, CM and the women's equivalents)
- Ratings range from **1001** to **2882**

The player population itself grew over the window, from 214,727 rated players in the July 2015 list to 545,549 in April 2026.

## File

| File | Rows | Description |
|------|------|-------------|
| `fide_ratings.csv` | 47,759,284 | The full tidy panel, one row per player per monthly snapshot. |

## Column dictionary

Definitions follow FIDE's own published field legend from the download page.

| Column | Type | Meaning |
|--------|------|---------|
| `fide_id` | integer | FIDE identification number, unique and stable per player. Join key across snapshots. |
| `name` | string | Player name as published by FIDE, format "Surname, Given". |
| `sex` | string | `M` (male) or `F` (female). Blank in the source for a small number of players (see caveats). |
| `federation` | string | Three letter FIDE federation code (for example `IND`, `RUS`, `USA`). |
| `title` | string | Highest FIDE playing title. `GM`, `IM`, `FM`, `CM` and women's titles `WGM`, `WIM`, `WFM`, `WCM`. Blank for untitled players. |
| `w_title` | string | Women's title where separately recorded (`WGM`, `WIM`, `WFM`, `WCM`). Blank otherwise. |
| `o_title` | string | Other FIDE titles, comma separated. Arbiter, organizer, trainer and instructor codes such as `IA`, `FA`, `NA`, `IO`, `FT`, `FST`, `DI`, `NI`. Blank otherwise. |
| `rating` | integer | Standard (classical) FIDE rating for that month. Always present in this dataset. |
| `games` | integer | Number of standard rated games played in the rating period. |
| `k` | integer | Standard rating K factor (development coefficient), for example 40, 20, 10. |
| `birth_year` | integer | Year of birth. Blank where unknown or implausible (see caveats). |
| `flag` | string | FIDE activity and women marker. `i` inactive, `wi` woman inactive, `w` woman active. Blank means an active player. |
| `snapshot_month` | string | The rating list month in `YYYY-MM` format. Combine with `fide_id` for a unique key. |

Every `(fide_id, snapshot_month)` pair is unique, so `snapshot_month` plus `fide_id` uniquely identifies a row.

## Provenance and how it was built

The data comes from the monthly Full Rating List archive published at `https://ratings.fide.com/download_lists.phtml`. Each month FIDE releases standard, rapid, and blitz lists in TXT and XML. This dataset uses the **standard** (classical) list only.

The build pipeline downloads each monthly standard rating list XML, parses every `<player>` record, adds a `snapshot_date` for the list month, and writes a typed file per month. The 130 monthly files were then concatenated and cleaned into the single tidy table published here. The build pulls from a public, unauthenticated endpoint and contains no credentials.

## Cleaning steps applied

The following steps were applied when turning the raw monthly lists into this dataset:

1. **Concatenation.** All 130 monthly standard lists were combined, tagging each row with its `snapshot_month`.
2. **Dropped unrated and junk rows.** Rows with no standard rating, a zero rating, or a missing FIDE id or name were removed. This dropped only 32 rows out of roughly 47.76 million, so the source lists were already very clean.
3. **Dropped empty columns.** The source XML schema carries `rapid_rating`, `rapid_games`, `rapid_k`, `blitz_rating`, `blitz_games`, and `blitz_k` fields, but these are completely empty in the standard list (zero non null values across all 130 files). They were dropped rather than shipped as all blank columns. If you need rapid or blitz ratings, use FIDE's separate rapid and blitz lists.
4. **Normalized birth year.** Year of birth values outside the plausible range of 1900 to 2026 were set to blank (this catches the common zero placeholder).
5. **Standardized the month field.** `snapshot_month` was written as `YYYY-MM`.
6. **Typed the columns.** Ratings, games, K factor, and birth year are integers, with blanks preserved for missing values rather than filled with zeros.

## Validation summary

The published file passed the following checks:

- No duplicate `(fide_id, snapshot_month)` pairs (47,759,284 unique keys equal to the row count).
- No missing standard ratings and no blank or whitespace only names.
- Every federation code is exactly three characters.
- Rating range 1001 to 2882, K factor 0 to 40, standard games 0 to 168, all within expected bounds.
- Sex split by unique players: 511,731 male, 65,219 female, 250 unknown.

The largest federations by unique players are India (57,280), Russia (46,130), Spain (40,604), France (38,868), and Germany (36,224).

## Known quirks and caveats

This is a faithful copy of FIDE's published data, so a few source level quirks remain by design. Handle them in your own filtering if they matter for your analysis.

- **Blank sex.** About 12,857 rows (250 players) have no sex recorded in the source and appear blank.
- **Birth year placeholders.** A small number of active players carry an implausible `birth_year` of exactly 1900 (33 players), which is a placeholder for unknown rather than a real date of birth. A handful of very young birth years (2020 and later) also appear and are likely data entry errors. Filter on plausible ages if birth year precision matters.
- **Flag doubles as a women marker.** The `flag` field encodes both inactivity and a women marker (`w`, `wi`), so it partly overlaps with `sex`. Use `sex` for gender and `flag` for activity.
- **Rare title codes.** One player carries the rare women's honorary code `WH`. This is a legitimate FIDE title, not an error.
- **Inactive players are included.** Roughly half of all rows are marked inactive (`flag = i` or `wi`). A player can appear for many months after their last game. Filter on `flag` if you want active players only.
- **Standard ratings only.** Rapid and blitz are not included, by design.
- **Names are as published by FIDE**, including any diacritics or transliteration choices in the source.

## Suggested uses

- Track individual rating trajectories and career arcs over a decade.
- Study the growth and geographic spread of the rated chess population.
- Analyze rating distributions and how they shift by federation, age cohort, or sex.
- Model title progression (for example the path from untitled to CM, FM, IM, GM).
- Study activity and dropout using the `flag` field and per month presence.
- Build birth year cohort or age curve analyses of playing strength.

## License and attribution

The underlying rating lists are produced and published by FIDE. FIDE asserts copyright over its site content and rating lists. This dataset is a derived, restructured copy of publicly downloadable FIDE standard rating lists, shared for research and educational use.

Please attribute FIDE as the original source and link to `https://ratings.fide.com/download_lists.phtml`. Before publishing, review FIDE's terms and privacy policy and set the Kaggle license field conservatively (for example an attribution or "other, see description" option) rather than asserting a permissive open license, since the source terms are restrictive.

*Dataset compiled from 130 monthly FIDE standard rating lists, July 2015 to April 2026.*
