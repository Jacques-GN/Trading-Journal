"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/lib/api";
import { KpiCards } from "./kpi-cards";
import { EquityCurve } from "./equity-curve";
import { QuickStats } from "./quick-stats";
import { RecentTrades } from "./recent-trades";
import { DailyHabits } from "./daily-habits";
import { CalendarHeatmap } from "./calendar-heatmap";
import { EmptyState } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardView() {
  const { currentAccountId, setTradeForm, refreshVersion } = useAppStore();
  const { data: stats, loading } = useFetch<any>(
    currentAccountId ? `/api/stats?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );
  const { data: trades } = useFetch<any[]>(
    currentAccountId ? `/api/trades?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );

  if (!currentAccountId) {
    return (
      <EmptyState
        title="Aucun compte sélectionné"
        description="Créez un compte pour commencer à journaler."
        icon={<BookOpen className="h-6 w-6" />}
      />
    );
  }

  if (loading || !stats || !trades) {
    return <DashboardSkeleton />;
  }

  if (trades.length === 0) {
    return (
      <EmptyState
        title="Aucun trade encore"
        description="Ajoutez votre premier trade pour démarrer votre journal."
        icon={<BookOpen className="h-6 w-6" />}
        action={
          <Button
            onClick={() => setTradeForm(true)}
            className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            Ajouter un trade
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <KpiCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EquityCurve stats={stats} />
        </div>
        <QuickStats stats={stats} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTrades trades={trades} />
        </div>
        <div className="space-y-6">
          <DailyHabits />
          <CalendarHeatmap trades={trades} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-28 animate-pulse border-white/5 bg-zinc-900/40" />
        ))}
      </div>
      <Card className="h-72 animate-pulse border-white/5 bg-zinc-900/40" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="h-48 animate-pulse border-white/5 bg-zinc-900/40" />
        <Card className="h-48 animate-pulse border-white/5 bg-zinc-900/40" />
      </div>
    </div>
  );
}
