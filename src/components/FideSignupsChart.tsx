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
import data from "@/data/fide_signups_its.json";
import {
  AXIS,
  ChartFrame,
  COUNTERFACTUAL,
  EventLabel,
  GRID,
  MEN,
  TooltipShell,
  WOMEN,
  formatMonth,
  monthToTs,
  useYearTicks,
} from "./chart-kit";

type Mode = "women" | "men" | "indexed";

const MODES: { key: Mode; label: string }[] = [
  { key: "women", label: "Women" },
  { key: "men", label: "Men" },
  { key: "indexed", label: "Both, indexed" },
];

const COLOR = { women: WOMEN, men: MEN } as const;

function ChartTooltip({ active, payload, mode }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const n = (v: number, dp = 0) => v.toLocaleString("en-GB", { maximumFractionDigits: dp });
  if (mode === "indexed") {
    return (
      <TooltipShell
        title={formatMonth(d.t)}
        rows={[
          { label: "Women (Aug 2017 = 100)", value: n(d.womenIndex), color: WOMEN },
          { label: "Men (Aug 2017 = 100)", value: n(d.menIndex), color: MEN },
        ]}
      />
    );
  }
  return (
    <TooltipShell
      title={formatMonth(d.t)}
      rows={[
        { label: "New registrations", value: n(d.actual), color: COLOR[mode as "women" | "men"], dim: true },
        { label: "3 month trend", value: n(d.trend), color: COLOR[mode as "women" | "men"] },
        { label: "Expected without the show", value: n(d.counterfactual), color: COUNTERFACTUAL },
      ]}
    />
  );
}

export default function FideSignupsChart() {
  const [mode, setMode] = useState<Mode>("women");

  const rows = useMemo(() => {
    const w = data.series.women;
    const m = data.series.men;
    const w0 = w[0].trend;
    const m0 = m[0].trend;
    if (mode === "indexed") {
      return w.map((row, i) => ({
        t: monthToTs(row.month),
        month: row.month,
        womenIndex: (row.trend / w0) * 100,
        menIndex: (m[i].trend / m0) * 100,
      }));
    }
    return (mode === "women" ? w : m).map((row) => ({ ...row, t: monthToTs(row.month) }));
  }, [mode]);

  const from = rows[0].t;
  const to = rows[rows.length - 1].t;
  const ticks = useYearTicks(from, to, 1);
  const model = mode === "men" ? data.model.men : data.model.women;

  const legend =
    mode === "indexed"
      ? [
          { label: "Women", color: WOMEN },
          { label: "Men", color: MEN },
        ]
      : [
          { label: "Monthly registrations", color: COLOR[mode], faint: true },
          { label: "3 month trend", color: COLOR[mode] },
          { label: "Expected without the show, Covid kept", color: COUNTERFACTUAL, dashed: true },
        ];

  const caption =
    mode === "indexed" ? (
      <>
        Both 3 month trends rescaled so August 2017 = 100. Covid cancelled in person tournaments
        worldwide in 2020, and FIDE registrations require tournament play. The two lines fall and
        recover together, which is what a pandemic looks like, not a female specific Queen&apos;s Gambit
        surge.
      </>
    ) : (
      <>
        The dashed line is the interrupted time series counterfactual with the Covid term kept but no
        show effect. At the intervention itself the level change is {model.post > 0 ? "+" : ""}
        {model.post} registrations a month (p = {model.post_p.toFixed(2)}), so the show cannot be
        separated from the post lockdown recovery already under way.
      </>
    );

  const table =
    mode === "indexed"
      ? {
          head: ["Month", "Women (index)", "Men (index)"],
          rows: (rows as any[]).map((r) => [r.month, r.womenIndex.toFixed(1), r.menIndex.toFixed(1)]),
        }
      : {
          head: ["Month", "Registrations", "3 month trend", "Counterfactual"],
          rows: (rows as any[]).map((r) => [r.month, r.actual, r.trend.toFixed(0), r.counterfactual.toFixed(0)]),
        };

  return (
    <ChartFrame
      figureNumber="Figure 2"
      title="New FIDE registrations by sex, 2017 to 2024"
      legend={legend}
      caption={caption}
      height={360}
      table={table}
      controls={
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded text-sm tracking-wide transition-colors ${
                mode === m.key ? "bg-sage-700 text-paper" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      }
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
            tickFormatter={(v) => v.toLocaleString("en-GB")}
            label={{
              value: mode === "indexed" ? "Aug 2017 = 100" : "Players per month",
              angle: -90,
              position: "insideLeft",
              offset: 14,
              style: { fill: "#55692C", fontSize: 11, textAnchor: "middle" },
            }}
          />
          <Tooltip content={<ChartTooltip mode={mode} />} cursor={{ stroke: "#C3CFA8", strokeWidth: 1 }} />

          {mode === "indexed" ? (
            <>
              <Line dataKey="womenIndex" stroke={WOMEN} strokeWidth={2} dot={false} isAnimationActive={false}
                activeDot={{ r: 4.5, fill: WOMEN, stroke: "#FAF6ED", strokeWidth: 2 }} />
              <Line dataKey="menIndex" stroke={MEN} strokeWidth={2} dot={false} isAnimationActive={false}
                activeDot={{ r: 4.5, fill: MEN, stroke: "#FAF6ED", strokeWidth: 2 }} />
            </>
          ) : (
            <>
              <Line dataKey="actual" stroke={COLOR[mode]} strokeWidth={1.4} strokeOpacity={0.4} dot={false}
                isAnimationActive={false} activeDot={false} />
              <Line dataKey="counterfactual" stroke={COUNTERFACTUAL} strokeWidth={2} strokeDasharray="6 4" dot={false}
                isAnimationActive={false} activeDot={{ r: 4, fill: COUNTERFACTUAL, stroke: "#FAF6ED", strokeWidth: 2 }} />
              <Line dataKey="trend" stroke={COLOR[mode]} strokeWidth={2.6} dot={false} isAnimationActive={false}
                activeDot={{ r: 4.5, fill: COLOR[mode], stroke: "#FAF6ED", strokeWidth: 2 }} />
            </>
          )}

          <ReferenceLine x={monthToTs(data.covid)} stroke="#B6B6AC" strokeDasharray="3 3" strokeWidth={1}
            label={<EventLabel text={"Covid\nMar 2020"} muted anchor="end" />} />
          <ReferenceLine x={monthToTs(data.intervention)} stroke="#2D2D2B" strokeDasharray="2 2" strokeWidth={1}
            label={<EventLabel text={"Queen's Gambit\nOct 2020"} />} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
