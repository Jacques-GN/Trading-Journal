"use client";

import { useFetch, apiPost } from "@/lib/api";
import { DailyCheckin } from "./daily-checkin";
import { EmotionAnalytics } from "./emotion-analytics";
import { DisciplineTrends } from "./discipline-trends";
import { InsightsCards } from "./insights-cards";
import { useAppStore } from "@/lib/store";
import { EmptyState } from "@/components/shared/stat-card";
import { Brain } from "lucide-react";

export function MindsetView() {
  const { currentAccountId, refreshVersion } = useAppStore();
  const { data: trades } = useFetch<any[]>(
    currentAccountId ? `/api/trades?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );

  if (!currentAccountId) {
    return (
      <EmptyState
        title="Aucun compte sélectionné"
        icon={<Brain className="h-5 w-5" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DailyCheckin />
      <InsightsCards trades={trades ?? []} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EmotionAnalytics trades={trades ?? []} />
        <DisciplineTrends trades={trades ?? []} />
      </div>
    </div>
  );
}
