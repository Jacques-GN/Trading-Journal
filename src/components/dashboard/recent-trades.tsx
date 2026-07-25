"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle, EmptyState } from "@/components/shared/stat-card";
import { DirectionBadge, PnlText } from "@/components/shared/badges";
import { formatShortDate } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { TradeDetailDialog } from "@/components/journal/trade-detail";

export function RecentTrades({ trades }: { trades: any[] }) {
  const { setTradeForm } = useAppStore();
  const [selected, setSelected] = useState<string | null>(null);
  const recent = trades.slice(0, 5);

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Vos 5 derniers trades">Trades récents</SectionTitle>
      <CardContent className="px-0">
        {recent.length === 0 ? (
          <EmptyState
            title="Aucun trade"
            description="Ajoutez votre premier trade pour le voir ici."
            icon={<BookOpen className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-1">
            {recent.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:border-white/5 hover:bg-white/5"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-12 font-mono text-xs text-muted-foreground">
                    {formatShortDate(t.entryDate)}
                  </span>
                  <span className="font-mono text-sm font-semibold">{t.instrument}</span>
                  <DirectionBadge direction={t.direction} />
                  {t.strategy && (
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {t.strategy.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {t.status === "open" ? "Ouvert" : ""}
                  </span>
                  <PnlText value={t.pnl} className="text-sm font-semibold" />
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      <TradeDetailDialog
        tradeId={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </Card>
  );
}
