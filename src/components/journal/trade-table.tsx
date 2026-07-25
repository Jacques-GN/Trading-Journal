"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectionBadge, PnlText, RText, StatusBadge } from "@/components/shared/badges";
import { formatShortDate } from "@/lib/format";
import { colorOf, sessionAbbr } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";

export function TradeTable({
  trades,
  onSelect,
}: {
  trades: any[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <ScrollArea className="h-[calc(100vh-260px)] min-h-[300px] scroll-thin">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-10 text-[10px] uppercase tracking-widest text-muted-foreground">#</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Instrument</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Sens</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Stratégie</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Sess.</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Discipline</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">Entrée</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">Sortie</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">R/R</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">P/L</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((t, i) => {
                const c = t.strategy ? colorOf(t.strategy.color) : null;
                const disc = disciplineDot(t.setupValid, t.rulesFollowed);
                return (
                  <TableRow
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className="cursor-pointer border-white/5 hover:bg-white/[0.03]"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{trades.length - i}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatShortDate(t.entryDate)}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold">{t.instrument}</TableCell>
                    <TableCell><DirectionBadge direction={t.direction} /></TableCell>
                    <TableCell>
                      {t.strategy ? (
                        <span className={cn("inline-flex items-center gap-1.5 text-xs", c?.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", c?.dot)} />
                          {t.strategy.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                        {sessionAbbr(t.marketSession)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full",
                          disc.bg,
                          disc.text
                        )}
                        title={disc.title}
                      >
                        {disc.icon === "check" ? (
                          <Check className="h-3 w-3" />
                        ) : disc.icon === "x" ? (
                          <X className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{fmtPrice(t.entryPrice, t.instrument)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {t.exitPrice != null ? fmtPrice(t.exitPrice, t.instrument) : "—"}
                    </TableCell>
                    <TableCell className="text-right"><RText value={t.rrRatio} /></TableCell>
                    <TableCell className="text-right"><PnlText value={t.pnl} className="text-sm font-semibold" /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {trades.map((t) => {
          const c = t.strategy ? colorOf(t.strategy.color) : null;
          const disc = disciplineDot(t.setupValid, t.rulesFollowed);
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="flex w-full items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.02] p-3 text-left active:bg-white/5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{t.instrument}</span>
                  <DirectionBadge direction={t.direction} />
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full",
                      disc.bg,
                      disc.text
                    )}
                  >
                    {disc.icon === "check" ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : disc.icon === "x" ? (
                      <X className="h-2.5 w-2.5" />
                    ) : (
                      <Minus className="h-2.5 w-2.5" />
                    )}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{formatShortDate(t.entryDate)}</span>
                  <span className="font-mono">{sessionAbbr(t.marketSession)}</span>
                  {t.strategy && (
                    <span className={cn("inline-flex items-center gap-1", c?.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", c?.dot)} />
                      {t.strategy.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <PnlText value={t.pnl} className="text-sm font-semibold" />
                {t.status === "open" && (
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-amber-500">Ouvert</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function disciplineDot(
  setupValid: boolean | null | undefined,
  rulesFollowed: boolean | null | undefined
): { icon: "check" | "x" | "minus"; bg: string; text: string; title: string } {
  const s = setupValid === true;
  const r = rulesFollowed === true;
  if (s && r) {
    return {
      icon: "check",
      bg: "bg-emerald-500/15",
      text: "text-emerald-500",
      title: "Setup valide · Règles suivies",
    };
  }
  if (s === false && r === false) {
    return {
      icon: "x",
      bg: "bg-rose-500/15",
      text: "text-rose-500",
      title: "Setup invalide · Règles non suivies",
    };
  }
  if (setupValid == null && rulesFollowed == null) {
    return {
      icon: "minus",
      bg: "bg-white/5",
      text: "text-muted-foreground",
      title: "Discipline non renseignée",
    };
  }
  return {
    icon: "x",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    title: "Discipline partielle",
  };
}

function fmtPrice(p: number, instrument: string): string {
  if (instrument.includes("JPY")) return p.toFixed(3);
  if (instrument.startsWith("BTC") || instrument.startsWith("ETH")) return p.toFixed(2);
  if (instrument.includes("USD") && instrument.length === 6) return p.toFixed(5);
  return p.toFixed(2);
}
