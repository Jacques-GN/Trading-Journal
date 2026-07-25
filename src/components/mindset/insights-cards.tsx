"use client";

import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingDown, TrendingUp, Brain } from "lucide-react";
import { useMemo } from "react";
import { formatCurrency, formatPercent } from "@/lib/format";

export function InsightsCards({ trades }: { trades: any[] }) {
  const insights = useMemo(() => {
    const result: Array<{ tone: "emerald" | "rose" | "amber"; title: string; text: string }> = [];

    if (trades.length < 5) return result;

    // FOMO trades have lower win rate
    const fomo = trades.filter((t) => t.emotion === "FOMO" && t.status === "closed");
    const nonFomo = trades.filter((t) => t.emotion !== "FOMO" && t.status === "closed");
    if (fomo.length >= 3 && nonFomo.length >= 3) {
      const fomoWr = (fomo.filter((t) => t.pnl > 0).length / fomo.length) * 100;
      const otherWr = (nonFomo.filter((t) => t.pnl > 0).length / nonFomo.length) * 100;
      if (fomoWr < otherWr - 10) {
        result.push({
          tone: "rose",
          title: "FOMO coûteux",
          text: `Les trades FOMO ont ${formatPercent(fomoWr)} de réussite vs ${formatPercent(otherWr)} sur les autres émotions. Évitez-les.`,
        });
      }
    }

    // Rule violations
    const violated = trades.filter((t) => t.ruleViolated && t.ruleViolated.trim() && t.status === "closed");
    const nonViolated = trades.filter((t) => !t.ruleViolated && t.status === "closed");
    if (violated.length >= 3 && nonViolated.length >= 3) {
      const violatedPnl = violated.reduce((s, t) => s + t.pnl, 0);
      const nonViolatedPnl = nonViolated.reduce((s, t) => s + t.pnl, 0);
      if (violatedPnl < nonViolatedPnl) {
        result.push({
          tone: "amber",
          title: "Coût des violations",
          text: `Trades avec règle violée: ${formatCurrency(violatedPnl, { sign: true })}. Sans violation: ${formatCurrency(nonViolatedPnl, { sign: true })}.`,
        });
      }
    }

    // Exit too early
    const tooEarly = trades.filter((t) => t.exitReason === "trop tôt" && t.status === "closed");
    if (tooEarly.length >= 3) {
      const wr = (tooEarly.filter((t) => t.pnl > 0).length / tooEarly.length) * 100;
      result.push({
        tone: "amber",
        title: "Sorties trop tôt",
        text: `${tooEarly.length} trades fermés "trop tôt", dont ${formatPercent(wr)} étaient gagnants. Laissez courir vos gains.`,
      });
    }

    // Plan trades
    const plan = trades.filter((t) => t.entryReason === "selon le plan" && t.status === "closed");
    if (plan.length >= 5) {
      const wr = (plan.filter((t) => t.pnl > 0).length / plan.length) * 100;
      const pnl = plan.reduce((s, t) => s + t.pnl, 0);
      result.push({
        tone: pnl >= 0 ? "emerald" : "rose",
        title: "Discipline = résultat",
        text: `${plan.length} trades "selon le plan" → ${formatPercent(wr)} WR · ${formatCurrency(pnl, { sign: true })}.`,
      });
    }

    return result.slice(0, 4);
  }, [trades]);

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {insights.map((ins, i) => (
        <InsightCard key={i} {...ins} />
      ))}
    </div>
  );
}

function InsightCard({
  tone,
  title,
  text,
}: {
  tone: "emerald" | "rose" | "amber";
  title: string;
  text: string;
}) {
  const map = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-500",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-500",
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-500",
  };
  return (
    <Card className={`border p-4 ${map[tone]}`}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-widest">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-foreground/90">{text}</p>
    </Card>
  );
}
