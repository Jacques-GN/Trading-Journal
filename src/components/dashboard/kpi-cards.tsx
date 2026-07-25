"use client";

import { StatCard } from "@/components/shared/stat-card";
import { DollarSign, Target, Scale, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercent, formatRatio } from "@/lib/format";

export function KpiCards({ stats }: { stats: any }) {
  const cards = [
    {
      label: "P/L net",
      value: formatCurrency(stats.netPnl, { sign: true }),
      delta: {
        value: formatPercent(stats.returnPct, { sign: true }),
        positive: stats.netPnl >= 0,
      },
      sublabel: `${stats.closedTrades} trades`,
      icon: <DollarSign className="h-4 w-4" />,
      accent: (stats.netPnl >= 0 ? "emerald" : "rose") as "emerald" | "rose",
    },
    {
      label: "Taux de réussite",
      value: formatPercent(stats.winRate),
      delta: {
        value: `${stats.winningTrades}G / ${stats.losingTrades}P`,
        positive: stats.winRate >= 50,
      },
      sublabel: `Plus longue série G: ${stats.longestWinStreak}`,
      icon: <Target className="h-4 w-4" />,
      accent: "default" as const,
    },
    {
      label: "Profit Factor",
      value: stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
      delta: {
        value: `Ratio ${formatRatio(stats.profitLossRatio)}`,
        positive: stats.profitFactor >= 1,
      },
      sublabel: `Brut: +${formatCurrency(stats.grossProfit)} / -${formatCurrency(stats.grossLoss)}`,
      icon: <Scale className="h-4 w-4" />,
      accent: (stats.profitFactor >= 1 ? "emerald" : "rose") as "emerald" | "rose",
    },
    {
      label: "Expectancy / trade",
      value: formatCurrency(stats.expectancy, { sign: true }),
      delta: {
        value: `Moy: ${formatCurrency(stats.avgPnl, { sign: true })}`,
        positive: stats.expectancy >= 0,
      },
      sublabel: `G moy ${formatCurrency(stats.avgWin)} · P moy ${formatCurrency(stats.avgLoss)}`,
      icon: <TrendingUp className="h-4 w-4" />,
      accent: (stats.expectancy >= 0 ? "emerald" : "rose") as "emerald" | "rose",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <StatCard
          key={c.label}
          label={c.label}
          value={c.value}
          delta={c.delta}
          sublabel={c.sublabel}
          icon={c.icon}
          accent={c.accent}
        />
      ))}
    </div>
  );
}
