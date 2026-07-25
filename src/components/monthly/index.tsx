"use client";

import { useAppStore } from "@/lib/store";
import { useFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle, EmptyState } from "@/components/shared/stat-card";
import { CalendarHeatmap as MonthHeatmap } from "./calendar-heatmap";
import { formatCurrency, formatPercent, monthLabel } from "@/lib/format";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  CalendarRange,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  subMonths,
  addMonths,
} from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export function MonthlyView() {
  const { currentAccountId, refreshVersion } = useAppStore();
  const { data: trades } = useFetch<any[]>(
    currentAccountId ? `/api/trades?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );
  const [current, setCurrent] = useState(new Date());

  // Build list of months that have trades (last 12)
  const monthsWithData = useMemo(() => {
    if (!trades) return [];
    const map = new Map<string, { date: Date; trades: any[] }>();
    for (const t of trades) {
      const d = new Date(t.entryDate);
      const key = format(d, "yyyy-MM");
      if (!map.has(key)) map.set(key, { date: startOfMonth(d), trades: [] });
      map.get(key)!.trades.push(t);
    }
    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [trades]);

  const monthTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter((t) => {
      const d = new Date(t.entryDate);
      return isSameMonth(d, current);
    });
  }, [trades, current]);

  const closed = monthTrades.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => t.pnl > 0);
  const losses = closed.filter((t) => t.pnl < 0);
  const netPnl = closed.reduce((s, t) => s + t.pnl, 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const best = closed.length ? Math.max(...closed.map((t) => t.pnl)) : 0;
  const worst = closed.length ? Math.min(...closed.map((t) => t.pnl)) : 0;

  // Top instruments
  const byInstr = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of closed) m.set(t.instrument, (m.get(t.instrument) ?? 0) + t.pnl);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [closed]);

  // Discipline avg
  const discScores = closed.map((t) => t.disciplineScore).filter(Boolean) as number[];
  const avgDisc = discScores.length ? discScores.reduce((s, v) => s + v, 0) / discScores.length : 0;

  // Emotion breakdown
  const byEmotion = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of closed) {
      if (t.emotion) m.set(t.emotion, (m.get(t.emotion) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [closed]);

  const exportJson = () => {
    const data = {
      month: format(current, "yyyy-MM"),
      trades: monthTrades,
      stats: { netPnl, winRate, best, worst, trades: closed.length },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${format(current, "yyyy-MM")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export JSON généré");
  };

  const exportCsv = () => {
    const rows = [
      ["Date", "Instrument", "Direction", "Stratégie", "Entrée", "Sortie", "P/L", "R/R", "Émotion", "Discipline"],
      ...monthTrades.map((t) => [
        format(new Date(t.entryDate), "yyyy-MM-dd HH:mm"),
        t.instrument,
        t.direction,
        t.strategy?.name ?? "",
        t.entryPrice,
        t.exitPrice ?? "",
        t.pnl.toFixed(2),
        t.rrRatio?.toFixed(2) ?? "",
        t.emotion ?? "",
        t.disciplineScore ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${format(current, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV généré");
  };

  if (!currentAccountId) {
    return (
      <EmptyState
        title="Aucun compte sélectionné"
        icon={<CalendarRange className="h-5 w-5" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <Card className="border-white/5 bg-zinc-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrent(subMonths(current, 1))} className="h-9 w-9 border-white/10">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[160px] text-center text-base font-semibold capitalize">
              {monthLabel(current)}
            </h2>
            <Button variant="outline" size="icon" onClick={() => setCurrent(addMonths(current, 1))} className="h-9 w-9 border-white/10">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrent(new Date())} className="text-xs">
              Aujourd'hui
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} className="border-white/10 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson} className="border-white/10 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="border-white/10 text-xs">
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Month stat grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Trades" value={String(closed.length)} />
        <StatBox label="P/L net" value={formatCurrency(netPnl, { sign: true })} tone={netPnl >= 0 ? "emerald" : "rose"} />
        <StatBox label="Win rate" value={formatPercent(winRate)} tone={winRate >= 50 ? "emerald" : "rose"} />
        <StatBox label="Discipline moy." value={`${avgDisc.toFixed(1)}/10`} />
        <StatBox label="Meilleur" value={formatCurrency(best, { sign: true })} tone="emerald" />
        <StatBox label="Pire" value={formatCurrency(worst, { sign: true })} tone="rose" />
        <StatBox label="Gagnants" value={String(wins.length)} tone="emerald" />
        <StatBox label="Perdants" value={String(losses.length)} tone="rose" />
      </div>

      {/* All months grid */}
      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle sub="Aperçu mensuel · cliquez pour sélectionner">Tous les mois</SectionTitle>
        <CardContent className="grid grid-cols-2 gap-2 px-0 sm:grid-cols-3 lg:grid-cols-6">
          {monthsWithData.length === 0 && (
            <p className="col-span-full text-xs text-muted-foreground">Aucun trade pour le moment.</p>
          )}
          {monthsWithData.map((m) => {
            const closed = m.trades.filter((t) => t.status === "closed");
            const wins = closed.filter((t) => t.pnl > 0).length;
            const wr = closed.length ? (wins / closed.length) * 100 : 0;
            const pnl = closed.reduce((s, t) => s + t.pnl, 0);
            const best = closed.length ? Math.max(...closed.map((t) => t.pnl)) : 0;
            const worst = closed.length ? Math.min(...closed.map((t) => t.pnl)) : 0;
            const active = isSameMonth(m.date, current);
            return (
              <button
                key={format(m.date, "yyyy-MM")}
                onClick={() => setCurrent(m.date)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  active
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                }`}
              >
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {format(m.date, "MMM yyyy")}
                </p>
                <p className={`mt-1 font-mono text-base font-semibold ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(pnl, { sign: true })}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{closed.length} trades</span>
                  <span>·</span>
                  <span>{wr.toFixed(0)}%</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className="text-emerald-500">+{formatCurrency(best, { decimals: 0 })}</span>
                  <span className="text-rose-500">{formatCurrency(worst, { decimals: 0 })}</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
            <SectionTitle sub="P/L quotidien pour le mois sélectionné">Calendrier quotidien</SectionTitle>
            <CardContent className="px-0">
              <MonthHeatmap trades={monthTrades} month={current} />
            </CardContent>
          </Card>
        </div>
        <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
          <SectionTitle sub="Top instruments du mois">Top instruments</SectionTitle>
          <CardContent className="space-y-2 px-0">
            {byInstr.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucun trade ce mois.</p>
            )}
            {byInstr.map(([inst, pnl]) => (
              <div key={inst} className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] p-2.5">
                <span className="font-mono text-sm">{inst}</span>
                <span className={`font-mono text-sm font-semibold ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(pnl, { sign: true })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle sub="Répartition émotionnelle du mois">Émotions</SectionTitle>
        <CardContent className="px-0">
          {byEmotion.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune émotion enregistrée.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {byEmotion.map(([emo, count]) => (
                <div key={emo} className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{emo}</p>
                  <p className="font-mono text-sm font-semibold">{count}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "emerald" | "rose";
}) {
  const map = {
    default: "text-foreground",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
  };
  return (
    <Card className="border-white/5 bg-zinc-900/60 p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-base font-semibold tabular-nums ${map[tone]}`}>
        {value}
      </p>
    </Card>
  );
}
