"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Lightbulb } from "lucide-react";

export function ConfidenceCalibration({ stats }: { stats: any }) {
  const data = (stats.confidenceCalibration ?? []).map((b: any) => ({
    bucket: b.bucket,
    trades: b.trades,
    winRate: Math.round(b.winRate),
    avgPnl: Math.round(b.avgPnl),
  }));

  // Detect overconfidence: high confidence bucket with win rate lower than low confidence
  const lowConf = data.find((d: any) => d.bucket === "1-3");
  const highConf = data.find((d: any) => d.bucket === "9-10");
  const overconfident =
    lowConf && highConf && lowConf.trades > 0 && highConf.trades > 0 && highConf.winRate < lowConf.winRate;

  // Ideal calibration line (1-3: 30%, 4-6: 50%, 7-8: 65%, 9-10: 75%)
  const ideal = [
    { bucket: "1-3", winRate: 30 },
    { bucket: "4-6", winRate: 50 },
    { bucket: "7-8", winRate: 65 },
    { bucket: "9-10", winRate: 75 },
  ];

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Plus la confiance est élevée, plus le win rate devrait l'être aussi">
        Calibration de la confiance
      </SectionTitle>
      <CardContent className="px-0">
        {overconfident && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-500">
              <span className="font-semibold">Surconfiance détectée</span> — votre win rate
              à 9-10/10 ({highConf.winRate}%) est inférieur à celui à 1-3/10 ({lowConf.winRate}%).
              Vos meilleures convictions ne sont pas plus rentables que vos trades à faible confiance.
            </p>
          </div>
        )}
        <div className="h-72 w-full">
          {data.every((d: any) => d.trades === 0) ? (
            <EmptyChart label="Renseignez la confiance (1-10) sur vos trades pour activer cette analyse." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#fafafa" }}
                  labelFormatter={(l) => `Confiance ${l}/10`}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  formatter={(v: number, _n, p: any) => [
                    `${(v ?? 0).toFixed(0)}% WR · ${p?.payload?.trades} trades · P/L moyen ${formatCurrency(p?.payload?.avgPnl ?? 0, { sign: true })}`,
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
                <Line
                  dataKey="winRate"
                  data={ideal}
                  type="monotone"
                  stroke="#71717a"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Ligne pointillée = calibration idéale (la confiance devrait croître avec le win rate).
        </p>
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
