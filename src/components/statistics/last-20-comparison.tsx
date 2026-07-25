"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent, formatRatio } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LastNComparison({ stats }: { stats: any }) {
  const l = stats.last20 ?? { winRate: 0, netPnl: 0, avgRR: 0, expectancy: 0 };
  const a = stats.all ?? { winRate: 0, netPnl: 0, avgRR: 0, expectancy: 0 };

  const rows = [
    { label: "Win rate", l: l.winRate, a: a.winRate, fmt: (v: number) => formatPercent(v) },
    { label: "P/L net", l: l.netPnl, a: a.netPnl, fmt: (v: number) => formatCurrency(v, { sign: true }) },
    { label: "R/R moyen", l: l.avgRR, a: a.avgRR, fmt: (v: number) => formatRatio(v) },
    { label: "Expectancy", l: l.expectancy, a: a.expectancy, fmt: (v: number) => formatCurrency(v, { sign: true }) },
  ];

  const trend = l.netPnl >= a.netPnl ? "up" : "down";

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle
        sub="20 derniers trades vs tout l'historique"
        right={
          <span className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold",
            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend === "up" ? "En progression" : "En régression"}
          </span>
        }
      >
        20 derniers vs global
      </SectionTitle>
      <CardContent className="space-y-2 px-0">
        {rows.map((r) => {
          const delta = r.l - r.a;
          const positive = delta >= 0;
          return (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-white/[0.02] p-3"
            >
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {r.label}
              </span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase text-muted-foreground">Derniers 20</p>
                  <p className="font-mono text-sm font-semibold">{r.fmt(r.l)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-muted-foreground">Global</p>
                  <p className="font-mono text-sm text-muted-foreground">{r.fmt(r.a)}</p>
                </div>
                <div className={cn(
                  "w-16 text-right font-mono text-xs",
                  positive ? "text-emerald-500" : "text-rose-500"
                )}>
                  {positive ? "+" : ""}
                  {typeof r.l === "number" && typeof r.a === "number"
                    ? (r.label === "Win rate" || r.label === "Expectancy" || r.label === "P/L net")
                      ? r.fmt(delta)
                      : delta.toFixed(2)
                    : ""}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
