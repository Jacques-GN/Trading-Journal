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

export function TimeframePerformance({ stats }: { stats: any }) {
  const data = (stats.byTimeframe ?? []).map((s: any) => ({
    timeframe: s.timeframe,
    winRate: s.winRate,
    trades: s.trades,
    pnl: Math.round(s.pnl),
    avgRr: s.avgRr,
  }));

  const max = data.length ? Math.max(...data.map((d: any) => d.winRate), 100) : 100;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Taux de réussite par unité de temps">
        Win rate par timeframe
      </SectionTitle>
      <CardContent className="px-0">
        <div className="h-72 w-full">
          {data.length === 0 ? (
            <EmptyChart label="Aucun timeframe renseigné sur vos trades." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeframe" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  domain={[0, Math.ceil(max / 10) * 10]}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, _n, p: any) => [
                    `${(v ?? 0).toFixed(0)}% WR · ${p?.payload?.trades} trades · R/R moyen ${(p?.payload?.avgRr ?? 0).toFixed(2)}`,
                    "Win rate",
                  ]}
                />
                <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                  {data.map((d: any, i: number) => (
                    <Cell
                      key={i}
                      fill={
                        d.winRate >= 60
                          ? "#10b981"
                          : d.winRate >= 40
                          ? "#f59e0b"
                          : "#f43f5e"
                      }
                      fillOpacity={0.85}
                    />
                  ))}
                  <LabelList
                    dataKey="winRate"
                    position="top"
                    formatter={(v: number) => `${(v ?? 0).toFixed(0)}%`}
                    style={{ fill: "#a1a1aa", fontSize: 10 }}
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
