"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Customized,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import data from "@/data/peak_age.json";
import { AXIS, ChartFrame, GRID, INK, MEN, TooltipShell, WOMEN, YAXIS, mobileFigure } from "./chart-kit";

type Depth = 25 | 100;

const BIN = 5;
const FIRST = 15;
const LAST = 55;

function binLabel(start: number) {
  return `${start}–${start + BIN - 1}`;
}

/* The x axis is categorical (five year bands), so a mean of 28.3 has no
   category to sit on. The bands are uniform, so map age to pixels linearly
   across the plot area and draw the two means where they actually fall. */
function meanLines(props: any, firstStart: number, bandCount: number, means: { women: number; men: number }) {
  const o = props?.offset;
  if (!o?.width) return null;
  const span = bandCount * BIN;
  const xOf = (age: number) => o.left + ((age - firstStart) / span) * o.width;
  // the means sit close together, so each label goes on its own side
  const womenRight = means.women >= means.men;
  return (
    <g>
      {([
        [means.men, MEN, "Men", !womenRight],
        [means.women, WOMEN, "Women", womenRight],
      ] as [number, string, string, boolean][]).map(([age, colour, name, right]) => (
        <g key={colour}>
          <line
            x1={xOf(age)}
            x2={xOf(age)}
            y1={o.top}
            y2={o.top + o.height}
            stroke={colour}
            strokeWidth={2}
            strokeDasharray="5 4"
          />
          <text
            x={xOf(age) + (right ? 6 : -6)}
            y={o.top - 8}
            fill={colour}
            fontSize={12}
            fontWeight={600}
            textAnchor={right ? "start" : "end"}
          >
            {name}, mean {age}
          </text>
        </g>
      ))}
    </g>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <TooltipShell
      title={`Peaked at ${label}`}
      rows={[
        { label: "Women", value: `${d.women} of ${d.totalW}`, color: WOMEN },
        { label: "Men", value: `${d.men} of ${d.totalM}`, color: MEN },
      ]}
    />
  );
}

export default function PeakAgeHistogram({ figureNumber }: { figureNumber: string }) {
  const [depth, setDepth] = useState<Depth>(25);
  const [edges, setEdges] = useState(true); // include peaks that sit on a window edge
  const block = (data as any)["top" + depth];
  const stats = edges ? block : block.inwindow;

  const bins = useMemo(() => {
    const keep = (p: any) => edges || !p.cens;
    const rows = [];
    for (let start = FIRST; start < LAST; start += BIN) {
      const count = (key: "women" | "men") =>
        block.points[key].filter(keep).filter((p: any) => p.age >= start && p.age < start + BIN).length;
      rows.push({
        bin: binLabel(start),
        start,
        women: count("women"),
        men: count("men"),
        totalW: block.points.women.filter(keep).length,
        totalM: block.points.men.filter(keep).length,
      });
    }
    // trim empty bins at either end so the chart is not mostly whitespace
    const firstUsed = rows.findIndex((r) => r.women || r.men);
    const lastUsed = rows.length - 1 - [...rows].reverse().findIndex((r) => r.women || r.men);
    return rows.slice(firstUsed, lastUsed + 1);
  }, [block, depth, edges]);

  return (
    <ChartFrame
      figureNumber={figureNumber}
      title="Women and men peak at the same ages"
      subtitle={`Age at peak rating for the ${depth} highest rated active players of each sex, in five year bands. Dashed lines: group means.`}
      callout={{
        value: `${Math.abs(stats.mean.women - stats.mean.men).toFixed(1)} yrs`,
        label: `between the two mean peak ages (p\u00a0=\u00a0${stats.p.toFixed(2)})`,
        color: INK,
        at: { top: 36, right: 20 },
      }}
      controls={
        <div className="flex flex-wrap gap-2">
          {([25, 100] as Depth[]).map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className={`px-4 py-2 rounded text-sm tracking-wide transition-colors ${
                depth === d ? "bg-sage-700 text-paper" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              Top {d} a side
            </button>
          ))}
          <button
            onClick={() => setEdges((v) => !v)}
            className={`px-4 py-2 rounded text-sm tracking-wide transition-colors ${
              edges ? "bg-sage-100 text-sage-700 hover:bg-sage-200" : "bg-sage-700 text-paper"
            }`}
          >
            {edges ? "Drop window edge peaks" : "Window edge peaks dropped"}
          </button>
        </div>
      }
      caption={
        <>
          How many of the {depth} highest rated active players of each sex peaked in each five year
          band. The two distributions have the same
          shape and their means sit {Math.abs(stats.mean.women - stats.mean.men).toFixed(1)} of a year
          apart, {stats.mean.women} for women against {stats.mean.men} for men (p = {stats.p.toFixed(2)}),
          with a thin tail on both sides of players who peaked in their forties or later. Switch depth to check the
          shape is not an artefact of where the cut is made.{" "}
          {edges ? (
            <>
              The second button drops the {block.n.women + block.n.men - block.inwindow.n.women - block.inwindow.n.men}{" "}
              players whose highest observed rating sits on an edge of the eleven year window, whose real
              peak is either before the data starts or had not happened yet.
            </>
          ) : (
            <>
              Showing only peaks that fall inside the window, {stats.n.women} women and {stats.n.men} men
              of the {depth} a side. Both means drop by about a year and the difference between them does
              not move, which is the check that matters.
            </>
          )}
        </>
      }
      height={320}
      staticFigure={{
        src: mobileFigure("ages_top25_active.png"),
        width: 1320,
        height: 605,
        alt: "Career trajectories of the top 25 active players per sex",
        legend: [],
        title: "Top 25 active players per sex",
        caption:
          "The 25 highest rated active players of each sex. Dotted lines mark the mean peak age: women 29.2, men 28.7 (p = 0.84).",
      }}
      table={{
        head: ["Age at peak", "Women", "Men"],
        rows: bins.map((b) => [b.bin, b.women, b.men]),
      }}
    >
      <ResponsiveContainer>
        <BarChart data={bins} margin={{ top: 30, right: 12, bottom: 8, left: 0 }} barGap={2}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="bin"
            {...AXIS}
            label={{
              value: "Age at peak rating",
              position: "insideBottom",
              offset: -6,
              style: { fill: "#55692C", fontSize: 11 },
            }}
          />
          <YAxis
            width={54}
            allowDecimals={false}
            {...YAXIS}
            label={{
              value: "Players",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: { fill: "#55692C", fontSize: 11, textAnchor: "middle" },
            }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#E1E7D4", fillOpacity: 0.45 }} />
          <Bar dataKey="women" fill={WOMEN} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="men" fill={MEN} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Customized component={(p: any) => meanLines(p, bins[0].start, bins.length, stats.mean)} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
