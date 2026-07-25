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
import { useMemo } from "react";

export function EmotionAnalytics({ trades }: { trades: any[] }) {
  const data = useMemo(() => {
    const m = new Map<string, { count: number; wins: number; pnl: number }>();
    for (const t of trades) {
      if (!t.emotion || t.status !== "closed") continue;
      if (!m.has(t.emotion)) m.set(t.emotion, { count: 0, wins: 0, pnl: 0 });
      const v = m.get(t.emotion)!;
      v.count++;
      if (t.pnl > 0) v.wins++;
      v.pnl += t.pnl;
    }
    return Array.from(m.entries())
      .map(([emotion, v]) => ({
        emotion,
        count: v.count,
        winRate: v.count ? (v.wins / v.count) * 100 : 0,
        avgPnl: v.count ? v.pnl / v.count : 0,
        totalPnl: v.pnl,
      }))
      .sort((a, b) => b.count - a.count);
  }, [trades]);

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Distribution et performance par émotion">Analyse émotionnelle</SectionTitle>
      <CardContent className="px-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="emotion" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#fafafa" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(v: number, _n, p: any) => [
                  `${v} trades · ${formatPercent(p?.payload?.winRate ?? 0)} WR · ${formatCurrency(p?.payload?.avgPnl ?? 0, { sign: true })}/trade`,
                  "Trades",
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.avgPnl >= 0 ? "#10b981" : "#f43f5e"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {data.map((d) => (
            <div key={d.emotion} className="rounded-md border border-white/5 bg-white/[0.02] p-2 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.emotion}</p>
              <p className={`mt-1 font-mono text-xs font-semibold ${d.avgPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {formatCurrency(d.avgPnl, { sign: true })}
              </p>
              <p className="text-[10px] text-muted-foreground">{formatPercent(d.winRate)} WR</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
