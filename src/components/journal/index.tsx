"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/lib/api";
import { TradeDetailDialog } from "./trade-detail";
import { Filters } from "./filters";
import { TradeTable } from "./trade-table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/stat-card";
import { useState, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JournalView() {
  const { currentAccountId, setTradeForm, refreshVersion } = useAppStore();
  const [filters, setFilters] = useState({
    range: "all",
    instrument: "",
    strategyId: "all",
    result: "all",
  });
  const [detailId, setDetailId] = useState<string | null>(null);

  const buildUrl = useCallback(() => {
    if (!currentAccountId) return null;
    const params = new URLSearchParams({ accountId: currentAccountId });
    if (filters.range === "today") {
      const t = new Date(); t.setHours(0, 0, 0, 0);
      params.set("from", t.toISOString());
    } else if (filters.range === "week") {
      const w = new Date(); w.setDate(w.getDate() - 7);
      params.set("from", w.toISOString());
    } else if (filters.range === "month") {
      const m = new Date(); m.setMonth(m.getMonth() - 1);
      params.set("from", m.toISOString());
    } else if (filters.range === "year") {
      const y = new Date(); y.setFullYear(y.getFullYear() - 1);
      params.set("from", y.toISOString());
    }
    if (filters.instrument) params.set("instrument", filters.instrument);
    if (filters.strategyId !== "all") params.set("strategyId", filters.strategyId);
    if (filters.result !== "all") params.set("result", filters.result);
    return `/api/trades?${params.toString()}`;
  }, [currentAccountId, filters]);

  const { data: trades, loading } = useFetch<any[]>(buildUrl(), { refreshKey: refreshVersion });

  const refresh = () => useAppStore.getState().triggerRefresh();

  return (
    <div className="space-y-4">
      <Filters filters={filters} setFilters={setFilters} />

      <Card className="border-white/5 bg-zinc-900/40 p-3 md:p-4">
        {!currentAccountId ? (
          <EmptyState
            title="Aucun compte sélectionné"
            description="Sélectionnez un compte pour voir vos trades."
            icon={<BookOpen className="h-5 w-5" />}
          />
        ) : loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
            ))}
          </div>
        ) : !trades || trades.length === 0 ? (
          <EmptyState
            title="Aucun trade trouvé"
            description="Ajustez les filtres ou ajoutez un nouveau trade."
            icon={<BookOpen className="h-5 w-5" />}
            action={
              <Button
                onClick={() => setTradeForm(true)}
                className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              >
                Ajouter un trade
              </Button>
            }
          />
        ) : (
          <TradeTable trades={trades} onSelect={setDetailId} />
        )}
      </Card>

      <TradeDetailDialog
        tradeId={detailId}
        open={!!detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        onDeleted={refresh}
      />
    </div>
  );
}
