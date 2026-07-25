"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Lightbulb } from "lucide-react";

export function DisciplineGauge({ stats }: { stats: any }) {
  const d = stats.discipline ?? {
    setupValidPct: 0,
    rulesFollowedPct: 0,
    overallPct: 0,
    disciplinedTradesPnl: 0,
    indisciplinedTradesPnl: 0,
    disciplinedTradesCount: 0,
    indisciplinedTradesCount: 0,
  };

  const gauges = [
    {
      key: "setup",
      label: "Setup valide",
      value: Math.round(d.setupValidPct),
      fill: "#10b981",
    },
    {
      key: "rules",
      label: "Règles suivies",
      value: Math.round(d.rulesFollowedPct),
      fill: "#14b8a6",
    },
  ];

  const diff = d.disciplinedTradesPnl - d.indisciplinedTradesPnl;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Respect du plan et impact sur le P/L">
        Score de discipline
      </SectionTitle>
      <CardContent className="px-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gauges.map((g) => (
            <div key={g.key} className="rounded-md border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {g.label}
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                  {g.value}%
                </span>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="65%"
                    outerRadius="100%"
                    data={[{ value: g.value, fill: g.fill }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      background={{ fill: "rgba(255,255,255,0.05)" }}
                      dataKey="value"
                      cornerRadius={8}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="-mt-20 text-center font-mono text-2xl font-semibold text-foreground">
                {g.value}%
              </p>
              <div className="mt-16 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                {g.value >= 75 ? "Excellent" : g.value >= 50 ? "À améliorer" : "Critique"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ComparisonCard
            label="P/L discipliné"
            value={d.disciplinedTradesPnl}
            count={d.disciplinedTradesCount}
            tone="emerald"
          />
          <ComparisonCard
            label="P/L indiscipliné"
            value={d.indisciplinedTradesPnl}
            count={d.indisciplinedTradesCount}
            tone="rose"
          />
          <div className="flex flex-col justify-between rounded-md border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                Écart
              </p>
            </div>
            <p className="mt-2 font-mono text-xl font-semibold text-foreground">
              {formatCurrency(diff, { sign: true })}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {diff > 0
                ? "La discipline paie — écart positif"
                : diff < 0
                ? "L'indiscipline a coûté cher"
                : "Aucun écart mesuré"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonCard({
  label,
  value,
  count,
  tone,
}: {
  label: string;
  value: number;
  count: number;
  tone: "emerald" | "rose";
}) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : "border-rose-500/30 bg-rose-500/5";
  const textClass = tone === "emerald" ? "text-emerald-500" : "text-rose-500";
  return (
    <div className={`flex flex-col justify-between rounded-md border p-3 ${toneClasses}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-mono text-xl font-semibold ${textClass}`}>
        {formatCurrency(value, { sign: true })}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {count} trade{count > 1 ? "s" : ""} · {formatPercent(value === 0 ? 0 : value < 0 ? -100 : 100).replace("%", "")}{" "}
        impact
      </p>
    </div>
  );
}
