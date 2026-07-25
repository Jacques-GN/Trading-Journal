"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatDuration } from "@/lib/format";
import { Clock } from "lucide-react";

export function AvgDurationCard({ stats }: { stats: any }) {
  const dur = stats.avgDurationMin;
  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Temps moyen en position">Durée moyenne par trade</SectionTitle>
      <CardContent className="flex items-center gap-4 px-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
          <Clock className="h-7 w-7" />
        </div>
        <div>
          <p className="font-mono text-3xl font-semibold tabular-nums">
            {formatDuration(dur)}
          </p>
          <p className="text-xs text-muted-foreground">
            {dur != null ? `${dur} minutes en moyenne` : "Pas encore de trades clôturés"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
