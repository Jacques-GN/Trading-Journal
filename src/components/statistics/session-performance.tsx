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
import { formatCurrency, formatPercent } from "@/lib/format";

const SESSION_LABELS: Record<string, string> = {
  london: "Londres",
  new_york: "New York",
  asia: "Asie",
  sydney: "Sydney",
  overlap: "Chevauch.",
  unknown: "Autre",
};

export function SessionPerformance({ stats }: { stats: any }) {
  const data = (stats.bySession ?? [])
    .filter((s: any) => s.trades > 0)
    .map((s: any) => ({
      session: SESSION_LABELS[s.session] ?? s.session,
      pnl: Math.round(s.pnl),
      trades: s.trades,
      winRate: s.winRate,
      avgPnl: Math.round(s.avgPnl),
    }));

  const maxAbsPnl = data.length
    ? Math.max(...data.map((d: any) => Math.abs(d.pnl)), 1)
    : 1;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="P/L et win rate par session de marché">
        Performance par session
      </SectionTitle>
      <CardContent className="px-0">
        <div className="h-72 w-full">
          {data.length === 0 ? (
            <EmptyChart label="Aucune session renseignée sur vos trades." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="session"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, _n, p: any) => [
                    `${formatCurrency(v, { sign: true })} · ${formatPercent(p?.payload?.winRate ?? 0)} WR · ${p?.payload?.trades} trades`,
                    "P/L",
                  ]}
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                  {data.map((d: any, i: number) => (
                    <Cell
                      key={i}
                      fill={d.pnl >= 0 ? "#10b981" : "#f43f5e"}
                      fillOpacity={0.6 + 0.4 * (Math.abs(d.pnl) / maxAbsPnl)}
                    />
                  ))}
                  <LabelList
                    dataKey="winRate"
                    position="right"
                    formatter={(v: number) => `${(v ?? 0).toFixed(0)}% WR`}
                    style={{ fill: "#71717a", fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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
