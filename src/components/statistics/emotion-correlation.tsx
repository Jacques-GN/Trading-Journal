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
import { Lightbulb } from "lucide-react";

export function EmotionCorrelation({ stats }: { stats: any }) {
  const data = (stats.byEmotion ?? []).map((s: any) => ({
    name: s.emotion,
    trades: s.trades,
    winRate: s.winRate,
    avgPnl: Math.round(s.avgPnl),
    totalPnl: Math.round(s.totalPnl),
  }));

  // Find insight: emotion with worst avg pnl
  const worst = data.length ? [...data].sort((a, b) => a.avgPnl - b.avgPnl)[0] : null;
  const best = data.length ? [...data].sort((a, b) => b.avgPnl - a.avgPnl)[0] : null;
  // Find emotion with lowest win rate (>=3 trades)
  const enough = data.filter((d) => d.trades >= 2);
  const worstWr = enough.length ? [...enough].sort((a, b) => a.winRate - b.winRate)[0] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {worst && (
          <InsightCard
            tone="rose"
            title="Émotion coûteuse"
            text={`Sur ${worst.trades} trades sous "${worst.name}", P/L moyen de ${formatCurrency(worst.avgPnl, { sign: true })}.`}
          />
        )}
        {best && best.name !== worst?.name && (
          <InsightCard
            tone="emerald"
            title="État d'esprit gagnant"
            text={`"${best.name}" génère ${formatCurrency(best.avgPnl, { sign: true })}/trade en moyenne (${formatPercent(best.winRate)} WR).`}
          />
        )}
        {worstWr && (
          <InsightCard
            tone="amber"
            title="Faible win rate"
            text={`"${worstWr.name}" → seulement ${formatPercent(worstWr.winRate)} de réussite (${worstWr.trades} trades).`}
          />
        )}
      </div>

      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle sub="Performance par état émotionnel">Corrélation émotion / P/L</SectionTitle>
        <CardContent className="px-0">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, _n, p: any) => [
                    `${formatCurrency(v, { sign: true })} · ${formatPercent(p?.payload?.winRate ?? 0)} WR · ${p?.payload?.trades} trades`,
                    "P/L moyen",
                  ]}
                />
                <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
                  {data.map((d: any, i: number) => (
                    <Cell key={i} fill={d.avgPnl >= 0 ? "#10b981" : "#f43f5e"} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightCard({
  tone,
  title,
  text,
}: {
  tone: "emerald" | "rose" | "amber";
  title: string;
  text: string;
}) {
  const map = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-500",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-500",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-500",
  };
  return (
    <Card className={`border p-4 ${map[tone]}`}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-widest">{title}</p>
      </div>
      <p className="mt-2 text-xs text-foreground/90">{text}</p>
    </Card>
  );
}
