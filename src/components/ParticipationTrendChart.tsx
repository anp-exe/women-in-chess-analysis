"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import data from "@/data/participation_trend.json";
import {
  AXIS,
  ChartFrame,
  COUNTERFACTUAL,
  EventLabel,
  GRID,
  TooltipShell,
  WOMEN,
  formatMonth,
  monthToTs,
  useYearTicks,
} from "./chart-kit";

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const rows = [];
  if (d.share != null) rows.push({ label: "Observed share", value: `${d.share.toFixed(2)}%`, color: WOMEN });
  if (d.projected != null)
    rows.push({ label: "At the recent pace", value: `${d.projected.toFixed(2)}%`, color: COUNTERFACTUAL });
  const share = d.share ?? d.projected;
  rows.push({ label: "Men per woman", value: `${((100 - share) / share).toFixed(1)} : 1` });
  return <TooltipShell title={formatMonth(d.t)} rows={rows} />;
}

type View = "long" | "observed";

export default function ParticipationTrendChart() {
  const [view, setView] = useState<View>("long");

  const rows = useMemo(() => {
    const byT = new Map<number, any>();
    data.observed.forEach((r) => byT.set(monthToTs(r.month), { t: monthToTs(r.month), share: r.share }));
    data.projected.forEach((r) => {
      const t = monthToTs(r.month);
      byT.set(t, { ...(byT.get(t) ?? { t }), projected: r.projected });
    });
    return [...byT.values()].sort((a, b) => a.t - b.t);
  }, []);

  const lastObserved = monthToTs(data.observed[data.observed.length - 1].month);
  const from = rows[0].t;
  const to = view === "long" ? rows[rows.length - 1].t : lastObserved;
  const ticks = useYearTicks(from, to, view === "long" ? 10 : 2);
  const plotted = view === "long" ? rows : rows.filter((r) => r.t <= lastObserved);
  const yDomain: [number, number] = view === "long" ? [8, 16] : [9, 11];
  const yTicks = view === "long" ? [8, 10, 12, 14, 16] : [9, 9.5, 10, 10.5, 11];

  return (
    <ChartFrame
      figureNumber="Figure 7"
      title="Women as a share of active FIDE players, with the current pace extended"
      legend={
        view === "long"
          ? [
              { label: "Observed, monthly", color: WOMEN },
              { label: "Recent pace held constant", color: COUNTERFACTUAL, dashed: true },
            ]
          : [{ label: "Observed, monthly", color: WOMEN }]
      }
      controls={
        <div className="flex flex-wrap gap-2">
          {([
            { key: "long", label: "The long view, to 2080" },
            { key: "observed", label: "The decade we have" },
          ] as { key: View; label: string }[]).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-4 py-2 rounded text-sm tracking-wide transition-colors ${
                view === v.key ? "bg-sage-700 text-paper" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      }
      caption={
        view === "long" ? (
          <>
            The solid line is observed monthly data, {data.share_first} percent in July 2015 to{" "}
            {data.share_last} percent today. The dotted extension holds the pace of the last five years,{" "}
            {data.slope_recent} points a year, constant: it does not reach even 15 percent until around{" "}
            {data.year_reach_15}, and true parity, half of all players, is centuries beyond the edge of this
            chart. Hover any point for the men per woman ratio it implies.
          </>
        ) : (
          <>
            The same observed line on its own scale, {data.share_first} to {data.share_last} percent across
            eleven years. On a two point axis a decade of progress is visible; on the axis the other view
            uses, it is almost flat. Hover any point for the men per woman ratio it implies.
          </>
        )
      }
      height={340}
      table={{
        head: ["Month", "Observed share", "Projected share"],
        rows: plotted.map((r) => [
          r.t && new Date(r.t).toISOString().slice(0, 7),
          r.share != null ? `${r.share.toFixed(2)}%` : "",
          r.projected != null ? `${r.projected.toFixed(2)}%` : "",
        ]),
      }}
    >
      <ResponsiveContainer>
        <ComposedChart data={plotted} margin={{ top: 24, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[from, to]}
            ticks={ticks}
            tickFormatter={(t) => String(new Date(t).getUTCFullYear())}
            {...AXIS}
          />
          <YAxis
            width={54}
            domain={yDomain}
            ticks={yTicks}
            {...AXIS}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: "Share of active players",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: { fill: "#55692C", fontSize: 11, textAnchor: "middle" },
            }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#C3CFA8", strokeWidth: 1 }} />
          {view === "long" ? (
          <ReferenceLine
            y={15}
            stroke="#B6B6AC"
            strokeDasharray="3 3"
            label={<EventLabel text="15 percent" muted />}
          />
          ) : null}
          <Line
            dataKey="projected"
            stroke={COUNTERFACTUAL}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
            isAnimationActive={false}
            activeDot={{ r: 4, fill: COUNTERFACTUAL, stroke: "#FAF6ED", strokeWidth: 2 }}
          />
          <Line
            dataKey="share"
            stroke={WOMEN}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
            activeDot={{ r: 4.5, fill: WOMEN, stroke: "#FAF6ED", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
