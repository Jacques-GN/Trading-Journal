"use client";

import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent, formatRatio } from "@/lib/format";
import { Target, Scale, TrendingUp, Activity } from "lucide-react";

export function PerformanceRatios({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Taux de réussite"
        value={formatPercent(stats.winRate)}
        sublabel={`${stats.winningTrades}G / ${stats.losingTrades}P`}
        accent={stats.winRate >= 50 ? "emerald" : "default"}
        icon={<Target className="h-4 w-4" />}
      />
      <StatCard
        label="Ratio P/L"
        value={formatRatio(stats.profitLossRatio)}
        sublabel={`G moy / P moy`}
        accent={stats.profitLossRatio >= 1 ? "emerald" : "rose"}
        icon={<Scale className="h-4 w-4" />}
      />
      <StatCard
        label="Profit Factor"
        value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
        sublabel={`Gains:brut pertes`}
        accent={stats.profitFactor >= 1 ? "emerald" : "rose"}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        label="Expectancy / trade"
        value={formatCurrency(stats.expectancy, { sign: true })}
        sublabel="Espérance math."
        accent={stats.expectancy >= 0 ? "emerald" : "rose"}
        icon={<Activity className="h-4 w-4" />}
      />
    </div>
  );
}
