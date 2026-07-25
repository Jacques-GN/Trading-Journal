"use client";

import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Wallet, TrendingUp, ArrowDownToLine, PiggyBank } from "lucide-react";

export function FinancialSummary({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Capital initial"
        value={formatCurrency(stats.initialCapital)}
        icon={<Wallet className="h-4 w-4" />}
        sublabel="Dépôt de départ"
      />
      <StatCard
        label="Profit net"
        value={formatCurrency(stats.netPnl, { sign: true })}
        delta={{
          value: formatPercent(stats.returnPct, { sign: true }),
          positive: stats.netPnl >= 0,
        }}
        accent={stats.netPnl >= 0 ? "emerald" : "rose"}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        label="Retraits"
        value={formatCurrency(0)}
        icon={<ArrowDownToLine className="h-4 w-4" />}
        sublabel="Aucun retrait"
      />
      <StatCard
        label="Solde final"
        value={formatCurrency(stats.endBalance)}
        accent={stats.netPnl >= 0 ? "emerald" : "default"}
        icon={<PiggyBank className="h-4 w-4" />}
        sublabel={`+${stats.closedTrades} trades clôturés`}
      />
    </div>
  );
}
