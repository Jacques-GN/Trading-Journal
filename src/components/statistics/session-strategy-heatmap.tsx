"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const SESSIONS = [
  { value: "london", label: "Londres" },
  { value: "new_york", label: "New York" },
  { value: "asia", label: "Asie" },
  { value: "sydney", label: "Sydney" },
  { value: "overlap", label: "Chevauch." },
];

interface MatrixCell {
  session: string;
  strategy: string;
  pnl: number;
  trades: number;
}

export function SessionStrategyHeatmap({
  stats,
  strategies,
}: {
  stats: any;
  strategies: Array<{ id: string; name: string; color: string }>;
}) {
  const cells: MatrixCell[] = (stats.sessionStrategyMatrix ?? []).map((c: any) => ({
    session: c.session,
    strategy: c.strategy,
    pnl: c.pnl,
    trades: c.trades,
  }));

  // Build a map for quick lookup
  const lookup = new Map<string, MatrixCell>();
  for (const c of cells) {
    lookup.set(`${c.session}__${c.strategy}`, c);
  }

  // Determine max abs pnl for color intensity
  const maxAbs = cells.length
    ? Math.max(...cells.map((c) => Math.abs(c.pnl)), 1)
    : 1;

  // Strategies from props (fallback to extracting unique from cells)
  const stratCols =
    strategies.length > 0
      ? strategies
      : Array.from(new Set(cells.map((c) => c.strategy))).map((s, i) => ({
          id: s,
          name: s === "none" ? "Aucune" : s,
          color: i % 2 === 0 ? "emerald" : "cyan",
        }));

  const hasData = cells.length > 0;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="P/L cumulé par combinaison session × stratégie">
        Heatmap session × stratégie
      </SectionTitle>
      <CardContent className="px-0">
        {!hasData ? (
          <div className="flex h-48 items-center justify-center px-6 text-center text-xs text-muted-foreground">
            Aucune donnée à afficher. Renseignez la session marché sur vos trades.
          </div>
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <div
              className="grid min-w-[640px] gap-1"
              style={{
                gridTemplateColumns: `120px repeat(${stratCols.length}, minmax(110px, 1fr))`,
              }}
            >
              {/* Header row */}
              <div className="p-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Session
              </div>
              {stratCols.map((s) => (
                <div
                  key={s.id}
                  className="truncate p-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  title={s.name}
                >
                  {s.name}
                </div>
              ))}

              {/* Rows */}
              {SESSIONS.map((sess) => (
                <Row
                  key={sess.value}
                  sessionLabel={sess.label}
                  sessionValue={sess.value}
                  strategies={stratCols}
                  lookup={lookup}
                  maxAbs={maxAbs}
                />
              ))}
            </div>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Profit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-rose-500" />
            <span className="text-muted-foreground">Perte</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-white/10" />
            <span className="text-muted-foreground">Aucun trade</span>
          </span>
          <span className="text-muted-foreground">Intensité = magnitude du P/L</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  sessionLabel,
  sessionValue,
  strategies,
  lookup,
  maxAbs,
}: {
  sessionLabel: string;
  sessionValue: string;
  strategies: Array<{ id: string; name: string }>;
  lookup: Map<string, MatrixCell>;
  maxAbs: number;
}) {
  return (
    <>
      <div className="flex items-center p-2 text-[11px] font-medium uppercase tracking-wide text-foreground">
        {sessionLabel}
      </div>
      {strategies.map((s) => {
        const cell = lookup.get(`${sessionValue}__${s.id}`);
        if (!cell) {
          return (
            <div
              key={s.id}
              className="flex h-14 items-center justify-center rounded border border-white/5 bg-white/[0.02] text-[10px] text-muted-foreground/40"
            >
              —
            </div>
          );
        }
        const intensity = Math.min(1, Math.abs(cell.pnl) / maxAbs);
        const isProfit = cell.pnl >= 0;
        const bg = isProfit
          ? `rgba(16, 185, 129, ${0.1 + 0.6 * intensity})`
          : `rgba(244, 63, 94, ${0.1 + 0.6 * intensity})`;
        const text = intensity > 0.5 ? "text-white" : isProfit ? "text-emerald-500" : "text-rose-500";
        return (
          <div
            key={s.id}
            className={cn(
              "flex h-14 flex-col items-center justify-center rounded border border-white/5 px-2 text-center",
              text
            )}
            style={{ background: bg }}
            title={`${sessionLabel} · ${s.name} · ${cell.trades} trades`}
          >
            <span className="font-mono text-xs font-semibold">
              {formatCurrency(cell.pnl, { sign: true })}
            </span>
            <span className="text-[9px] opacity-80">{cell.trades} trades</span>
          </div>
        );
      })}
    </>
  );
}
