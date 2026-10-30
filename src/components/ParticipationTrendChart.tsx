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
  INK,
  LINE,
  TooltipShell,
  WOMEN,
  YAXIS,
  endLabel,
  formatMonth,
  lastIndexWith,
  mobileFigure,
  monthToTs,
  useYearTicks,
} from "./chart-kit";

type View = "observed" | "parity";

const PARITY = 50;
/* Two phases, because they carry different amounts of time. The observed
   decade is 130 monthly points covering eleven years and gets a slow pass of
   its own; the projection is one point a year for 453 years and runs at a
   constant rate after that. */
const OBSERVED_MS = 5000;
const PROJECTION_MS = 11000;

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
  const [view, setView] = useState<View>("parity");

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
  const neededFor2100 = (PARITY - lastShare) / (2100 - lastYear);
  const parityYearDecade = lastYear + Math.ceil((PARITY - lastShare) / data.slope_decade);

  const observedFrames = data.observed.length;
  const total = parityRows.length;

  const [frame, setFrame] = useState(total);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const frameRef = useRef(total);
  frameRef.current = frame;

  // frame <-> clock, so pressing play after scrubbing resumes from where the
  // scrubber was left rather than restarting the phase.
  const frameAt = (ms: number) => {
    if (ms < OBSERVED_MS) return Math.round((ms / OBSERVED_MS) * observedFrames);
    const on = (ms - OBSERVED_MS) / PROJECTION_MS;
    return Math.min(total, observedFrames + Math.round(on * (total - observedFrames)));
  };
  const msAt = (f: number) =>
    f <= observedFrames
      ? (f / observedFrames) * OBSERVED_MS
      : OBSERVED_MS + ((f - observedFrames) / (total - observedFrames)) * PROJECTION_MS;

  useEffect(() => {
    if (view !== "parity" || !playing) return;
    const offset = frameRef.current >= total ? 0 : msAt(frameRef.current);
    const startedAt = performance.now() - offset;
    const step = (now: number) => {
      const next = frameAt(now - startedAt);
      if (next !== frameRef.current) setFrame(next);
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
  }, [playing, view, total]);

  const play = () => {
    if (frame >= total) setFrame(0);
    setPlaying(true);
  };

  // Start the run the first time it scrolls into view, once per page load, so
  // scrolling back past it later does not yank the chart back to 2015. Anyone
  // who has asked their system for less motion gets the finished chart.
  const autoplayed = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = panelRef.current;
    if (!el || autoplayed.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || autoplayed.current) return;
        autoplayed.current = true;
        setFrame(0);
        setPlaying(true);
        io.disconnect();
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [view]);

  const shown = parityRows.slice(0, Math.max(2, frame));
  const head = shown[shown.length - 1] ?? parityRows[0];
  const headShare = head.projected ?? head.share ?? lastShare;
  const headYear = new Date(head.t).getUTCFullYear();

  // The parity run starts tight on the decade we actually have and pulls back
  // as the line advances. The camera follows the head's year, not its share:
  // the observed share wobbles month to month and a camera tied to it shakes.
  // u is 0 for the whole observed pass, so the opening frame holds still, then
  // rises linearly with the projection, so the pull back is at a constant rate.
  const u = Math.min(1, Math.max(0, (headYear - lastYear) / (parityYear - lastYear)));
  const camXMax = Date.UTC(Math.round(lastYear + 5 + u * (parityYear - lastYear - 5)), 3, 1);
  const camYMin = 8 * (1 - u);
  const camYMax = 12 + (55 - 12) * u;

  const from = rows[0].t;
  const to = view === "observed" ? lastObserved : camXMax;
  const ticks = useYearTicks(from, to, view === "observed" ? 2 : yearStep(new Date(to).getUTCFullYear() - 2015));
  const plotted = view === "observed" ? rows.filter((r) => r.t <= lastObserved) : shown;
  const yDomain: [number, number] = view === "observed" ? [9, 11] : [camYMin, camYMax];
  const yTicks = view === "observed" ? [9, 9.5, 10, 10.5, 11] : shareTicks(camYMin, camYMax);

  return (
    <ChartFrame
      figureNumber="Figure 7"
      title={`Parity by 2100 needs ${Math.round(neededFor2100 / data.slope_recent)} times today's pace`}
      subtitle={
        view === "observed"
          ? "Women as a share of active FIDE players, monthly, July 2015 to April 2026."
          : "Women as a share of active FIDE players, observed monthly since 2015, then the pace of the last five years held constant."
      }
      callout={
        view === "observed"
          ? {
              value: `+${(data.share_last - data.share_first).toFixed(1)}`,
              label: "percentage points in eleven years",
              color: WOMEN,
              at: { top: 36, left: 76 },
            }
          : {
              value: data.slope_recent.toFixed(2),
              label: `points a year now, against ${neededFor2100.toFixed(2)} a year for parity by 2100`,
              color: INK,
              at: { bottom: 48, right: 110 },
            }
      }
      controls={
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {([
              { key: "parity", label: "Run it to parity" },
              { key: "observed", label: "The decade we have" },
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
            <div ref={panelRef} className="bg-sage-50 border border-sage-100 rounded p-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => (playing ? setPlaying(false) : play())}
                  className="px-4 py-2 rounded text-sm tracking-wide bg-sage-700 text-paper hover:bg-sage-800 transition-colors"
                >
                  {playing ? "Pause" : "Play"}
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
        view === "observed" ? (
          <>
            The same observed line on its own scale, {data.share_first} to {data.share_last} percent across
            eleven years. On a two point axis a decade of progress is visible; on the axis the run to parity
            uses, it is almost flat. Hover any point for the men per woman ratio it implies.
          </>
        ) : (
          <>
            The whole journey at the pace of the last five years, {data.slope_recent} points a year: from{" "}
            {data.share_first} percent in 2015 to half of all rated players in {parityYear},{" "}
            {parityYear - lastYear} years out. At the slower pace of the whole decade, {data.slope_decade} points
            a year, it is {parityYearDecade}. Every observation this project has is the first flick, before
            the axis moves. It is arithmetic on what the last decade did, not a forecast, and it is the
            argument for changing the pace rather than waiting it out.
          </>
        )
      }
      height={340}
      staticFigure={{
        src: mobileFigure("participation_trend.png"),
        width: 1320,
        height: 550,
        alt: "Women as a share of active FIDE players, observed and with the recent pace extended",
        legend: [],
        caption:
          "The line is observed monthly data; the dotted extension holds the recent pace constant. It does not reach even 15 percent until around 2080, and true parity, half of all players, is centuries beyond the edge of this chart.",
      }}
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
        <ComposedChart data={plotted} margin={{ top: 24, right: 96, bottom: 4, left: 0 }}>
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
            width={62}
            domain={yDomain}
            ticks={yTicks}
            allowDataOverflow
            {...YAXIS}
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
          {view === "parity" ? (
            <ReferenceLine y={PARITY} stroke="#B6B6AC" strokeDasharray="3 3" label={<EventLabel text="parity" muted />} />
          ) : null}
          <Line
            dataKey="projected"
            stroke={COUNTERFACTUAL}
            strokeWidth={LINE.secondary}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
            isAnimationActive={false}
            label={view === "parity" ? endLabel(lastIndexWith(plotted, "projected"), "Recent pace", COUNTERFACTUAL) : undefined}
            activeDot={{ r: 4, fill: COUNTERFACTUAL, stroke: "#FAF6ED", strokeWidth: 2 }}
          />
          <Line
            dataKey="share"
            stroke={WOMEN}
            strokeWidth={LINE.main}
            dot={false}
            connectNulls
            isAnimationActive={false}
            label={
              // once the camera has pulled back the observed decade is a stub
              // at the far left, and its label would sit on the dashed line
              view === "observed" || u < 0.08
                ? endLabel(lastIndexWith(plotted, "share"), "Observed", WOMEN, view === "observed" ? 0 : -14)
                : undefined
            }
            activeDot={{ r: 4.5, fill: WOMEN, stroke: "#FAF6ED", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
