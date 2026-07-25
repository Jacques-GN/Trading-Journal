"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FinancialSummary } from "./financial-summary";
import { PerformanceRatios } from "./performance-ratios";
import { DistributionChart } from "./distribution-chart";
import { SetupsMatrix } from "./setups-matrix";
import { InstrumentPerformance } from "./instrument-performance";
import { PeriodPerformance } from "./period-performance";
import { MoneyManagement } from "./money-management";
import { RiskMultiple } from "./risk-multiple";
import { TradeEvaluation } from "./trade-evaluation";
import { EmotionCorrelation } from "./emotion-correlation";
import { LastNComparison } from "./last-20-comparison";
import { EquityCurve as StatEquity } from "./equity-curve";
import { AvgDurationCard } from "./avg-duration-card";
import { SessionPerformance } from "./session-performance";
import { TimeframePerformance } from "./timeframe-performance";
import { DisciplineGauge } from "./discipline-gauge";
import { ConfidenceCalibration } from "./confidence-calibration";
import { RiskDistribution } from "./risk-distribution";
import { TopMistakes } from "./top-mistakes";
import { BiasVsDirection } from "./bias-vs-direction";
import { SessionStrategyHeatmap } from "./session-strategy-heatmap";
import { ImprovementFollowThrough } from "./improvement-followthrough";
import { EmptyState, StatCard } from "@/components/shared/stat-card";
import { BarChart3, Target, ShieldCheck, CheckCircle2 } from "lucide-react";
import { formatPercent } from "@/lib/format";

interface Strategy {
  id: string;
  name: string;
  color: string;
}

export function StatisticsView() {
  const { currentAccountId, refreshVersion } = useAppStore();
  const { data: stats, loading } = useFetch<any>(
    currentAccountId ? `/api/stats?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );
  const { data: strategies } = useFetch<Strategy[]>("/api/strategies", {
    refreshKey: refreshVersion,
  });

  if (!currentAccountId) {
    return (
      <EmptyState
        title="Aucun compte sélectionné"
        description="Sélectionnez un compte pour voir vos statistiques."
        icon={<BarChart3 className="h-5 w-5" />}
      />
    );
  }

  if (loading || !stats) {
    return <StatsSkeleton />;
  }

  if (stats.totalTrades === 0) {
    return (
      <EmptyState
        title="Pas encore de statistiques"
        description="Ajoutez quelques trades pour générer des statistiques."
        icon={<BarChart3 className="h-5 w-5" />}
      />
    );
  }

  const d = stats.discipline ?? {
    setupValidPct: 0,
    rulesFollowedPct: 0,
    overallPct: 0,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/60 md:flex md:w-auto md:grid-cols-5">
          <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Performance</TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Distribution</TabsTrigger>
          <TabsTrigger value="setups" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Setups &amp; instruments</TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Comportement</TabsTrigger>
          <TabsTrigger value="discipline" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Discipline</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4 space-y-6">
          <FinancialSummary stats={stats} />
          <PerformanceRatios stats={stats} />
          <StatEquity stats={stats} />
          <PeriodPerformance stats={stats} />
        </TabsContent>

        <TabsContent value="distribution" className="mt-4 space-y-6">
          <DistributionChart stats={stats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RiskMultiple stats={stats} />
            <LastNComparison stats={stats} />
          </div>
          <MoneyManagement stats={stats} />
        </TabsContent>

        <TabsContent value="setups" className="mt-4 space-y-6">
          <SetupsMatrix stats={stats} />
          <InstrumentPerformance stats={stats} />
        </TabsContent>

        <TabsContent value="behavior" className="mt-4 space-y-6">
          <TradeEvaluation stats={stats} />
          <EmotionCorrelation stats={stats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SessionPerformance stats={stats} />
            <TimeframePerformance stats={stats} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AvgDurationCard stats={stats} />
            <LastNComparison stats={stats} />
          </div>
        </TabsContent>

        <TabsContent value="discipline" className="mt-4 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Score de discipline"
              value={formatPercent(d.overallPct)}
              sublabel="Moyenne setup + règles"
              accent={d.overallPct >= 70 ? "emerald" : d.overallPct >= 50 ? "default" : "rose"}
              icon={<Target className="h-4 w-4" />}
            />
            <StatCard
              label="Setup valide"
              value={formatPercent(d.setupValidPct)}
              sublabel="Trades avec setup confirmé"
              accent={d.setupValidPct >= 70 ? "emerald" : d.setupValidPct >= 50 ? "default" : "rose"}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard
              label="Règles suivies"
              value={formatPercent(d.rulesFollowedPct)}
              sublabel="Trades selon le plan"
              accent={d.rulesFollowedPct >= 70 ? "emerald" : d.rulesFollowedPct >= 50 ? "default" : "rose"}
              icon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>

          <DisciplineGauge stats={stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RiskDistribution stats={stats} />
            <ConfidenceCalibration stats={stats} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BiasVsDirection stats={stats} />
            <TopMistakes stats={stats} />
          </div>

          <SessionStrategyHeatmap stats={stats} strategies={strategies ?? []} />

          <ImprovementFollowThrough stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-md bg-zinc-900/40" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-md bg-zinc-900/40" />
      <div className="h-64 animate-pulse rounded-md bg-zinc-900/40" />
    </div>
  );
}
