"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import data from "@/data/chesscom_prophet.json";
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

const EVENTS = [
  { month: "2020-03", label: "Covid\nlockdowns", muted: true, anchor: "end", row: 0 },
  { month: "2020-10", label: "The Queen's\nGambit", muted: false, anchor: "start", row: 0 },
  { month: "2022-09", label: "Niemann–Carlsen", muted: true, anchor: "start", row: 0 },
];

const fmt = (v: number) => `${v.toFixed(1)}M`;

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const gap = d.actual - d.forecast;
  return (
    <TooltipShell
      title={formatMonth(d.t)}
      rows={[
        { label: "Actual signups", value: fmt(d.actual), color: WOMEN },
        { label: "Counterfactual", value: fmt(d.forecast), color: COUNTERFACTUAL },
        { label: "80% interval", value: `${fmt(d.lo)} – ${fmt(d.hi)}` },
        { label: gap >= 0 ? "Above forecast" : "Below forecast", value: fmt(Math.abs(gap)) },
      ]}
    />
  );
}

export default function ChessComSignupsChart() {
  const rows = useMemo(
    () => data.rows.map((r) => ({ ...r, t: monthToTs(r.month) })),
    []
  );
  const from = rows[0].t;
  const to = rows[rows.length - 1].t;
  const ticks = useYearTicks(from, to, 1);

  return (
    <ChartFrame
      figureNumber="Figure 1"
      title="Chess.com signups vs Prophet counterfactual"
      legend={[
        { label: "Actual calibrated signups", color: WOMEN },
        { label: "Prophet counterfactual", color: COUNTERFACTUAL, dashed: true },
        { label: "80% prediction interval", color: WOMEN, faint: true },
      ]}
      caption={`Calibrated to the median of three public benchmarks: 2.8 million signups in November 2020, 100 million total members by December 2022, and 150 million by October 2023. Pre intervention training MAPE ${data.mape} percent. Hover for the monthly gap between the two lines; the whole gap from October 2020 to December 2024 sums to about ${data.excess_m} million signups.`}
      height={360}
      table={{
        head: ["Month", "Actual (M)", "Counterfactual (M)", "80% interval (M)"],
        rows: rows.map((r) => [
          r.month,
          r.actual.toFixed(2),
          r.forecast.toFixed(2),
          `${r.lo.toFixed(2)} – ${r.hi.toFixed(2)}`,
        ]),
      }}
    >
      <ResponsiveContainer>
        <ComposedChart data={rows} margin={{ top: 28, right: 12, bottom: 4, left: 0 }}>
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
            {...AXIS}
            tickFormatter={(v) => `${v}M`}
            label={{
              value: "Signups per month",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: { fill: "#55692C", fontSize: 11, textAnchor: "middle" },
            }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#C3CFA8", strokeWidth: 1 }} />
          <Area
            dataKey="band"
            stroke="none"
            fill={WOMEN}
            fillOpacity={0.13}
            isAnimationActive={false}
            activeDot={false}
          />
          <Line
            dataKey="forecast"
            stroke={COUNTERFACTUAL}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: COUNTERFACTUAL, stroke: "#FAF6ED", strokeWidth: 2 }}
          />
          <Line
            dataKey="actual"
            stroke={WOMEN}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4.5, fill: WOMEN, stroke: "#FAF6ED", strokeWidth: 2 }}
          />
          {EVENTS.map((e) => (
            <ReferenceLine
              key={e.month}
              x={monthToTs(e.month)}
              stroke={e.muted ? "#B6B6AC" : "#2D2D2B"}
              strokeDasharray={e.muted ? "3 3" : "2 2"}
              strokeWidth={1}
              label={<EventLabel text={e.label} muted={e.muted} anchor={e.anchor} row={e.row} />}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
