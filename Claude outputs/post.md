# Is participation really all there is to the Elo gap?

In 2009 an academic named Merim Bilalić and his colleagues asked how much of the Elo gap in chess was down to participation. Their answer: [96 percent of it](https://royalsocietypublishing.org/doi/10.1098/rspb.2008.1576). The headline conclusion read, *"there is little left for biological and cultural explanations to account for."*

But that was one national federation. How much of it holds at the FIDE elite?

I explored this and a few other burning questions in my project [1 in 9](https://anp-exe.github.io/women-in-chess-analysis/), which I have now given two talks on. It runs on eleven years of [FIDE rating data](https://ratings.fide.com/download_lists.phtml), 130 monthly snapshots from July 2015 to April 2026, and around 12,000 chess.com profiles sampled through the [public API](https://www.chess.com/news/view/published-data-api). Every chart below is live. Hover it.

## Did The Queen's Gambit boost female participation in FIDE?

EMBED HERE: fig-fide-registrations

Well. It is inconclusive. Covid killed over the board tournaments, and you need tournament play to get a FIDE rating, so everything that happened in late 2020 happened on chess.com instead. Men's and women's registrations fall and recover together. That is what a pandemic looks like, not a female specific surge. At the intervention itself the level change is 20 registrations a month for women, p = 0.60.

Chess.com on the other hand saw an unprecedented number of signups.

EMBED HERE: fig-chesscom-signups

About 84 million more than my Prophet counterfactual through December 2024, and four years on the curve never comes back down to the baseline. It cannot all be the show though. Lockdown, the streaming boom and Beth Harmon all landed in the same eighteen months, and nothing in this data separates them.

## Do women in the FIDE elite peak earlier than men?

No. Among the top 25 active players a side, women peak at 29.2 and men at 28.7 (p = 0.84). At the top 100 it flips the other way, 28.3 against 29.7, and is still not significant.

EMBED HERE: fig-peak-age

The players who make it to elite level are staying there at the same rates. Junior girls are a different story, and I will come back to that.

## If women played in the same numbers, how big would the gap be?

I simulated 10,000 worlds in which men and women drew from exactly the same pool of ratings, anything up to Magnus Carlsen's. The only difference was how many goes each side got, in the ratio FIDE actually shows: 251,137 active men against 30,420 active women.

EMBED HERE: fig-decomposition

At the FIDE top 100, **half of the 275 Elo gap is participation alone**, 136 points of it. Go deeper into the list, top 1,000 and top 10,000, and that share climbs to 68 percent. The more people who play, the more chances at an exceptional one. It is a weaker effect than Bilalić's 96 percent, and the reason is pool size: his 100 women came out of roughly 7,000 German players, mine out of 30,420 worldwide.

## So what is the other half?

139 Elo of difference between the two rating distributions, and my data cannot say what causes it. The published research can narrow it down.

- **Early environment.** Where girls make up at least half of new young players, their starting ratings are no lower than boys'. The gap is smaller in areas where more girls play. (Chabris & Glickman 2006; Li, Glickman & Chabris 2025)
- **Tournament culture.** The 2023 French open letter, written by 14 players and now carrying more than 120 signatories, names harassment and assault among the main reasons women and teenage girls stop playing.
- **Retention.** Girls do drop out faster in the raw data, one cohort falling from 18 percent to 11 percent over nine years. Match them to boys on rating and starting age and the curves track each other closely.
- **Stereotype threat.** Found in 2008, not found in 2018, found again in 2020. Unresolved, and anyone citing it confidently in either direction is overreaching.

Every one of those is a claim about circumstances rather than capacity.

## So when will women make up half of FIDE?

EMBED HERE: fig-parity

2479. Women went from 9.49 percent of active rated players in July 2015 to 10.43 percent in April 2026, which is 8.6 men for every woman. At that pace none of us will live to see parity.

## And finally, Judit

It is not a piece about women in chess without the legendary Judit Polgár. She retired in 2014 on 2675. Twelve years later that number would still make her the highest rated woman in the world, 79 points clear of Hou Yifan, and she has not played a rated game since.

IMAGE HERE: polgar_young.jpg, credit Flickr

She beat him in Moscow in 2002, playing the Berlin against his own preparation.

DIAGRAM HERE: chessboard icon in the toolbar, paste the game URL or PGN, then Insert

The conclusion is not that women are worse at chess. It is that we are producing far fewer elite women than we should be, and that closing the headcount gap on its own would not finish the job. The sample size half is the easy half. The cultural half takes longer.

Full write up, limitations, interactive versions of every chart and a replayable Polgár against Kasparov 2002: [anp-exe.github.io/women-in-chess-analysis](https://anp-exe.github.io/women-in-chess-analysis/). Code and data: [github.com/anp-exe/women-in-chess-analysis](https://github.com/anp-exe/women-in-chess-analysis).
