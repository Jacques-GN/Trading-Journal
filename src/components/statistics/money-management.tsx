"use client";

import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatPercent, formatRatio } from "@/lib/format";
import { Boxes, Scale, Calculator, ShieldCheck } from "lucide-react";

export function MoneyManagement({ stats }: { stats: any }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Taille moyenne"
          value={stats.avgPositionSize.toFixed(2)}
          sublabel="Par trade"
          icon={<Boxes className="h-4 w-4" />}
        />
        <StatCard
          label="R/R moyen"
          value={formatRatio(stats.avgRR)}
          sublabel="Risk:reward réalisé"
          accent={stats.avgRR >= 1 ? "emerald" : "rose"}
          icon={<Scale className="h-4 w-4" />}
        />
        <StatCard
          label="Critère Kelly"
          value={formatPercent(stats.kellyCriterion, { sign: true })}
          sublabel="W - (1-W)/R"
          accent={stats.kellyCriterion > 0 ? "emerald" : "rose"}
          icon={<Calculator className="h-4 w-4" />}
        />
        <StatCard
          label="Risque recommandé"
          value={formatPercent(Math.min(Math.max(stats.kellyCriterion / 2, 0), 5))}
          sublabel="Demi-Kelly (max 5%)"
          accent="default"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle sub="Indicateurs money management">Money management</SectionTitle>
        <CardContent className="px-0 text-sm text-muted-foreground">
          <p>
            Le critère de Kelly indique le pourcentage optimal de capital à risquer par trade selon votre historique.
            En pratique, on recommande <span className="text-emerald-500">demi-Kelly</span> pour limiter la volatilité et préserver le capital.
            Au-delà de 2% par trade, le risque de ruine augmente significativement.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
