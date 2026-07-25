"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/format";

export function PeriodPerformance({ stats }: { stats: any }) {
  const rows = (stats.byPeriod ?? []).map((p: any) => ({
    label: p.label,
    trades: p.trades,
    winRate: p.winRate,
    pnl: p.pnl,
  }));

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle sub="Comparaison par période">Performance par période</SectionTitle>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Période</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">Trades</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">Win rate</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.label} className="border-white/5">
                <TableCell className="text-sm">{r.label}</TableCell>
                <TableCell className="text-right font-mono text-sm">{r.trades}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {r.trades > 0 ? formatPercent(r.winRate) : "—"}
                </TableCell>
                <TableCell className={`text-right font-mono text-sm font-semibold ${r.pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(r.pnl, { sign: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
