"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { ShieldCheck } from "lucide-react";

export function RiskDistribution({ stats }: { stats: any }) {
  const data = (stats.riskDistribution ?? []).map((b: any) => ({
    bucket: b.bucket,
    count: b.count,
    pnl: Math.round(b.pnl),
    isRecommended: b.isRecommended,
  }));

  const total = data.reduce((s: number, d: any) => s + d.count, 0);
  const recommendedCount = data.find((d: any) => d.isRecommended)?.count ?? 0;
  const recommendedPct = total > 0 ? (recommendedCount / total) * 100 : 0;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Répartition des trades selon le risque par position">
        Distribution du risque par trade
      </SectionTitle>
      <CardContent className="px-0">
        <div className="mb-3 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <p className="text-xs text-emerald-500">
            Zone recommandée <span className="font-semibold">1-2%</span> — vous y êtes
            sur <span className="font-mono font-semibold">{recommendedPct.toFixed(0)}%</span> de vos trades.
          </p>
        </div>
        <div className="h-64 w-full">
          {total === 0 ? (
            <EmptyChart label="Renseignez le risque % sur vos trades pour activer cet histogramme." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  labelFormatter={(l) => `Risque ${l}`}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, _n, p: any) => [
                    `${v} trades · P/L ${formatCurrency(p?.payload?.pnl ?? 0, { sign: true })}`,
                    "Trades",
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((d: any, i: number) => (
                    <Cell
                      key={i}
                      fill={
                        d.isRecommended
                          ? "#10b981"
                          : d.bucket === "<1%" || d.bucket === "2-3%"
                          ? "#f59e0b"
                          : "#f43f5e"
                      }
                      fillOpacity={d.count === 0 ? 0.15 : 0.85}
                    />
                  ))}
                  <LabelList dataKey="count" position="top" style={{ fill: "#a1a1aa", fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Zone 1-2% (recommandée)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">Légèrement hors zone</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-rose-500" />
            <span className="text-muted-foreground">Risque élevé (&gt;3%)</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
