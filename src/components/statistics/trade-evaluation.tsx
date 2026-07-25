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
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";

export function TradeEvaluation({ stats }: { stats: any }) {
  const data = (stats.byExitReason ?? []).map((s: any) => ({
    name: s.key,
    trades: s.trades,
    pnl: Math.round(s.pnl),
    winRate: s.winRate,
  }));
  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Répartition par raison de sortie">Évaluation des trades</SectionTitle>
      <CardContent className="px-0">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={130} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#fafafa" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(v: number, _n, p: any) => [
                  `${v} trades · ${formatCurrency(p?.payload?.pnl ?? 0, { sign: true })} · ${formatPercent(p?.payload?.winRate ?? 0)}`,
                  "Sorties",
                ]}
              />
              <Bar dataKey="trades" radius={[0, 4, 4, 0]}>
                {data.map((d: any, i: number) => (
                  <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#f43f5e"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
