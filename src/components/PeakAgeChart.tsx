"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import data from "@/data/peak_age.json";
import { AXIS, ChartFrame, GRID, INK, MEN, MarkerLabel, TooltipShell, WOMEN, YAXIS, mobileFigure } from "./chart-kit";

type Depth = 25 | 100;

// Ages are integers (FIDE records birth year only), so ties would stack into a
// single column. Nudge each point by a deterministic fraction of a year to
// separate them; the tooltip and the table always report the real age.
function jitter(i: number, n: number) {
  if (n <= 1) return 0;
  const golden = (i * 0.6180339887) % 1;
  return (golden - 0.5) * 0.62;
}

function ageTicks([lo, hi]: [number, number]) {
  const out: number[] = [];
  for (let a = Math.ceil(lo / 5) * 5; a <= hi; a += 5) out.push(a);
  return out;
}

const CENS_NOTE: Record<string, string> = {
  left: "peaked in the first months of the window, real peak likely earlier",
  right: "peaked in their own last active month, may still have been rising",
};

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const rows = [
    { label: "Peak rating", value: String(d.rating), color: d.sex === "F" ? WOMEN : MEN },
    { label: "Age at peak", value: `${d.age}` },
  ];
  if (d.cens) rows.push({ label: "At the window edge", value: d.cens === "left" ? "before 2015" : "still rising" });
  return (
    <>
      <TooltipShell title={d.sex === "F" ? "Woman" : "Man"} rows={rows} />
      {d.cens ? (
        <p className="text-[0.65rem] text-sage-600 italic mt-1 max-w-[15rem]">{CENS_NOTE[d.cens]}</p>
      ) : null}
    </>
  );
}

export default function PeakAgeChart({ depth, figureNumber }: { depth: Depth; figureNumber: string }) {
  const block = (data as any)["top" + depth];

  const series = useMemo(() => {
    const build = (key: "women" | "men", sex: "F" | "M") =>
      block.points[key].map((p: any, i: number) => ({
        ...p,
        sex,
        x: p.age + jitter(i, block.points[key].length),
      }));
    const women = build("women", "F");
    const men = build("men", "M");
    return {
      women,
      men,
      womenSolid: women.filter((p: any) => !p.cens),
      womenEdge: women.filter((p: any) => p.cens),
      menSolid: men.filter((p: any) => !p.cens),
      menEdge: men.filter((p: any) => p.cens),
    };
  }, [block]);

  const ages = [...series.women, ...series.men].map((p: any) => p.age);
  const ratings = [...series.women, ...series.men].map((p: any) => p.rating);
  const xDomain: [number, number] = [Math.floor(Math.min(...ages)) - 1.5, Math.ceil(Math.max(...ages)) + 1.5];
  const yDomain: [number, number] = [
    Math.floor((Math.min(...ratings) - 40) / 50) * 50,
    Math.ceil((Math.max(...ratings) + 40) / 50) * 50,
  ];

  const tableRows = [...series.women, ...series.men]
    .sort((a: any, b: any) => b.rating - a.rating)
    .map((p: any) => [
      p.sex === "F" ? "Woman" : "Man",
      p.age,
      p.rating,
      p.cens === "left" ? "before 2015" : p.cens === "right" ? "still rising" : "",
    ]);

  return (
    <ChartFrame
      figureNumber={figureNumber}
      title={`A ${block.mean_rating.men - block.mean_rating.women} point rating gap, no significant gap in peak age`}
      subtitle={`Peak rating against age at peak, top ${depth} active players per sex. Hollow dots: the peak sits at an edge of the eleven year window.`}
      callout={{
        value: `${Math.abs(block.mean.women - block.mean.men).toFixed(1)} yrs`,
        label: `between the mean peak ages (p\u00a0=\u00a0${block.p.toFixed(2)})`,
        color: INK,
        at: { top: "40%", right: 22 },
      }}
      caption={
        <>
          One dot per player: age at peak against peak rating. Dashed lines are the group means,{" "}
          {block.mean.women} for women and {block.mean.men} for men (p = {block.p.toFixed(2)}); mean peak
          rating {block.mean_rating.women} against {block.mean_rating.men}, a{" "}
          {block.mean_rating.men - block.mean_rating.women} Elo gap. Hollow dots are the{" "}
          {block.n.women + block.n.men - block.inwindow.n.women - block.inwindow.n.men} players whose best
          rating sits at an edge of the eleven year window, so the true peak is either before July 2015 or
          had not arrived. The two women far right are both of these; without all of them the means are{" "}
          {block.inwindow.mean.women} and {block.inwindow.mean.men} (p = {block.inwindow.p.toFixed(2)}).
          Points are nudged sideways where ages tie; hover for exact numbers.
        </>
      }
      height={360}
      staticFigure={
        depth === 100
          ? {
              src: mobileFigure("ages_top100_active.png"),
              width: 1320,
              height: 605,
              alt: "Career trajectories of the top 100 active players per sex",
              legend: [],
              caption:
                "The 100 highest rated active players of each sex. Women peak at 28.4, men at 29.7 (p = 0.20).",
            }
          : undefined
      }
      table={{ head: ["Sex", "Age at peak", "Peak rating", "Window edge"], rows: tableRows }}
    >
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 30, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            type="number"
            dataKey="x"
            domain={xDomain}
            ticks={ageTicks(xDomain)}
            tickFormatter={(v) => String(Math.round(v))}
            {...AXIS}
            label={{
              value: "Age at peak rating",
              position: "insideBottom",
              offset: -6,
              style: { fill: "#55692C", fontSize: 11 },
            }}
          />
          <YAxis
            type="number"
            dataKey="rating"
            domain={yDomain}
            width={54}
            {...YAXIS}
            label={{
              value: "Peak rating",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: { fill: "#55692C", fontSize: 11, textAnchor: "middle" },
            }}
          />
          <ZAxis range={[54, 54]} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#C3CFA8", strokeWidth: 1 }} />
          <Scatter data={series.menEdge} fill="none" stroke={MEN} strokeWidth={1.4} isAnimationActive={false} />
          <Scatter data={series.womenEdge} fill="none" stroke={WOMEN} strokeWidth={1.4} isAnimationActive={false} />
          <Scatter
            data={series.menSolid}
            fill={MEN}
            fillOpacity={0.7}
            stroke="#FAF6ED"
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Scatter
            data={series.womenSolid}
            fill={WOMEN}
            fillOpacity={0.7}
            stroke="#FAF6ED"
            strokeWidth={1}
            isAnimationActive={false}
          />
          <ReferenceLine x={block.mean.men} stroke={MEN} strokeDasharray="5 4" strokeWidth={2}
            label={<MarkerLabel text={`Men, mean ${block.mean.men}`} color={MEN}
              anchor={block.mean.men >= block.mean.women ? "start" : "end"} />} />
          <ReferenceLine x={block.mean.women} stroke={WOMEN} strokeDasharray="5 4" strokeWidth={2}
            label={<MarkerLabel text={`Women, mean ${block.mean.women}`} color={WOMEN}
              anchor={block.mean.women > block.mean.men ? "start" : "end"} />} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
