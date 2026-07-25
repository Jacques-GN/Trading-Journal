"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

export function ImprovementFollowThrough({ stats }: { stats: any }) {
  const f = stats.improvementFollowThrough ?? {
    applied: 0,
    notApplied: 0,
    winRateAfterApplied: 0,
    winRateAfterNotApplied: 0,
    followThroughPct: 0,
  };

  const total = f.applied + f.notApplied;
  const diff = f.winRateAfterApplied - f.winRateAfterNotApplied;
  const appliedBetter = diff > 0;

  const gaugeData = [{ value: Math.round(f.followThroughPct), fill: "#10b981" }];

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Appliquez-vous les améliorations identifiées ?">
        Suivi des améliorations
      </SectionTitle>
      <CardContent className="px-0">
        {total === 0 ? (
          <div className="flex h-48 items-center justify-center px-6 text-center text-xs text-muted-foreground">
            Renseignez le champ « Amélioration pour le prochain trade » sur au moins un trade pour
            activer cette analyse.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Follow-through gauge */}
            <div className="rounded-md border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Taux de suivi
              </p>
              <div className="relative h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="65%"
                    outerRadius="100%"
                    data={gaugeData}
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
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-mono text-2xl font-semibold text-foreground">
                    {Math.round(f.followThroughPct)}%
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    appliqué
                  </p>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                {f.applied} appliquées · {f.notApplied} ignorées
              </p>
            </div>

            {/* Win rate after applied */}
            <StatBlock
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              label="Win rate après application"
              value={f.winRateAfterApplied}
              tone="emerald"
              sub={`${f.applied} trades suivis`}
            />

            {/* Win rate after not applied */}
            <StatBlock
              icon={<XCircle className="h-4 w-4 text-rose-500" />}
              label="Win rate sans application"
              value={f.winRateAfterNotApplied}
              tone="rose"
              sub={`${f.notApplied} trades suivis`}
            />
          </div>
        )}

        {total > 0 && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-md border p-3",
              appliedBetter
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
                : "border-amber-500/30 bg-amber-500/5 text-amber-500"
            )}
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            <p className="text-xs">
              {appliedBetter ? (
                <>
                  Appliquer vos améliorations augmente votre win rate de{" "}
                  <span className="font-mono font-semibold">+{diff.toFixed(0)} pts</span>. Continuez !
                </>
              ) : (
                <>
                  Aucun gain mesuré à appliquer les améliorations pour le moment (échantillon : {total}).
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBlock({
  icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "emerald" | "rose";
  sub: string;
}) {
  const textClass = tone === "emerald" ? "text-emerald-500" : "text-rose-500";
  return (
    <div className="flex flex-col justify-between rounded-md border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
      <p className={cn("mt-2 font-mono text-2xl font-semibold", textClass)}>
        {formatPercent(value)}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
