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

export function DistributionChart({ stats }: { stats: any }) {
  const data = (stats.distribution ?? []).map((d: any) => ({
    bucket: d.bucket,
    count: d.count,
    isLoss: d.isLoss,
  }));
  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Répartition des P/L par paliers">
        Distribution des gains &amp; pertes
      </SectionTitle>
      <CardContent className="px-0">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} tickLine={false} axisLine={false} interval={0} />
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
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Gains</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-rose-500" />
            <span className="text-muted-foreground">Pertes</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
