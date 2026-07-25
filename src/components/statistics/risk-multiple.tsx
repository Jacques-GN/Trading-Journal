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

export function RiskMultiple({ stats }: { stats: any }) {
  const data = (stats.riskMultiples ?? []).map((d: any) => ({
    bucket: d.bucket,
    count: d.count,
    isLoss: d.isLoss,
  }));
  const total = data.reduce((s: number, d: any) => s + d.count, 0);

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Répartition des trades par multiple de risque">Distribution R-multiples</SectionTitle>
      <CardContent className="px-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#fafafa" }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                formatter={(v: number) => [v, "Trades"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((d: any, i: number) => (
                  <Cell key={i} fill={d.isLoss ? "#f43f5e" : "#10b981"} fillOpacity={d.count === 0 ? 0.15 : 0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {total > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {total} trades avec R/R calculé ·{" "}
            {data.filter((d: any) => !d.isLoss).reduce((s: number, d: any) => s + d.count, 0)} positifs /{" "}
            {data.filter((d: any) => d.isLoss).reduce((s: number, d: any) => s + d.count, 0)} négatifs
          </p>
        )}
      </CardContent>
    </Card>
  );
}
