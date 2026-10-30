"use client";

import { ReactNode, useMemo, useState } from "react";

/* Shared furniture for the story's charts: the palette, the card the chart
   sits in, the tooltip shell, and the axis defaults. Everything here is light
   mode only, on the paper surface the page uses throughout. */

// Two series, one categorical pair: a saturated berry and a deep green.
// Checked against the #FAF6ED surface: normal vision dE 48, deutan dE 15,
// protan dE 27, contrast 6.0 and 7.5, so the pair holds up for colour blind
// readers and sex is still never carried by hue alone (lines are labelled).
export const WOMEN = "#A8325A";
export const MEN = "#2F5A17";
export const COUNTERFACTUAL = "#6F6F68";
export const INK = "#2D2D2B";
export const MUTED = "#55692C";
export const GRID = "#E1E7D4";
export const SURFACE = "#FAF6ED";

export const AXIS = {
  stroke: "#C3CFA8",
  tick: { fill: MUTED, fontSize: 12 },
  tickLine: false,
} as const;

// The value axis has no line of its own: the horizontal gridlines do that job.
export const YAXIS = { ...AXIS, axisLine: false } as const;

export const LINE = { main: 3, secondary: 2.25, faint: 1.5 } as const;

export function monthToTs(month: string) {
  const [y, m] = month.split("-").map(Number);
  return Date.UTC(y, m - 1, 1);
}

export function yearTicks(from: number, to: number, every = 1) {
  const out: number[] = [];
  const start = new Date(from).getUTCFullYear();
  const end = new Date(to).getUTCFullYear();
  for (let y = Math.ceil(start / every) * every; y <= end; y += every) out.push(Date.UTC(y, 0, 1));
  return out;
}

export function formatYear(ts: number) {
  return String(new Date(ts).getUTCFullYear());
}

export function formatMonth(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

/* Tooltip shell. Values wear ink, never the series colour; the colour lives in
   the swatch beside the label. */
export function TooltipShell({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; dim?: boolean }[] }) {
  return (
    <div className="bg-paper border border-sage-200 rounded shadow-sm px-3 py-2 text-xs">
      <p className="text-sage-600 uppercase tracking-widest text-[0.6rem] mb-1.5">{title}</p>
      <table>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="pr-3 align-middle">
                <span className="inline-flex items-center gap-1.5">
                  {r.color ? (
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: r.color, opacity: r.dim ? 0.5 : 1 }}
                    />
                  ) : (
                    <span className="inline-block w-2 h-2 flex-shrink-0" />
                  )}
                  <span className="text-ink/70">{r.label}</span>
                </span>
              </td>
              <td className="text-right font-medium text-ink tabular-nums">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* A label pinned to an event line, small enough to sit inside the plot. */
export function EventLabel({ viewBox, text, muted, anchor = "start", row = 0 }: any) {
  const { x, y } = viewBox ?? {};
  if (x == null) return null;
  const dx = anchor === "end" ? -6 : 6;
  return (
    <text
      x={x + dx}
      y={(y ?? 0) + 14 + row * 26}
      fill={muted ? "#8A8A80" : INK}
      fontSize={11}
      textAnchor={anchor}
    >
      {text.split("\n").map((line: string, i: number) => (
        <tspan key={i} x={x + dx} dy={i === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/* Series are named where they end rather than in a legend row. Pass the
   result as a Line's label prop; it draws only at the last point that has a
   value. dy nudges a label up or down when two lines finish close together. */
export function endLabel(lastIndex: number, text: string, color: string, dy = 0) {
  return (props: any) => {
    const { x, y, index } = props;
    if (index !== lastIndex || x == null || y == null) return <g />;
    const lines = text.split("\n");
    const top = y + dy - ((lines.length - 1) * 13) / 2;
    return (
      <text x={x + 8} y={top} dy="0.35em" fill={color} fontSize={12} fontWeight={600}>
        {lines.map((line, i) => (
          <tspan key={i} x={x + 8} dy={i === 0 ? "0.35em" : 13}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };
}

export function lastIndexWith(rows: any[], key: string) {
  for (let i = rows.length - 1; i >= 0; i -= 1) if (rows[i]?.[key] != null) return i;
  return -1;
}

/* A label at the top of a vertical marker such as a group mean, in the
   series colour, set to one side so two close markers do not collide. */
export function MarkerLabel({ viewBox, text, color, anchor = "start" }: any) {
  const { x, y } = viewBox ?? {};
  if (x == null) return null;
  const dx = anchor === "end" ? -6 : 6;
  return (
    <text x={x + dx} y={(y ?? 0) - 8} fill={color} fontSize={12} fontWeight={600} textAnchor={anchor}>
      {text}
    </text>
  );
}

type LegendItem = { label: string; color: string; dashed?: boolean; faint?: boolean };

function LegendRow({ items, className = "" }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-5 gap-y-1 mb-3 ${className}`}>
      {items.map((l) => (
        <span key={l.label} className="inline-flex items-center gap-2 text-xs text-ink/70">
          <span
            className="inline-block w-4 flex-shrink-0"
            style={{
              borderTop: `${l.dashed ? "2px dashed" : "2px solid"} ${l.color}`,
              opacity: l.faint ? 0.45 : 1,
            }}
          />
          {l.label}
        </span>
      ))}
    </div>
  );
}

/* Phones get the original matplotlib PNG of each figure instead of the
   Recharts version. Below md the image and its caption show (the PNGs carry
   their own legends); from md up, the interactive chart and its controls.
   Both are in the markup, so there is no flash on load. */
export type StaticFigure = {
  src: string;
  width: number;
  height: number;
  alt: string;
  title?: string;
  legend?: LegendItem[];
  caption?: ReactNode;
};

export const mobileFigure = (file: string) => `/women-in-chess-analysis/${file}`;

/* The number the chart is about, set large on the plot itself. `at` places
   it inside the chart area, clear of the data. */
export type Callout = {
  value: string;
  label: string;
  color?: string;
  at: { top?: number | string; left?: number | string; right?: number | string; bottom?: number | string };
};

/* The card. The title is a headline stating the finding, the subtitle says
   what is plotted, series are labelled on the lines, and the numbers behind
   the chart sit in a table for anyone who would rather read them. */
export function ChartFrame({
  figureNumber,
  title,
  subtitle,
  callout,
  caption,
  legend,
  controls,
  children,
  table,
  height = 320,
  staticFigure,
}: {
  figureNumber: string;
  title: string;
  subtitle?: ReactNode;
  callout?: Callout;
  caption?: ReactNode;
  legend?: LegendItem[];
  controls?: ReactNode;
  children: ReactNode;
  table?: { head: string[]; rows: (string | number)[][] };
  height?: number;
  staticFigure?: StaticFigure;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="bg-paper p-6 rounded-lg shadow-sm border border-sage-100">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <p className="text-xs uppercase tracking-widest text-sage-600">{figureNumber}</p>
        <p className={`text-[0.65rem] uppercase tracking-widest text-matcha ${staticFigure ? "hidden md:block" : ""}`}>
          Interactive
        </p>
      </div>
      {staticFigure?.title ? (
        <>
          <h3 className="md:hidden text-2xl font-serif leading-tight mb-4">{staticFigure.title}</h3>
          <h3 className="hidden md:block text-3xl font-serif leading-tight mb-1">{title}</h3>
        </>
      ) : (
        <h3 className="text-2xl md:text-3xl font-serif leading-tight mb-4 md:mb-1">{title}</h3>
      )}
      {subtitle ? (
        <p className={`text-sm text-ink/60 leading-snug mb-5 ${staticFigure ? "hidden md:block" : ""}`}>{subtitle}</p>
      ) : null}

      {controls ? <div className={`mb-4 ${staticFigure ? "hidden md:block" : ""}`}>{controls}</div> : null}

      {staticFigure?.legend?.length ? <LegendRow items={staticFigure.legend} className="md:hidden" /> : null}
      {legend?.length ? <LegendRow items={legend} className={staticFigure ? "hidden md:flex" : ""} /> : null}

      {staticFigure ? (
        <img
          src={staticFigure.src}
          width={staticFigure.width}
          height={staticFigure.height}
          alt={staticFigure.alt}
          loading="lazy"
          className="md:hidden w-full h-auto"
        />
      ) : null}
      <div className={`relative ${staticFigure ? "hidden md:block" : ""}`} style={{ width: "100%", height }}>
        {children}
        {callout ? (
          <div className="absolute pointer-events-none" style={callout.at}>
            <p className="stat-number text-5xl" style={{ color: callout.color ?? INK }}>
              {callout.value}
            </p>
            <p className="text-xs text-ink/70 leading-snug mt-1 max-w-[13rem]">{callout.label}</p>
          </div>
        ) : null}
      </div>

      {staticFigure?.caption ? (
        <>
          <p className="md:hidden text-xs text-sage-600 mt-3 italic">{staticFigure.caption}</p>
          {caption ? <p className="hidden md:block text-xs text-sage-600 mt-3 italic">{caption}</p> : null}
        </>
      ) : caption ? (
        <p className="text-xs text-sage-600 mt-3 italic">{caption}</p>
      ) : null}

      {table ? (
        <div className="mt-3">
          <button
            onClick={() => setShowTable((v) => !v)}
            className="text-xs text-sage-600 hover:text-sage-800 underline underline-offset-4 transition-colors"
          >
            {showTable ? "Hide the numbers" : "Show the numbers"}
          </button>
          {showTable ? (
            <div className="mt-3 max-h-64 overflow-auto border border-sage-100 rounded">
              <table className="w-full text-xs tabular-nums">
                <thead className="sticky top-0 bg-sage-50 text-sage-700">
                  <tr>
                    {table.head.map((h) => (
                      <th key={h} className="text-left font-medium px-3 py-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, i) => (
                    <tr key={i} className={i % 2 ? "bg-sage-50/40" : ""}>
                      {r.map((c, j) => (
                        <td key={j} className="px-3 py-1.5 whitespace-nowrap text-ink/80">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function useYearTicks(from: number, to: number, every = 1) {
  return useMemo(() => yearTicks(from, to, every), [from, to, every]);
}
