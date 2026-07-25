"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";

export function CalendarHeatmap({ trades }: { trades: any[] }) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group trades by day
  const dayPnl = new Map<string, number>();
  for (const t of trades) {
    if (t.status !== "closed") continue;
    const d = format(new Date(t.entryDate), "yyyy-MM-dd");
    dayPnl.set(d, (dayPnl.get(d) ?? 0) + t.pnl);
  }

  // Pad start to start of week (Mon=1)
  const startPad = (monthStart.getDay() + 6) % 7;
  const cells: Array<Date | null> = [
    ...Array(startPad).fill(null),
    ...days,
  ];

  const monthPnl = days.reduce((s, d) => s + (dayPnl.get(format(d, "yyyy-MM-dd")) ?? 0), 0);
  const tradeDays = days.filter((d) => dayPnl.has(format(d, "yyyy-MM-dd"))).length;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle
        sub={`${format(now, "MMMM yyyy")} · ${tradeDays} jours actifs`}
        right={
          <span className={`font-mono text-sm font-semibold ${monthPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {formatCurrency(monthPnl, { sign: true })}
          </span>
        }
      >
        Calendrier mensuel
      </SectionTitle>
      <CardContent className="px-0">
        <div className="grid grid-cols-7 gap-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="text-center text-[10px] uppercase text-muted-foreground">
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const pnl = dayPnl.get(format(d, "yyyy-MM-dd"));
            const isToday = isSameDay(d, now);
            let bg = "bg-white/[0.02] text-muted-foreground/40";
            if (pnl != null) {
              bg = pnl > 0 ? "bg-emerald-500/30 text-emerald-100" : pnl < 0 ? "bg-rose-500/30 text-rose-100" : "bg-white/10 text-foreground";
            }
            return (
              <div
                key={i}
                title={pnl != null ? `${format(d, "dd MMM")}: ${formatCurrency(pnl, { sign: true })}` : format(d, "dd MMM")}
                className={`relative aspect-square rounded-sm ${bg} ${isToday ? "ring-1 ring-emerald-500" : ""} flex items-center justify-center text-[10px] font-mono`}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
