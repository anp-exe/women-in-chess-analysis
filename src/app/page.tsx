"use client";

import { useEffect, useRef, useState } from "react";
import ChessGameViewer from "@/components/ChessGameViewer";
import ParticipationSlider from "@/components/ParticipationSlider";

const BASE = "/women-in-chess-analysis";

// Judit sits at the top on her all-time peak (2735, July 2005, published FIDE
// records; she retired in 2014 so she does not appear in a current list at all).
// Everyone below her is the top 10 active women in the April 2026 FIDE
// snapshot, at their April 2026 rating. Photos live in /public; entries with
// photo: null fall back to an initials circle.
const topWomen = [
  { name: "Judit Polgár", country: "HUN", flag: "🇭🇺", photo: "polgar_judit.jpg", rating: 2735, when: "2005 peak", note: "all-time peak, retired 2014" },
  { name: "Hou Yifan", country: "CHN", flag: "🇨🇳", photo: "hou_yifan.jpg", rating: 2596, when: "Apr 2026" },
  { name: "Lei Tingjie", country: "CHN", flag: "🇨🇳", photo: "tingjie_lei.png", rating: 2566, when: "Apr 2026" },
  { name: "Ju Wenjun", country: "CHN", flag: "🇨🇳", photo: "ju_wenjun.jpg", rating: 2559, when: "Apr 2026" },
  { name: "Zhu Jiner", country: "CHN", flag: "🇨🇳", photo: "zhu_jiner.jpg", rating: 2554, when: "Apr 2026" },
  { name: "Koneru Humpy", country: "IND", flag: "🇮🇳", photo: "koneru.jpg", rating: 2535, when: "Apr 2026" },
  { name: "Tan Zhongyi", country: "CHN", flag: "🇨🇳", photo: "zhongyi_tan.png", rating: 2535, when: "Apr 2026" },
  { name: "Aleksandra Goryachkina", country: "FID", flag: "🏳️", photo: "goryachkina.jpg", rating: 2534, when: "Apr 2026" },
  { name: "Anna Muzychuk", country: "UKR", flag: "🇺🇦", photo: "muzychuk_anna.jpg", rating: 2522, when: "Apr 2026" },
  { name: "Bibisara Assaubayeva", country: "KAZ", flag: "🇰🇿", photo: "assaubayeva_bibisara.png", rating: 2516, when: "Apr 2026" },
  { name: "Divya Deshmukh", country: "IND", flag: "🇮🇳", photo: "deshmukh_divya.png", rating: 2510, when: "Apr 2026" },
];

function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function FadeUp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`fade-up ${inView ? "in-view" : ""} ${className}`}>
      {children}
    </div>
  );
}

function PlotCard({
  src,
  figureNumber,
  title,
  caption,
}: {
  src: string;
  figureNumber: string;
  title: string;
  caption?: string;
}) {
  return (
    <div className="bg-paper p-6 rounded-lg shadow-sm border border-sage-100">
      <p className="text-xs uppercase tracking-widest text-sage-600 mb-2">{figureNumber}</p>
      <h3 className="text-2xl font-serif mb-4">{title}</h3>
      <img src={src} alt={title} className="w-full rounded" />
      {caption ? <p className="text-xs text-sage-600 mt-3 italic">{caption}</p> : null}
    </div>
  );
}

function StatCard({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="bg-sage-50 p-8 rounded-lg border border-sage-100 hover:border-sage-200 transition-colors">
      <p className="text-xs uppercase tracking-widest text-sage-600 mb-3">{label}</p>
      <p className="stat-number text-6xl md:text-7xl mb-3">{value}</p>
      {hint ? <p className="text-sm text-ink/70 leading-relaxed">{hint}</p> : null}
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-paper text-ink">
      <section className="relative min-h-screen flex flex-col px-6 py-8 md:py-10 bg-gradient-to-b from-sage-50 to-paper">
        {/* MOBILE: a normal flow row at the top so the two items sit side by side
            and can never overlap. Hidden at md+. */}
        <div className="flex md:hidden w-full items-start justify-between gap-4">
          <div className="w-28 shrink-0">
            <img
              src={`${BASE}/battersea.png`}
              alt="Preview of the Women in Chess, through the data talk slide"
              className="w-full rounded border border-sage-200 shadow-sm"
            />
            <p className="text-matcha text-[0.6rem] uppercase tracking-[0.2em] mt-2 mb-1">Upcoming talk</p>
            <p className="text-sage-700 text-xs font-serif italic leading-snug">
              Women in Chess, through the data
            </p>
            <p className="text-sage-600 text-[0.7rem] tracking-wide mt-1">Battersea Chess Club · 25 August</p>
            <p className="text-sage-600 text-[0.7rem] tracking-wide">Open to all</p>
          </div>
          <p className="text-matcha text-[0.65rem] tracking-widest text-right shrink">
            Major revisions made 8 August 2026
          </p>
        </div>

        {/* DESKTOP: absolutely positioned corners, out of flow, so the headline
            centres against the full viewport height. Hidden below md. */}
        <div className="hidden md:block absolute top-6 left-6 w-48">
          <img
            src={`${BASE}/battersea.png`}
            alt="Preview of the Women in Chess, through the data talk slide"
            className="w-full rounded border border-sage-200 shadow-sm"
          />
          <p className="text-matcha text-[0.65rem] uppercase tracking-[0.25em] mt-3 mb-1">Upcoming talk</p>
          <p className="text-sage-700 text-sm font-serif italic leading-snug">
            Women in Chess, through the data
          </p>
          <p className="text-sage-600 text-xs tracking-wide mt-1">Battersea Chess Club · 25 August</p>
          <p className="text-sage-600 text-xs tracking-wide">Open to all</p>
        </div>
        <p className="hidden md:block absolute top-6 right-6 text-matcha text-xs tracking-widest">
          Major revisions made 8 August 2026
        </p>

        {/* DESKTOP: table of contents, bottom right. */}
        <nav className="hidden md:block absolute bottom-6 right-6 text-right">
          <p className="text-matcha text-[0.65rem] uppercase tracking-[0.25em] mb-2">12 min read</p>
          <ul className="flex flex-col gap-1 text-sm text-sage-600">
            <li><a href="#boom" className="hover:text-sage-800 transition-colors">1 · Two sides of the boom</a></li>
            <li><a href="#judit" className="hover:text-sage-800 transition-colors">2 · Judit Polgár</a></li>
            <li><a href="#peak-age" className="hover:text-sage-800 transition-colors">3 · Peak age</a></li>
            <li><a href="#counterfactual" className="hover:text-sage-800 transition-colors">4 · The counterfactual</a></li>
            <li><a href="#prediction" className="hover:text-sage-800 transition-colors">5 · The prediction</a></li>
            <li><a href="#takeaway" className="hover:text-sage-800 transition-colors">The takeaway</a></li>
          </ul>
        </nav>

        <div className="flex-1 flex flex-col justify-center items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sage-600 text-sm uppercase tracking-[0.3em] mb-8">A data story</p>
          <h1 className="text-[6rem] sm:text-[9rem] md:text-[13rem] font-serif leading-[0.9] mb-10 text-sage-700">
            <span style={{ fontVariantNumeric: "lining-nums", fontSize: "0.75em", fontWeight: 600 }}>1</span> in 9
          </h1>
          <p className="text-xl md:text-2xl text-sage-700 font-serif italic mb-12 leading-relaxed">
            One in nine FIDE rated chess players is a woman.
            <br />
            This is a data story about why.
          </p>
          <p className="text-sage-600 text-sm tracking-widest">SCROLL ↓</p>
        </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-24">
        <FadeUp>
          <h2 className="text-4xl font-serif mb-8">The question</h2>
          <div className="prose-cream">
            <p>
              When Netflix released <em>The Queen's Gambit</em> in October 2020, the chess world expected a
              revolution. A fictional orphan named Beth Harmon beat every male grandmaster in sight,
              millions of viewers discovered the game, and the streaming numbers broke records. I wanted
              to know whether any of that showed up in the actual data.
            </p>
            <p>
              This is a personal project built from 130 monthly snapshots of the <strong>FIDE</strong> (Fédération Internationale des Échecs, the World Chess Federation) rating database,
              covering July 2015 through April 2026. The most recent snapshot contains 545,549 rated
              players, of whom 216,803 are currently active. The rest are inactive or retired players
              carrying frozen ratings, and every claim below about current players filters them out.
              Roughly one in ten active players is a woman. Alongside that, I sampled around 12,000
              chess.com profiles across six countries to reconstruct online signup patterns.
            </p>
          </div>
        </FadeUp>
      </section>

      <section id="boom" className="scroll-mt-6 bg-sage-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Part one</p>
            <h2 className="text-5xl font-serif mb-8">Two sides of the boom</h2>
            <div className="prose-cream">
              <p>
                Chess.com was quiet on the morning of October 23rd, 2020. By the end of November it was
                adding over 100,000 new members every single day. The company reported roughly 2.8 million
                people signed up in November alone.
              </p>
              <p>
                  I trained a Prophet time series model (Meta's open-source forecasting tool, designed to capture trend and seasonality) on pre show signup data from August 2017 through
                September 2020, then used it to forecast what chess.com growth would have looked like if
                  <em>The Queen's Gambit</em> never aired. The gap between forecast and reality is the show's effect.
              </p>
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <PlotCard
              src={`${BASE}/chesscomsignup.png`}
              figureNumber="Figure 1"
              title="Chess.com signups vs Prophet counterfactual"
              caption="Calibrated to the median of three public benchmarks: 2.8 million signups in November 2020, 100 million total members by December 2022, and 150 million by October 2023. Pre intervention training MAPE 38.6 percent."
            />
          </FadeUp>

          <FadeUp className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                value="~84M"
                label="Excess signups"
                hint="Cumulative chess.com signups associated with the post October 2020 boom, through December 2024, compared to the Prophet counterfactual."
              />
              <StatCard
                value="4 yrs"
                label="Persistence"
                hint="The actual signup curve never returns to the forecast baseline. The show did not cause a temporary spike. It shifted the trajectory permanently."
              />
            </div>
          </FadeUp>

          <FadeUp className="mt-20">
            <div className="prose-cream">
              <p>
                But the same analysis on FIDE's rating list told a completely different story. When I
                looked at new FIDE registrations rather than chess.com accounts, the trend did not spike
                after October 2020. It crashed.
              </p>
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <PlotCard
              src={`${BASE}/fidenewsignup.png`}
              figureNumber="Figure 2"
              title="New FIDE registrations by sex, 2017 to 2026"
              caption="The dashed line is the interrupted time series counterfactual with the Covid term kept but no show effect. Covid cancelled in person tournaments worldwide in 2020, and FIDE registrations require tournament play. Both series recover after late 2020 at a proportionally similar rate, which is what a pandemic recovery looks like, not a female specific Queen's Gambit surge."
            />
          </FadeUp>

          <FadeUp className="mt-12">
            <blockquote className="quote-big">
              The boom was real, but it happened online. New fans became online players, not tournament
              competitors, and in the tournament data, women and men recovered from Covid at the same
              pace.
            </blockquote>
          </FadeUp>
        </div>
      </section>

      <section id="judit" className="scroll-mt-6 max-w-2xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Part two</p>
          <h2 className="text-5xl font-serif mb-6">Judit Polgár</h2>
          <img src={`${BASE}/polgar_young.jpg`} alt="A young Judit Polgár playing a simultaneous exhibition" className="w-full rounded shadow-sm mb-3" />
          <p className="text-xs text-sage-600 italic mb-8">A young Judit Polgár playing a simultaneous exhibition. Source: Flickr.</p>
          <div className="prose-cream">
            <p>
              Judit Polgár was born in Budapest in 1976, the youngest of three sisters raised by their
              father László as a deliberate experiment in nurture over nature. László believed that
              geniuses are made, not born, and set out to prove it by homeschooling all three daughters
              exclusively in chess from early childhood. The experiment worked. All three became titled
              players. Judit became something the chess world had never seen.
            </p>
            <p>
              At 15 years and 4 months she became the youngest Grandmaster in history, breaking the record
              previously held by Bobby Fischer. She did not earn a Women's Grandmaster title. She earned
              the open Grandmaster title, competing against men. She spent her career refusing to play in
              women only tournaments. Her peak rating of 2735 in July 2005 placed her 8th in the world,
              the only woman ever to enter the global top 10.
            </p>
            <p>
              Here is the statistic that says the most about how far ahead of the field she was. Judit
              retired in 2014 with a rating of 2675. More than a decade later, that number would still
              make her the highest rated woman in the world, 79 points clear of Hou Yifan, the strongest
              active female player today. She has not played a rated game in over eleven years, and she
              would still be first by a margin wider than the one separating today's number one from
              today's number five.
            </p>
          </div>
          <blockquote className="quote-big">
            I don't think about whether I am a woman or a man when I sit at the chessboard. I just think
            about chess.
            <footer className="text-right text-base not-italic mt-3 text-sage-600">Judit Polgár</footer>
          </blockquote>
        </FadeUp>

        <FadeUp className="mt-12">
          <p className="text-xs uppercase tracking-widest text-sage-600 mb-2">Figure 3</p>
          <h3 className="text-2xl font-serif mb-6">Judit, and the top 10 women today</h3>
          <div className="space-y-2">
            {topWomen.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center gap-4 p-3 bg-sage-50 rounded hover:bg-sage-100 transition-colors cursor-default"
              >
                <span className="text-sage-400 font-serif text-xl w-8">{i === 0 ? "★" : i}</span>
                {p.photo ? (
                  <img src={`${BASE}/${p.photo}`} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-sage-200 flex-shrink-0" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full border border-sage-200 flex-shrink-0 bg-sage-100 flex items-center justify-center text-sage-600 font-serif text-sm"
                    aria-label={p.name}
                  >
                    {initials(p.name)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {p.name} <span className="mx-1">{p.flag}</span><span className="text-sage-600 text-sm">{p.country}</span>
                  </p>
                  {p.note && <p className="text-xs text-sage-600 italic">{p.note}</p>}
                </div>
                <div className="text-right">
                  <p className="stat-number text-xl">{p.rating}</p>
                  <p className="text-xs text-sage-600">{p.when}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-sage-600 mt-4 italic">
            Judit is listed on her all time peak of 2735 from July 2005, taken from published FIDE
            records, since it pre dates this dataset and she retired in 2014. The ten players below her
            are the highest rated active women in the April 2026 FIDE list, shown at their April 2026
            rating.
          </p>
        </FadeUp>

        <FadeUp className="mt-16">
          <img src={`${BASE}/hou_yifan_big.jpg`} alt="Hou Yifan at a tournament" className="w-full rounded shadow-sm" />
          <p className="text-xs text-sage-600 italic mt-3">
            Hou Yifan, the highest rated active female player in this dataset with a peak of 2683 within
            the dataset window. Her official career peak of 2686 came in March 2015, just before this
            dataset begins. She remains the only woman to follow Polgár into the global top 100. Source: Wikipedia.
          </p>
        </FadeUp>

        <FadeUp className="mt-20">
          <div className="prose-cream">
            <p>
              On September 9th, 2002, in round 5 of the Russia vs The Rest of the World match in Moscow,
              Judit Polgár sat across from Garry Kasparov. He was rated 2838. She was rated 2681. Years
              earlier, Kasparov had called her a "circus puppet" and said women should stick to having
              children. Polgár chose the Berlin Defence line that Kasparov himself had used against
              Kramnik, forcing him to play against his own preparation.
            </p>
            <p>She won. Press play.</p>
          </div>
        </FadeUp>

        <FadeUp className="mt-8">
          <ChessGameViewer />
        </FadeUp>
      </section>

      <section id="peak-age" className="scroll-mt-6 bg-sage-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Part three</p>
            <h2 className="text-5xl font-serif mb-8">When does the peak come?</h2>
            <div className="prose-cream">
              <p>
                A common claim in chess commentary is that women peak earlier than men, or drop out
                faster. I wanted to test it. For every monthly snapshot in the dataset I pulled the top
                25 active players of each sex, unioned those pools across all 130 months, and then
                reconstructed each player's full rating vs age trajectory.
              </p>
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <PlotCard
              src={`${BASE}/ages.png`}
              figureNumber="Figure 4"
              title="Career trajectories of top 25 ranked players per sex, 2015 to 2026"
              caption="Thick lines are the mean rating by age within each sex. Thin lines are individual player trajectories."
            />
          </FadeUp>

          <FadeUp className="mt-12">
            <PlotCard
              src={`${BASE}/ages2.png`}
              figureNumber="Figure 5"
              title="Distribution of peak ages across the elite pool"
            />
          </FadeUp>

          <FadeUp className="mt-12">
            <div className="grid grid-cols-2 gap-6">
              <StatCard
                value="30.1"
                label="Mean peak age, women"
                hint="Top 25 per snapshot, all players. 50 women, 9 of them retired with frozen ratings."
              />
              <StatCard
                value="29.9"
                label="Mean peak age, men"
                hint="Top 25 per snapshot, all players. 55 men, only 1 of them retired."
              />
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <div className="prose-cream">
              <p>
                The difference is 0.2 years, which looks like a clean answer. It is not, and the rest of
                this section explains why. What is solid is the other half of the picture: at every age
                the mean rating trajectory for men sits around 250 Elo points above the mean for women,
                and that gap stays remarkably constant from age 20 to age 50. Whatever separates the two
                groups, it is a difference in level rather than in timing.
              </p>
            </div>
          </FadeUp>

          <FadeUp className="mt-20">
            <h3 className="text-2xl font-serif mb-6">One correction, and a steadier answer</h3>
            <div className="prose-cream">
              <p>
                The original figure had a flaw. The pool was never filtered for activity, and retired
                players keep a frozen rating on file. Nine of the fifty women in it had ratings that
                barely moved across the entire decade, against one of fifty five men, and picking the
                highest point on a flat line calls it a career peak when it is really just a retirement
                rating. Dropping those players is simply the right thing to do.
              </p>
              <p>
                Rebuilt on active players only, and this time taking exactly the hundred highest rated
                women and the hundred highest rated men rather than a shifting monthly list, the answer is
                steadier than the first pass suggested. At the very top, the top 25 a side, women peak at
                29.2 and men at 28.7. Across the top 100 a side, women peak at 28.4 and men at 29.7. The
                point estimates are small, they sit within a year or so of each other, and they even swap
                direction between the two depths. Neither difference is statistically significant.
              </p>
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <PlotCard
              src={`${BASE}/ages_top25_active.png`}
              figureNumber="Figure 6"
              title="Top 25 active players per sex"
              caption="The 25 highest rated active players of each sex. Dotted lines mark the mean peak age: women 29.2, men 28.7. A difference of half a year, not statistically significant (p = 0.84)."
            />
          </FadeUp>

          <FadeUp className="mt-12">
            <div className="grid grid-cols-2 gap-6">
              <StatCard
                value="29.2"
                label="Mean peak age, women"
                hint="The 25 highest rated active women. Half a year older than the men here, the opposite direction to the top 100, and not statistically significant."
              />
              <StatCard
                value="28.7"
                label="Mean peak age, men"
                hint="The 25 highest rated active men. Among the very best players, the two sexes peak at essentially the same age."
              />
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <PlotCard
              src={`${BASE}/ages_top100_active.png`}
              figureNumber="Figure 7"
              title="Top 100 active players per sex"
              caption="The 100 highest rated active players of each sex. Women peak at 28.4, men at 29.7. A difference of 1.3 years, in the other direction to the top 25, and again not statistically significant (p = 0.20)."
            />
          </FadeUp>

          <FadeUp className="mt-12">
            <div className="grid grid-cols-2 gap-6">
              <StatCard
                value="28.4"
                label="Mean peak age, women"
                hint="The 100 highest rated active women. The original 30.1 figure was inflated by retired players whose frozen ratings were counted as peaks."
              />
              <StatCard
                value="29.7"
                label="Mean peak age, men"
                hint="The 100 highest rated active men. The gap to the women is 1.3 years and not statistically significant, so no reliable peak-age difference can be claimed."
              />
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <div className="prose-cream">
              <p>
                The verdict is clear: at the elite level women and men peak at the same age. Across both
                cuts of the data the means sit within a year of each other and the tiny difference even
                changes direction, once at 29.2 against 28.7 and once at 28.4 against 29.7. The tidy 0.2
                years from the original chart was partly an artefact of retired players, and cleaning that
                up does not open a gap, it confirms there is not one. The folk belief that top women peak
                early and fade young simply is not in this data. Peak timing is not where the difference
                between elite men and women lives.
              </p>
              <p>
                What is not in doubt is the other half of the picture. At every age from the early
                twenties to the fifties the mean rating line for men sits around 250 Elo above the line
                for women, and that distance barely changes across the whole span. Whatever the gap
                between elite men and women is, it is a difference in level, held steady across a career,
                rather than a difference in the timing of the peak. Peak age is a dead end here. Peak
                level is where the real question lives, which is exactly what the counterfactual below
                takes apart.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section id="counterfactual" className="scroll-mt-6 max-w-2xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Part four</p>
          <h2 className="text-5xl font-serif mb-8">The counterfactual</h2>
          <div className="prose-cream">
            <p>
              If men and women play chess with the same underlying skill distribution but eight times as
              many men play, then the best man will beat the best woman in the dataset. Not because men
              are better, but because drawing eight times more samples from a distribution gives you a
              higher maximum. This is a property of statistics, not biology. The effect was documented at
              the German national level by Bilalić and colleagues in 2009. I wanted to see how much of it
              held at the international FIDE elite.
            </p>
            <p>
              I pooled the ratings of all 251,137 active men and 30,420 active women into one empirical
              distribution (the null hypothesis that both sexes draw from the same skill pool) and then ran
              a Monte Carlo simulation of the top order statistics. If the only difference between the
              groups were how many people play, how big a gap would we expect at the top? No fitted
              distribution, no normality assumption: the simulation draws from the actual ratings.
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <div className="bg-sage-50 p-8 rounded-lg border border-sage-100">
            <p className="text-xs uppercase tracking-widest text-sage-600 mb-6">
              Share of the gap explained by sample size alone, by ranking depth
            </p>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">Top 25</span>
                  <span className="stat-number text-3xl">44%</span>
                </div>
                <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matcha transition-all duration-1000"
                    style={{ width: "44%" }}
                  />
                </div>
                <p className="text-xs text-sage-600 mt-1">110 of the 253 Elo gap · spread across simulated worlds 29 to 57%</p>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">Top 100</span>
                  <span className="stat-number text-3xl">49%</span>
                </div>
                <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matcha transition-all duration-1000"
                    style={{ width: "49%" }}
                  />
                </div>
                <p className="text-xs text-sage-600 mt-1">136 of the 275 Elo gap · spread across simulated worlds 40 to 58%</p>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">Top 1000</span>
                  <span className="stat-number text-3xl">61%</span>
                </div>
                <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matcha transition-all duration-1000"
                    style={{ width: "61%" }}
                  />
                </div>
                <p className="text-xs text-sage-600 mt-1">212 of the 346 Elo gap · spread across simulated worlds 58 to 65%</p>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">
                    Top 10,000
                    <span className="text-xs text-sage-600 font-normal ml-2">club level, see note</span>
                  </span>
                  <span className="stat-number text-3xl">68%</span>
                </div>
                <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matcha/60 transition-all duration-1000"
                    style={{ width: "68%" }}
                  />
                </div>
                <p className="text-xs text-sage-600 mt-1">322 of the 471 Elo gap · spread across simulated worlds 67 to 69%</p>
              </div>
            </div>
            <p className="text-xs text-sage-600 mt-6">
              The percentages are precise; the ranges show how much the gap would vary from luck alone if
              history were rerun, not doubt about the estimate. At top 1, a single player against a single
              player, the number is too noisy to lean on. The top 10,000 tier is faded because it is a
              different comparison: ten thousand players is the top 4 percent of men but the top third of
              women, so it measures club level chess, and some of the higher share there is just a deeper
              slice of the female population being pulled in.
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <div className="prose-cream">
            <p>
              Between 44 and 61 percent of the top level gap is explained by participation numbers alone,
              and the share grows the deeper into the rankings you look, reaching 68 percent once the
              comparison widens to ten thousand players a side. The further you get from the single
              outlier at the very top, the more of the gap is pure sample size mathematics. What remains
              at every depth reflects a genuine difference between the male and female rating
              distributions.
            </p>
            <p>
              This is a weaker effect than the 96 percent Bilalić found at the German national level. The
              international elite is a more selected pool, and that selection is where the remainder of
              the gap lives. The distribution difference is not evidence that women are less capable
              at chess. It is evidence that the women who make it into the international FIDE elite are a
              more heavily filtered group than the men, shaped by coaching access, tournament culture,
              retention rates, and stereotype threat. The data describes the gap. The chess community has
              to explain it.
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <ParticipationSlider />
        </FadeUp>

        <FadeUp className="mt-16">
          <h3 className="text-2xl font-serif mb-6">Why numbers matter</h3>
          <div className="prose-cream">
            <p>
              The idea is simple. The more people who play, the more chances at an exceptional one. With
              about eight men playing for every woman, the male game gets far more rolls of the dice at
              the top, and that alone lifts the male best above the female best. Give women equal numbers
              and their top players rise to close much of the gap.
            </p>
            <p>
              The counterfactual puts a size on it: equal participation closes roughly 44 percent of the
              gap across the top 25 and about half across the top 100. The effect is smaller right at the
              summit, where a single outlier, Magnus Carlsen, sits well clear of everyone, and larger
              across the broader elite. Either way, a substantial part of the gap is not about ability at
              all. It is about how many women are in the game.
            </p>
          </div>
        </FadeUp>
      </section>

      <section id="prediction" className="scroll-mt-6 bg-sage-50 py-24 px-6">
        <div className="max-w-2xl mx-auto">
        <FadeUp>
          <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Part five</p>
          <h2 className="text-5xl font-serif mb-8">The one number that would fix it, and how slowly it moves</h2>
          <div className="prose-cream">
            <p>
              If participation drives roughly half the elite gap, then the honest forward question is not
              how big the gap is today, but whether the thing that closes it is actually moving. So here is
              a prediction rather than a description. The share of active FIDE players who are women has
              risen from 9.5 percent in 2015 to 10.4 percent now. That is real progress, but it is less
              than one percentage point in a decade.
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <PlotCard
            src={`${BASE}/participation_trend.png`}
            figureNumber="Figure 8"
            title="Women as a share of active FIDE players, with the current pace extended"
            caption="The line is observed monthly data; the dotted extension holds the recent pace constant. It does not reach even 15 percent until around 2080, and true parity, half of all players, is centuries beyond the edge of this chart."
          />
        </FadeUp>

        <FadeUp className="mt-12">
          <div className="grid grid-cols-2 gap-6">
            <StatCard value="~2080" label="When women reach just 15% of players" hint="Holding the recent pace of under 0.1 points a year. This is not parity, only 15 percent; genuine parity at 50 percent is centuries away." />
            <StatCard value="7.7 : 1" label="Men-to-women ratio in 25 years" hint="On the current pace, easing only from today's 8.6:1. The pipeline is filling at a crawl." />
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <div className="prose-cream">
            <p>
              That is the real conclusion, and it reframes everything above it. The Queen's Gambit gave
              online chess a jolt but barely touched tournament registrations. Judit Polgár was a
              generational outlier, not the front of a wave. Peak ages are the same, so time is not the
              issue. The gap at the top is, to a large degree, a headcount problem, and the headcount is
              inching up so slowly that on its current path it will not close for generations.
            </p>
            <p>
              None of that is fixed by telling women to play better. It is fixed by more girls starting,
              and by more of them staying, which is exactly where the retention research and the tournament
              culture research point. The mathematics of the gap is the easy half. The number that drives
              it is a choice, and right now it is barely changing.
            </p>
          </div>
        </FadeUp>
        </div>
      </section>

      <section id="takeaway" className="scroll-mt-6 bg-sage-900 text-sage-50 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <p className="text-matcha text-sm uppercase tracking-[0.25em] mb-4">The takeaway</p>
            <h2 className="text-5xl font-serif mb-8 text-sage-50">What this actually says</h2>
            <div className="prose-cream">
              <p style={{ color: "#E1E7D4" }}>
                The online chess boom that followed <em>The Queen's Gambit</em> was real and durable, though the
                show shares the window with Covid and the streaming era, and formal competitive chess
                missed the wave because Covid cancelled it. Judit Polgár remains the greatest female
                player of all time at 2735, far ahead of anyone in the modern era. Men and women reach
                their rating peaks at the same age. And of the gap between the world's best men and best
                women, between 44 and 61 percent, growing with ranking depth, is just the mathematics of
                how many people play.
              </p>
              <p style={{ color: "#E1E7D4" }}>
                The conclusion is not that women are worse at chess. It is that we are systematically
                producing fewer elite female players than we should be, and that even equal participation
                would not fully close the gap without also addressing how female players are developed,
                supported, and retained. The sample size effect is the easy half. The harder half is
                cultural, and it takes longer to fix.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="bg-sage-50 py-24 px-6">
        <div className="max-w-2xl mx-auto">
        <FadeUp>
          <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Limitations</p>
          <h2 className="text-4xl font-serif mb-8">What this data cannot tell us</h2>
          <div className="prose-cream">
            <p>
              The FIDE dataset starts in July 2015, so players whose peak came earlier, including Polgár,
              Chiburdanidze, and Gaprindashvili, appear only at their retirement rating. About 60 percent
              of the FIDE database is inactive at any snapshot; every claim here about current players
              filters on FIDE's activity flag, and without that filter the numbers change materially. The
              chess.com signup figures come from a 12,000 profile sample calibrated to three published
              benchmarks, so the 84 million excess estimate is order of magnitude accurate, not precise,
              and it measures the whole post 2020 boom rather than the show alone. The Prophet model's
              pre intervention MAPE was 38.6 percent, which means individual monthly predictions are
              noisy. The Q4 counterfactual draws from the pooled empirical rating distribution, so it
              makes no normality assumption, but the share explained depends on ranking depth: 29 percent
              at top 1 with a wide interval, 44 at top 25, 49 at top 100, 61 at top 1000. The qualitative
              finding, that sample size is a major but not exclusive factor, is robust. Any single
              percentage is not.
            </p>
            <p>
              A note on revisions: an earlier version of this page reported that 55 percent of a 164 Elo
              gap was explained by sample size, based on a normal fit Monte Carlo that did not survive
              review. It mixed inactive players' frozen ratings into the comparison and its decomposition
              was internally inconsistent. The current figures come from a corrected method, order
              statistics on the pooled empirical distribution of active players, and the notebook now runs
              end to end with every number on this page traceable to a cell output. I am constantly
              reviewing this work and I would rather correct it in public than be quietly wrong. If you
              spot an error or have a better approach, suggestions and pull requests are welcome.
            </p>
            <p>
              It is worth being specific about why that number fell, because the reason is not the one
              people assume. Judit Polgár retired in 2014, but FIDE keeps a retired player's last rating
              on file, so her 2675 sat frozen in the database and was being picked up as the highest
              rated woman. The gap being measured was therefore Magnus Carlsen today against Judit Polgár
              twelve years ago, which came to 164 Elo. Compare him instead against the strongest woman
              actually still competing and the gap is 225.
            </p>
            <p>
              Rerunning the old method with only that one change, leaving everything else exactly as it
              was, moves the answer from 56 percent to 39 percent. The simulated sample size effect itself
              barely moved, from 92 Elo to 89; the shift came from measuring against the right benchmark.
              Either way the conclusion holds: participation accounts for a substantial share of the
              top-level gap.
            </p>
          </div>
        </FadeUp>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">What is left over</p>
          <h2 className="text-4xl font-serif mb-8">The candidates, and how good the evidence is</h2>
          <div className="prose-cream">
            <p>
              Participation arithmetic accounts for roughly half the gap across the elite. The rest is a
              difference between the two rating distributions, and this dataset cannot say what causes
              it. Other people have studied that question directly, and the evidence is genuinely uneven,
              so it is worth being clear about which explanations are well supported and which are still
              contested.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {[
              {
                title: "Early environment",
                strength: "Well supported",
                strong: true,
                body: "Where girls make up at least half of new young players, their starting ratings are no lower than boys'. Later work found the same pattern geographically: the rating gap is smaller in areas where more girls play.",
                cite: "Chabris & Glickman 2006, Psychological Science · Li, Glickman & Chabris 2025, CHANCE",
              },
              {
                title: "Tournament culture",
                strength: "Documented, not quantified",
                strong: true,
                body: "An open letter written by 14 French players in August 2023 grew to over 100 signatories within days and more than 120 since. It states that harassment and assault are among the main reasons women and teenage girls stop playing. Several signatories described being harassed by trainers at 14 or 15 and quitting.",
                cite: "\"We, women chess players\", open letter, 2023",
              },
              {
                title: "Retention",
                strength: "Mixed",
                strong: false,
                body: "Girls do drop out at higher rates in the raw data. Across nine years one cohort fell from 18 percent girls to 11 percent. But once boys and girls are matched on rating and starting age, the difference all but disappears and the retention curves track each other closely. Whatever drives the dropout, it is not simply being female.",
                cite: "Li, Glickman & Chabris 2025 · Chabris & Glickman 2006",
              },
              {
                title: "Stereotype threat",
                strength: "Genuinely disputed",
                strong: false,
                body: "Found, then not found, then found again. A 2008 experiment reported women playing worse when told their opponent was male. A 2018 analysis of tournament games found the opposite, that women slightly outperform expectations against men. A 2020 reanalysis argued the effect is there after all. This one is unresolved and anyone citing it confidently in either direction is overreaching.",
                cite: "Maass, D'Ettole & Cadinu 2008 · Stafford 2018 · Smerdon et al. 2020",
              },
            ].map((c) => (
              <div key={c.title} className="border-l-2 border-sage-200 pl-5">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h3 className="text-xl font-serif">{c.title}</h3>
                  <span
                    className={`text-[0.65rem] uppercase tracking-[0.2em] ${
                      c.strong ? "text-matcha" : "text-sage-600"
                    }`}
                  >
                    {c.strength}
                  </span>
                </div>
                <p className="text-sm text-ink/75 leading-relaxed mt-2">{c.body}</p>
                <p className="text-xs text-sage-600 italic mt-2">{c.cite}</p>
              </div>
            ))}
          </div>

          <div className="prose-cream mt-8">
            <p>
              None of these is proven to be the cause, and they are not mutually exclusive. What can be
              said is that every one of them is a claim about circumstances rather than capacity, and
              that the two best supported entries on this list both point the same way: when girls enter
              chess in equal numbers and under equal conditions, the difference at entry is not there to
              begin with.
            </p>
          </div>
        </FadeUp>
      </section>

      <section className="bg-sage-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">About</p>
            <h2 className="text-4xl font-serif mb-10">Anna</h2>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 items-start">
              <img src={`${BASE}/anna_chess.jpg`} alt="Anna at a chess tournament" className="w-full rounded shadow-sm" />
              <div className="prose-cream">
                <p>
                  AI student at King's College London with an associate data scientist certification,
                  working mostly in Python. Outside academia I occasionally trade blue light for a chess
                  board, and I play in the London Chess League. I reached 1500 in about a year of playing,
                  and was once among the higher ranked girls in my age group.
                </p>
                <p>
                  I volunteer at the London Women's Chess Club, where I coach beginners unofficially and
                  run the website. This project was inspired by the work of Bilalić et al., and by
                  curiosity about whether the same pattern would hold among the FIDE elite.
                </p>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <a
                href="https://github.com/anp-exe/women-in-chess-analysis"
                className="inline-block px-6 py-3 bg-sage-700 text-paper rounded hover:bg-sage-800 transition-colors text-sm tracking-wide"
              >
                Code on GitHub →
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      <footer className="max-w-2xl mx-auto px-6 py-12 text-center text-xs text-sage-600 tracking-wider space-y-2">
        <p>Built with Next.js, Tailwind, and Recharts</p>
        <p>Data: FIDE monthly rating lists (Jul 2015 to Apr 2026) and Chess.com public API</p>
      </footer>
    </main>
  );
}
