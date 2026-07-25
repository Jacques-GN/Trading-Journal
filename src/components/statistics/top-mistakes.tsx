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

export function TopMistakes({ stats }: { stats: any }) {
  const data = (stats.topMistakes ?? []).map((m: any) => ({
    text: m.text,
    count: m.count,
    totalLoss: Math.round(m.totalLoss),
  }));

  const maxCount = data.length ? Math.max(...data.map((d: any) => d.count), 1) : 1;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Erreurs les plus citées et coût associé">
        Erreurs récurrentes
      </SectionTitle>
      <CardContent className="px-0">
        <div className="h-80 w-full">
          {data.length === 0 ? (
            <EmptyState
              label="Aucune erreur documentée — commencez à remplir le champ « Plus grosse erreur » sur vos trades."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 80, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="text"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, _n, p: any) => [
                    `${v} occurrences · ${formatCurrency(-(p?.payload?.totalLoss ?? 0))} de pertes`,
                    "Erreurs",
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.map((d: any, i: number) => (
                    <Cell
                      key={i}
                      fill="#f43f5e"
                      fillOpacity={0.45 + 0.55 * (d.count / maxCount)}
                    />
                  ))}
                  <LabelList
                    dataKey="totalLoss"
                    position="right"
                    formatter={(v: number) => `-$${v}`}
                    style={{ fill: "#f43f5e", fontSize: 10 }}
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}
