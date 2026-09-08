"use client";

import { ReactNode, useMemo, useState } from "react";

/* Shared furniture for the story's charts: the palette, the card the chart
   sits in, the tooltip shell, and the axis defaults. Everything here is light
   mode only, on the paper surface the page uses throughout. */

// Two series, one categorical pair. Validated against the #FAF6ED surface:
// chroma floor, CVD separation (deutan dE 8.3), normal-vision separation
// (dE 21.1) and contrast all pass, so sex is never carried by hue alone but
// the hues do hold up on their own.
export const WOMEN = "#B85C74";
export const MEN = "#5A7A2E";
export const COUNTERFACTUAL = "#6F6F68";
export const INK = "#2D2D2B";
export const MUTED = "#55692C";
export const GRID = "#E1E7D4";
export const SURFACE = "#FAF6ED";

export const AXIS = {
  stroke: "#C3CFA8",
  tick: { fill: MUTED, fontSize: 11 },
  tickLine: false,
} as const;

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
      fontSize={10.5}
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

/* The card. Same shape as the old PlotCard so the page reads the same, plus a
   legend row, a hint that the chart responds to a pointer, and the numbers
   behind it in a table for anyone who would rather read them. */
export function ChartFrame({
  figureNumber,
  title,
  caption,
  legend,
  controls,
  children,
  table,
  height = 320,
}: {
  figureNumber: string;
  title: string;
  caption?: ReactNode;
  legend: { label: string; color: string; dashed?: boolean; faint?: boolean }[];
  controls?: ReactNode;
  children: ReactNode;
  table?: { head: string[]; rows: (string | number)[][] };
  height?: number;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="bg-paper p-6 rounded-lg shadow-sm border border-sage-100">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <p className="text-xs uppercase tracking-widest text-sage-600">{figureNumber}</p>
        <p className="text-[0.65rem] uppercase tracking-widest text-matcha">Interactive</p>
      </div>
      <h3 className="text-2xl font-serif mb-4">{title}</h3>

      {controls ? <div className="mb-4">{controls}</div> : null}

      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3">
        {legend.map((l) => (
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

      <div style={{ width: "100%", height }}>{children}</div>

      {caption ? <p className="text-xs text-sage-600 mt-3 italic">{caption}</p> : null}

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
