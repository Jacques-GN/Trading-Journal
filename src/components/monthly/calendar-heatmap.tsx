"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { formatCurrency } from "@/lib/format";

export function CalendarHeatmap({
  trades,
  month,
}: {
  trades: any[];
  month: Date;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayPnl = new Map<string, number>();
  for (const t of trades) {
    if (t.status !== "closed") continue;
    const d = format(new Date(t.entryDate), "yyyy-MM-dd");
    dayPnl.set(d, (dayPnl.get(d) ?? 0) + t.pnl);
  }

  const startPad = (monthStart.getDay() + 6) % 7;
  const cells: Array<Date | null> = [...Array(startPad).fill(null), ...days];

  const monthPnl = days.reduce((s, d) => s + (dayPnl.get(format(d, "yyyy-MM-dd")) ?? 0), 0);
  const tradeDays = days.filter((d) => dayPnl.has(format(d, "yyyy-MM-dd"))).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{tradeDays} jours actifs</span>
        <span className={`font-mono font-semibold ${monthPnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
          {formatCurrency(monthPnl, { sign: true })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[10px] uppercase text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const pnl = dayPnl.get(format(d, "yyyy-MM-dd"));
          let bg = "bg-white/[0.02] text-muted-foreground/40";
          if (pnl != null) {
            bg = pnl > 0 ? "bg-emerald-500/30 text-emerald-100" : pnl < 0 ? "bg-rose-500/30 text-rose-100" : "bg-white/10 text-foreground";
          }
          return (
            <div
              key={i}
              title={pnl != null ? `${format(d, "dd MMM")}: ${formatCurrency(pnl, { sign: true })}` : format(d, "dd MMM")}
              className={`relative aspect-square rounded-sm ${bg} flex flex-col items-center justify-center text-[10px] font-mono`}
            >
              <span>{d.getDate()}</span>
              {pnl != null && (
                <span className="text-[8px] opacity-80">
                  {pnl >= 0 ? "+" : ""}
                  {(pnl / 1000).toFixed(1)}k
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
