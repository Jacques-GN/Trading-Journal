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
import { EmptyState } from "@/components/shared/stat-card";
import { BarChart3 } from "lucide-react";

export function StatisticsView() {
  const { currentAccountId, refreshVersion } = useAppStore();
  const { data: stats, loading } = useFetch<any>(
    currentAccountId ? `/api/stats?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/60 md:flex md:w-auto md:grid-cols-4">
          <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Performance</TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Distribution</TabsTrigger>
          <TabsTrigger value="setups" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Setups & instruments</TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400">Comportement</TabsTrigger>
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
            <AvgDurationCard stats={stats} />
            <LastNComparison stats={stats} />
          </div>
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
