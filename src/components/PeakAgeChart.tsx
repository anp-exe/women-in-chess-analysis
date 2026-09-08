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
import { AXIS, ChartFrame, GRID, MEN, TooltipShell, WOMEN } from "./chart-kit";

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

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipShell
      title={d.sex === "F" ? "Woman" : "Man"}
      rows={[
        { label: "Peak rating", value: String(d.rating), color: d.sex === "F" ? WOMEN : MEN },
        { label: "Age at peak", value: `${d.age}` },
      ]}
    />
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
    return { women: build("women", "F"), men: build("men", "M") };
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
    .map((p: any) => [p.sex === "F" ? "Woman" : "Man", p.age, p.rating]);

  return (
    <ChartFrame
      figureNumber={figureNumber}
      title={`Top ${depth} active players per sex`}
      legend={[
        { label: `Women (mean peak age ${block.mean.women})`, color: WOMEN },
        { label: `Men (mean peak age ${block.mean.men})`, color: MEN },
      ]}
      caption={
        <>
          The {depth} highest rated active players of each sex, one dot per player: the age at which
          that career peaked against the rating it peaked at. Dashed lines mark the group means, {block.mean.women}{" "}
          for women and {block.mean.men} for men (p = {block.p.toFixed(2)}). Mean peak rating is{" "}
          {block.mean_rating.women} against {block.mean_rating.men}, a gap of{" "}
          {block.mean_rating.men - block.mean_rating.women} Elo. Points are nudged horizontally to
          separate players who peaked at the same age; hover for the real numbers.
        </>
      }
      height={360}
      table={{ head: ["Sex", "Age at peak", "Peak rating"], rows: tableRows }}
    >
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={GRID} />
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
            {...AXIS}
            label={{
              value: "Peak rating",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: { fill: "#55692C", fontSize: 11, textAnchor: "middle" },
            }}
          />
          <ZAxis range={[46, 46]} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#C3CFA8", strokeWidth: 1 }} />
          <Scatter
            data={series.men}
            fill={MEN}
            fillOpacity={0.7}
            stroke="#FAF6ED"
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Scatter
            data={series.women}
            fill={WOMEN}
            fillOpacity={0.7}
            stroke="#FAF6ED"
            strokeWidth={1}
            isAnimationActive={false}
          />
          <ReferenceLine x={block.mean.men} stroke={MEN} strokeDasharray="5 4" strokeWidth={1.5} />
          <ReferenceLine x={block.mean.women} stroke={WOMEN} strokeDasharray="5 4" strokeWidth={1.5} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
