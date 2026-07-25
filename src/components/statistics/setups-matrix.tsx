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
import { formatCurrency } from "@/lib/format";

export function SetupsMatrix({ stats }: { stats: any }) {
  const data = (stats.byStrategy ?? []).map((s: any) => ({
    name: s.name,
    pnl: Math.round(s.pnl),
    trades: s.trades,
    winRate: s.winRate,
    color: s.color,
  }));
  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Performance par stratégie">Setups vs P/L</SectionTitle>
      <CardContent className="px-0">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#fafafa" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(v: number, _n, p: any) => {
                  const wr = p?.payload?.winRate ?? 0;
                  const tr = p?.payload?.trades ?? 0;
                  return [formatCurrency(v, { sign: true }), `P/L · ${tr} trades · ${wr.toFixed(0)}% WR`];
                }}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {data.map((d: any, i: number) => (
                  <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#f43f5e"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {data.map((d: any) => (
            <div key={d.name} className="rounded-md border border-white/5 bg-white/[0.02] p-2 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.name}</p>
              <p className={`mt-1 font-mono text-xs font-semibold ${d.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {formatCurrency(d.pnl, { sign: true })}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{d.trades}t · {d.winRate.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
