"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent } from "@/lib/format";
import { Lightbulb } from "lucide-react";

const BIAS_LABELS: Record<string, string> = {
  bullish: "Haussier",
  bearish: "Baissier",
  neutral: "Neutre",
};

export function BiasVsDirection({ stats }: { stats: any }) {
  const data = (stats.byBias ?? []).map((b: any) => ({
    bias: BIAS_LABELS[b.bias] ?? b.bias,
    withTrend: b.withTrend,
    counterTrend: b.counterTrend,
    winRate: Math.round(b.winRate),
    counterTrendLossRate: Math.round(b.counterTrendLossRate),
  }));

  // Find the highest counter-trend loss rate for the insight callout
  const withCounter = data.filter((d: any) => d.counterTrend > 0);
  const worstCounter = withCounter.length
    ? [...withCounter].sort((a, b) => b.counterTrendLossRate - a.counterTrendLossRate)[0]
    : null;
  const totalCounter = withCounter.reduce((s: number, d: any) => s + d.counterTrend, 0);

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Trades alignés vs contre la tendance du marché">
        Biais de marché vs direction
      </SectionTitle>
      <CardContent className="px-0">
        {worstCounter && totalCounter > 0 && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p className="text-xs text-rose-500">
              <span className="font-semibold">{worstCounter.counterTrendLossRate.toFixed(0)}%</span> de vos trades
              contre-tendance ({worstCounter.bias.toLowerCase()}) ont été perdants. Évitez de trader
              contre le biais dominant du marché.
            </p>
          </div>
        )}
        <div className="h-72 w-full">
          {data.every((d: any) => d.withTrend === 0 && d.counterTrend === 0) ? (
            <EmptyChart label="Renseignez le biais de marché sur vos trades pour activer ce graphique." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bias" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, name: string, p: any) => {
                    if (name === "Avec tendance") {
                      return [`${v} trades · ${formatPercent(p?.payload?.winRate ?? 0)} WR global`, name];
                    }
                    return [`${v} trades · ${formatPercent(p?.payload?.counterTrendLossRate ?? 0)} pertes`, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="square"
                />
                <Bar dataKey="withTrend" name="Avec tendance" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="counterTrend" name="Contre tendance" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
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
