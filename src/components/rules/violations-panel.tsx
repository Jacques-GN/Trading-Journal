"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle, EmptyState } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

export function ViolationsPanel({ trades }: { trades: any[] }) {
  const violations = useMemo(() => {
    const m = new Map<string, { count: number; pnl: number; trades: any[] }>();
    for (const t of trades) {
      if (!t.ruleViolated || !t.ruleViolated.trim()) continue;
      const key = t.ruleViolated.trim();
      if (!m.has(key)) m.set(key, { count: 0, pnl: 0, trades: [] });
      const v = m.get(key)!;
      v.count++;
      if (t.status === "closed") v.pnl += t.pnl;
      v.trades.push(t);
    }
    return Array.from(m.entries())
      .map(([rule, v]) => ({ rule, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [trades]);

  const totalCost = violations.reduce((s, v) => s + v.pnl, 0);

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle
        sub={`${violations.length} règle(s) violée(s) · coût total ${formatCurrency(totalCost, { sign: true })}`}
      >
        Violations de règles
      </SectionTitle>
      <CardContent className="px-0">
        {violations.length === 0 ? (
          <EmptyState
            title="Aucune violation 🎉"
            description="Vous avez respecté toutes vos règles sur les trades enregistrés."
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-2">
            {violations.map((v) => (
              <div
                key={v.rule}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-rose-500/20 bg-rose-500/5 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-100">{v.rule}</p>
                  <p className="text-[11px] text-rose-400/80">
                    {v.count} trade(s) · P/L moyen {formatCurrency(v.pnl / v.count, { sign: true })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-rose-400">
                    {formatCurrency(v.pnl, { sign: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
