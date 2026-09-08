"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type View = "long" | "observed" | "parity";

const PARITY = 50;
const SWEEP_MS = 14000; // how long the run to parity takes end to end

/* Tick spacing has to follow the zoom: five year steps while the camera is
   on the observed decade, hundreds once the whole run is in shot. */
function yearStep(span: number) {
  if (span <= 20) return 5;
  if (span <= 60) return 10;
  if (span <= 150) return 25;
  if (span <= 350) return 50;
  return 100;
}

function shareTicks(lo: number, hi: number) {
  const step = hi - lo <= 6 ? 1 : hi - lo <= 16 ? 5 : 10;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v);
  return out;
}

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
  const lastShare = data.share_last;
  const lastYear = new Date(lastObserved).getUTCFullYear();

  // The run to parity: the same pace, carried on until half of all rated
  // players are women. It takes 452 years, which is the point.
  const parityRows = useMemo(() => {
    const out = rows.filter((r) => r.t <= lastObserved).map((r) => ({ ...r, projected: undefined }));
    const yearsToParity = Math.ceil((PARITY - lastShare) / data.slope_recent);
    for (let y = 0; y <= yearsToParity; y += 1) {
      const share = Math.min(PARITY, lastShare + data.slope_recent * y);
      out.push({ t: Date.UTC(lastYear + y, 3, 1), share: undefined, projected: share } as any);
    }
    return out;
  }, [rows, lastObserved, lastShare, lastYear]);

  const parityYear = lastYear + Math.ceil((PARITY - lastShare) / data.slope_recent);

  const [frame, setFrame] = useState(parityRows.length);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (view !== "parity" || !playing) return;
    const total = parityRows.length;
    const startedAt = performance.now();
    const from = frame >= total ? 0 : frame;
    const step = (now: number) => {
      const done = (now - startedAt) / SWEEP_MS;
      const next = Math.min(total, Math.round(from + done * (total - from)));
      setFrame(next);
      if (next >= total) {
        setPlaying(false);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, view, parityRows.length]);

  const play = () => {
    if (frame >= parityRows.length) setFrame(0);
    setPlaying(true);
  };

  const shown = parityRows.slice(0, Math.max(2, frame));
  const head = shown[shown.length - 1] ?? parityRows[0];
  const headShare = head.projected ?? head.share ?? lastShare;
  const headYear = new Date(head.t).getUTCFullYear();

  // The parity run starts tight on the decade we actually have and pulls back
  // as the line advances, so the observed wiggle is legible at the start and
  // the full 453 years are in shot by the end. The camera follows the head,
  // so scrubbing zooms too.
  const progress = Math.min(1, Math.max(0, (headShare - data.share_first) / (PARITY - data.share_first)));
  const lead = Math.max(5, (headYear - 2015) * 0.12) * (1 - progress);
  const camXMax = Date.UTC(Math.min(parityYear + 1, Math.round(headYear + lead)), 3, 1);
  const camYMin = 8 * (1 - progress);
  const camYMax = 12 + (55 - 12) * progress;

  const from = rows[0].t;
  const to = view === "long" ? rows[rows.length - 1].t : view === "observed" ? lastObserved : camXMax;
  const ticks = useYearTicks(
    from,
    to,
    view === "long" ? 10 : view === "observed" ? 2 : yearStep(new Date(to).getUTCFullYear() - 2015)
  );
  const plotted = view === "long" ? rows : view === "observed" ? rows.filter((r) => r.t <= lastObserved) : shown;
  const yDomain: [number, number] =
    view === "long" ? [8, 16] : view === "observed" ? [9, 11] : [camYMin, camYMax];
  const yTicks =
    view === "long"
      ? [8, 10, 12, 14, 16]
      : view === "observed"
      ? [9, 9.5, 10, 10.5, 11]
      : shareTicks(camYMin, camYMax);

  return (
    <ChartFrame
      figureNumber="Figure 7"
      title="Women as a share of active FIDE players, with the current pace extended"
      legend={
        view === "observed"
          ? [{ label: "Observed, monthly", color: WOMEN }]
          : [
              { label: "Observed, monthly", color: WOMEN },
              { label: "Recent pace held constant", color: COUNTERFACTUAL, dashed: true },
            ]
      }
      controls={
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {([
              { key: "long", label: "The long view, to 2080" },
              { key: "observed", label: "The decade we have" },
              { key: "parity", label: "Run it to parity" },
            ] as { key: View; label: string }[]).map((v) => (
              <button
                key={v.key}
                onClick={() => {
                  setView(v.key);
                  setPlaying(false);
                  if (v.key === "parity") setFrame(0);
                }}
                className={`px-4 py-2 rounded text-sm tracking-wide transition-colors ${
                  view === v.key ? "bg-sage-700 text-paper" : "bg-sage-100 text-sage-700 hover:bg-sage-200"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {view === "parity" ? (
            <div className="bg-sage-50 border border-sage-100 rounded p-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => (playing ? setPlaying(false) : play())}
                  className="px-4 py-2 rounded text-sm tracking-wide bg-sage-700 text-paper hover:bg-sage-800 transition-colors"
                >
                  {playing ? "Pause" : frame >= parityRows.length ? "Play again" : "Play"}
                </button>
                <div className="flex items-baseline gap-3">
                  <span className="stat-number text-3xl">{headYear}</span>
                  <span className="text-sm text-ink/70">
                    {headShare.toFixed(1)} percent women
                    {headShare >= PARITY ? ", parity" : `, ${((100 - headShare) / headShare).toFixed(1)} men per woman`}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={2}
                max={parityRows.length}
                value={Math.max(2, frame)}
                onChange={(e) => {
                  setPlaying(false);
                  setFrame(Number(e.target.value));
                }}
                className="w-full accent-[#7A8B6F] cursor-pointer mt-3"
                aria-label="Year"
              />
              <div className="flex justify-between text-xs text-sage-600 mt-1">
                <span>2015</span>
                <span>{parityYear}, parity</span>
              </div>
            </div>
          ) : null}
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
        ) : view === "observed" ? (
          <>
            The same observed line on its own scale, {data.share_first} to {data.share_last} percent across
            eleven years. On a two point axis a decade of progress is visible; on the axis the other view
            uses, it is almost flat. Hover any point for the men per woman ratio it implies.
          </>
        ) : (
          <>
            The whole journey at the pace of the last five years, {data.slope_recent} points a year: press
            play and the line crawls from {data.share_first} percent in 2015 to half of all rated players in{" "}
            {parityYear}. That is {parityYear - lastYear} years from now. Every observation this project
            actually has is the first flick of the line, before the axis has moved at all. The pace is not a
            forecast, it is arithmetic on what the last decade did, and it is the argument for changing the
            pace rather than waiting it out.
          </>
        )
      }
      height={340}
      table={{
        head: ["Month", "Observed share", "Projected share"],
        rows: plotted.map((r: any) => [
          new Date(r.t).toISOString().slice(0, 7),
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
            allowDataOverflow
            {...AXIS}
          />
          <YAxis
            width={54}
            domain={yDomain}
            ticks={yTicks}
            allowDataOverflow
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
            <ReferenceLine y={15} stroke="#B6B6AC" strokeDasharray="3 3" label={<EventLabel text="15 percent" muted />} />
          ) : null}
          {view === "parity" ? (
            <ReferenceLine y={PARITY} stroke="#B6B6AC" strokeDasharray="3 3" label={<EventLabel text="parity" muted />} />
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
