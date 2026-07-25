"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatCurrency, formatDuration } from "@/lib/format";
import { Flame, TrendingUp, TrendingDown, Award, AlertTriangle, Clock } from "lucide-react";

export function QuickStats({ stats }: { stats: any }) {
  const streak = stats.currentStreak;
  const items = [
    {
      label: "Trades totaux",
      value: String(stats.totalTrades),
      sub: `${stats.openTrades} ouverts`,
    },
    {
      label: "Gagnants",
      value: String(stats.winningTrades),
      sub: formatCurrency(stats.avgWin),
      icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />,
    },
    {
      label: "Perdants",
      value: String(stats.losingTrades),
      sub: formatCurrency(stats.avgLoss),
      icon: <TrendingDown className="h-3.5 w-3.5 text-rose-500" />,
    },
    {
      label: "Meilleur trade",
      value: formatCurrency(stats.bestTrade, { sign: true }),
      icon: <Award className="h-3.5 w-3.5 text-emerald-500" />,
    },
    {
      label: "Pire trade",
      value: formatCurrency(stats.worstTrade, { sign: true }),
      icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />,
    },
    {
      label: "Drawdown max",
      value: `-${stats.maxDrawdown.toFixed(2)}%`,
      icon: <TrendingDown className="h-3.5 w-3.5 text-rose-500" />,
    },
    {
      label: "Durée moyenne",
      value: formatDuration(stats.avgDurationMin),
      icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: "Série en cours",
      value: streak.count > 0 ? `${streak.count} ${streak.type === "win" ? "G" : "P"}` : "—",
      icon: <Flame className={`h-3.5 w-3.5 ${streak.type === "win" ? "text-emerald-500" : streak.type === "loss" ? "text-rose-500" : "text-muted-foreground"}`} />,
    },
  ];

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Indicateurs essentiels">Statistiques rapides</SectionTitle>
      <CardContent className="grid grid-cols-2 gap-3 px-0">
        {items.map((it) => (
          <div key={it.label} className="rounded-md border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5">
              {it.icon}
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {it.label}
              </p>
            </div>
            <p className="mt-1.5 font-mono text-base font-semibold tabular-nums md:text-lg">
              {it.value}
            </p>
            {it.sub && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{it.sub}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
