"use client";

import { useEffect, useRef, useState } from "react";
import ChessGameViewer from "@/components/ChessGameViewer";

const BASE = "/women-in-chess-analysis";

const topWomenAllTime = [
  { name: "Judit Polgár", country: "HUN", flag: "🇭🇺", photo: "polgar_judit.jpg", rating: 2735, peakYear: 2005, note: "all-time peak, pre-dataset" },
  { name: "Hou Yifan", country: "CHN", flag: "🇨🇳", photo: "hou_yifan.jpg", rating: 2686, peakYear: 2015, note: "highest in this dataset" },
  { name: "Aleksandra Goryachkina", country: "RUS", flag: "🇷🇺", photo: "goryachkina.jpg", rating: 2611, peakYear: 2022 },
  { name: "Ju Wenjun", country: "CHN", flag: "🇨🇳", photo: "ju_wenjun.jpg", rating: 2604, peakYear: 2017 },
  { name: "Koneru Humpy", country: "IND", flag: "🇮🇳", photo: "koneru.jpg", rating: 2589, peakYear: 2009 },
  { name: "Anna Muzychuk", country: "UKR", flag: "🇺🇦", photo: "muzychuk_anna.jpg", rating: 2587, peakYear: 2012 },
  { name: "Zhu Jiner", country: "CHN", flag: "🇨🇳", photo: "zhu_jiner.jpg", rating: 2579, peakYear: 2024 },
  { name: "Susan Polgár", country: "HUN", flag: "🇭🇺", photo: "polgar_susan.jpg", rating: 2577, peakYear: 1996 },
  { name: "Xie Jun", country: "CHN", flag: "🇨🇳", photo: "xie_jun.jpg", rating: 2574, peakYear: 1996 },
  { name: "Mariya Muzychuk", country: "UKR", flag: "🇺🇦", photo: "muzychuk_mariya.jpg", rating: 2563, peakYear: 2016 },
];

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
      <section className="min-h-screen flex flex-col justify-center items-center px-6 py-24 bg-gradient-to-b from-sage-50 to-paper">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sage-600 text-sm uppercase tracking-[0.3em] mb-8">A data story</p>
          <h1 className="text-[9rem] md:text-[13rem] font-serif leading-[0.9] mb-10 text-sage-700">
            <span style={{ fontVariantNumeric: "lining-nums", fontSize: "0.75em", fontWeight: 600 }}>1</span> in 9
          </h1>
          <p className="text-xl md:text-2xl text-sage-700 font-serif italic mb-12 leading-relaxed">
            One in nine FIDE rated chess players is a woman.
            <br />
            This is a data story about why.
          </p>
          <p className="text-sage-600 text-sm tracking-widest">SCROLL ↓</p>
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
              covering July 2015 through April 2026. The most recent snapshot contains 545,549 active
              players, 11 percent of whom are women. Alongside that, I sampled around 12,000 chess.com
              profiles across six countries to reconstruct online signup patterns.
            </p>
          </div>
        </FadeUp>
      </section>

      <section className="bg-sage-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Part one</p>
            <h2 className="text-5xl font-serif mb-8">Two sides of the boom</h2>
            <div className="prose-cream">
              <p>
                Chess.com was quiet on the morning of October 23rd, 2020. By the end of November it was
                adding over 100,000 new members every single day. The company later confirmed 3.2 million
                people had signed up in the weeks following the show.
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
              caption="Calibrated to the published November 2020 benchmark of approximately 2.8 million signups. Pre intervention training MAPE 38.6 percent."
            />
          </FadeUp>

          <FadeUp className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                value="~70M"
                label="Excess signups"
                hint="Cumulative chess.com signups attributable to The Queen's Gambit between October 2020 and December 2024, compared to the Prophet counterfactual."
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
              caption="The dashed line is the pre intervention linear trend extrapolated forward. Covid cancelled in person tournaments worldwide in 2020, and FIDE registrations require tournament play. The 2024 spike reflects post pandemic recovery plus the ongoing online boom finally converting into competitive play."
            />
          </FadeUp>

          <FadeUp className="mt-12">
            <blockquote className="quote-big">
              The show worked. It just turned new fans into online players, not tournament competitors.
              FIDE could not see the boom because the boom happened somewhere else.
            </blockquote>
          </FadeUp>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-24">
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
          </div>
          <blockquote className="quote-big">
            I don't think about whether I am a woman or a man when I sit at the chessboard. I just think
            about chess.
            <footer className="text-right text-base not-italic mt-3 text-sage-600">Judit Polgár</footer>
          </blockquote>
        </FadeUp>

        <FadeUp className="mt-12">
          <p className="text-xs uppercase tracking-widest text-sage-600 mb-2">Figure 3</p>
          <h3 className="text-2xl font-serif mb-6">Top 10 female players by peak FIDE rating</h3>
          <div className="space-y-2">
            {topWomenAllTime.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center gap-4 p-3 bg-sage-50 rounded hover:bg-sage-100 transition-colors cursor-default"
              >
                <span className="text-sage-400 font-serif text-xl w-8">{i + 1}</span>
                <img src={`${BASE}/${p.photo}`} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-sage-200 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">
                    {p.name} <span className="mx-1">{p.flag}</span><span className="text-sage-600 text-sm">{p.country}</span>
                  </p>
                  {p.note && <p className="text-xs text-sage-600 italic">{p.note}</p>}
                </div>
                <div className="text-right">
                  <p className="stat-number text-xl">{p.rating}</p>
                  <p className="text-xs text-sage-600">{p.peakYear}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-sage-600 mt-4 italic">
            Judit's 2735 peak pre dates this dataset, which begins in July 2015. Her entry uses published
            FIDE historical records.
          </p>
        </FadeUp>

        <FadeUp className="mt-16">
          <img src={`${BASE}/hou_yifan_big.jpg`} alt="Hou Yifan at a tournament" className="w-full rounded shadow-sm" />
          <p className="text-xs text-sage-600 italic mt-3">
            Hou Yifan, the highest rated active female player in this dataset with a peak of 2686 in 2015.
            She remains the only woman to follow Polgár into the global top 100. Source: Wikipedia.
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

      <section className="bg-sage-50 py-24 px-6">
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
              <StatCard value="30.1" label="Mean peak age, women" />
              <StatCard value="29.9" label="Mean peak age, men" />
            </div>
          </FadeUp>

          <FadeUp className="mt-12">
            <div className="prose-cream">
              <p>
                The difference is 0.2 years. That is statistically indistinguishable and well within the
                standard deviation of both distributions. The folk belief that elite female players peak
                earlier than men is not supported by this data.
              </p>
              <p>
                What does differ is the rating itself. At every age, the mean rating trajectory for men
                sits around 250 Elo points above the mean for women, and this gap stays remarkably
                constant from age 20 to age 50. Peak timing is identical. Peak level is not.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-24">
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
              I fitted a normal distribution to the female rating population, then ran a Monte Carlo
              simulation. If 504,364 women played (the actual male population size), what rating would we
              expect the best one to reach?
            </p>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <div className="bg-sage-50 p-8 rounded-lg border border-sage-100">
            <p className="text-xs uppercase tracking-widest text-sage-600 mb-6">
              Decomposing the 164 Elo gap
            </p>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">Attributable to sample size alone</span>
                  <span className="stat-number text-3xl">55%</span>
                </div>
                <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matcha transition-all duration-1000"
                    style={{ width: "55%" }}
                  />
                </div>
                <p className="text-xs text-sage-600 mt-1">90 Elo points</p>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium">Attributable to distribution shape</span>
                  <span className="stat-number text-3xl">45%</span>
                </div>
                <div className="w-full h-3 bg-sage-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose transition-all duration-1000"
                    style={{ width: "45%" }}
                  />
                </div>
                <p className="text-xs text-sage-600 mt-1">74 Elo points</p>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp className="mt-12">
          <div className="prose-cream">
            <p>
              Over half the top level gap between Magnus Carlsen at 2839 and Hou Yifan at 2675 is
              explained by participation numbers alone. The remaining 45 percent reflects a genuine
              difference in the shape of male and female rating distributions at the top end.
            </p>
            <p>
              This is a weaker effect than the 96 percent Bilalić found at the German national level. The
              international elite is a more selected pool, and that selection is where the remainder of
              the gap lives. The distribution shape difference is not evidence that women are less capable
              at chess. It is evidence that the women who make it into the international FIDE elite are a
              more heavily filtered group than the men, shaped by coaching access, tournament culture,
              retention rates, and stereotype threat. The data describes the gap. The chess community has
              to explain it.
            </p>
          </div>
        </FadeUp>
      </section>

      <section className="bg-sage-900 text-sage-50 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <p className="text-matcha text-sm uppercase tracking-[0.25em] mb-4">The takeaway</p>
            <h2 className="text-5xl font-serif mb-8 text-sage-50">What this actually says</h2>
            <div className="prose-cream">
              <p style={{ color: "#E1E7D4" }}>
                <em>The Queen's Gambit</em> genuinely changed chess, but only online, and formal competitive chess
                missed the wave because Covid cancelled it. Judit Polgár remains the greatest female
                player of all time at 2735, far ahead of anyone in the modern era. Men and women reach
                their rating peaks at the same age. And of the gap between the world's best man and best
                woman, more than half is just the mathematics of how many people play.
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

      <section className="max-w-2xl mx-auto px-6 py-24">
        <FadeUp>
          <p className="text-sage-600 text-sm uppercase tracking-[0.25em] mb-4">Limitations</p>
          <h2 className="text-4xl font-serif mb-8">What this data cannot tell us</h2>
          <div className="prose-cream">
            <p>
              The FIDE dataset starts in July 2015, so players whose peak came earlier, including Polgár,
              Chiburdanidze, and Gaprindashvili, appear only at their retirement rating. The chess.com
              signup figures come from a 12,000 profile sample calibrated to one published benchmark, so
              the 70 million excess estimate is order of magnitude accurate, not precise. The Prophet
              model's pre intervention MAPE was 38.6 percent, which means individual monthly predictions
              are noisy. The cumulative finding is robust but the exact number has a wide uncertainty
              band. The Q4 counterfactual assumes a normal rating distribution, and under different
              distributional assumptions the 55 and 45 split would shift. The qualitative finding, that
              sample size is a major but not exclusive factor, is robust. The precise percentage is not.
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
                  usually working in Python but open to anything new. Outside of academia, occasionally
                  trading blue light for a chess board. Rated around 1500, formerly in the top 10 girls
                  in my age group.
                </p>
                <p>
                  I volunteer at the London Women's Chess Club, so this topic feels personal. I hear it
                  misinterpreted constantly, usually with no stats or facts to back it up. That
                  frustration is why this project exists.
                </p>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <a
                href="https://github.com/anp-exe/fide-rating_analysisV2"
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
