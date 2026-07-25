"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFetch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import {
  DirectionBadge,
  StatusBadge,
  PnlText,
  RText,
  EmotionTag,
} from "@/components/shared/badges";
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
  formatPercent,
} from "@/lib/format";
import {
  sessionLabel,
  biasLabel,
} from "@/lib/enums";
import { Trash2, Pencil, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface TradeDetail {
  id: string;
  instrument: string;
  assetClass: string;
  direction: string;
  orderType: string;
  marketSession: string | null;
  marketBias: string | null;
  timeframe: string | null;
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  positionSize: number;
  riskPercent: number | null;
  pnl: number;
  pnlPercent: number | null;
  fees: number;
  rrRatio: number | null;
  entryDate: string;
  exitDate: string | null;
  durationMin: number | null;
  entryReason: string | null;
  exitReason: string | null;
  ruleViolated: string | null;
  setupValid: boolean | null;
  rulesFollowed: boolean | null;
  biggestMistake: string | null;
  improvementNext: string | null;
  emotion: string | null;
  emotionScore: number | null;
  confidence: number | null;
  disciplineScore: number | null;
  notes: string | null;
  lessons: string | null;
  status: string;
  strategy: { id: string; name: string; color: string } | null;
  account: { id: string; name: string };
}

export function TradeDetailDialog({
  tradeId,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: {
  tradeId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: (id: string) => void;
  onDeleted?: () => void;
}) {
  const { setTradeForm } = useAppStore();
  const { data: trade } = useFetch<TradeDetail>(
    tradeId ? `/api/trades/${tradeId}` : null
  );

  if (!trade) return null;

  const handleDelete = async () => {
    if (!tradeId) return;
    if (!confirm("Supprimer ce trade ?")) return;
    try {
      await apiDelete(`/api/trades/${tradeId}`);
      toast.success("Trade supprimé");
      onOpenChange(false);
      onDeleted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-2xl overflow-y-auto border-white/10 bg-zinc-950 p-0 scroll-thin">
        <DialogHeader className="border-b border-white/5 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-3 text-base">
                <span className="font-mono text-lg">{trade.instrument}</span>
                <DirectionBadge direction={trade.direction} />
                <StatusBadge status={trade.status} />
              </DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {trade.account.name}
                {trade.strategy ? ` · ${trade.strategy.name}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                P/L
              </p>
              <PnlText value={trade.pnl} className="text-xl font-semibold" />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5">
          <DetailRow>
            <DetailItem label="Prix d'entrée" value={fmtPrice(trade.entryPrice, trade.instrument)} />
            <DetailItem label="Prix de sortie" value={trade.exitPrice != null ? fmtPrice(trade.exitPrice, trade.instrument) : "—"} />
            <DetailItem label="Stop Loss" value={trade.stopLoss != null ? fmtPrice(trade.stopLoss, trade.instrument) : "—"} />
            <DetailItem label="Take Profit" value={trade.takeProfit != null ? fmtPrice(trade.takeProfit, trade.instrument) : "—"} />
            <DetailItem label="Taille" value={String(trade.positionSize)} />
            <DetailItem label="Frais" value={formatCurrency(trade.fees)} />
            <DetailItem label="R/R" value={<RText value={trade.rrRatio} />} />
            <DetailItem label="Durée" value={formatDuration(trade.durationMin)} />
          </DetailRow>

          <Separator className="bg-white/5" />

          {/* Contexte marché (Task 2) */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
              Contexte marché
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <DetailItem label="Session" value={<Badge variant="outline" className="border-white/10 bg-white/5 text-[10px]">{sessionLabel(trade.marketSession)}</Badge>} />
              <DetailItem label="Biais marché" value={<Badge variant="outline" className={cn("border text-[10px]", biasBadgeClass(trade.marketBias))}>{biasLabel(trade.marketBias)}</Badge>} />
              <DetailItem label="Timeframe" value={<span className="font-mono text-sm">{trade.timeframe ?? "—"}</span>} />
              <DetailItem label="Risque / trade" value={trade.riskPercent != null ? <span className={cn("font-mono text-sm", trade.riskPercent > 2 ? "text-rose-500" : "text-emerald-500")}>{formatPercent(trade.riskPercent)}</span> : "—"} />
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Discipline (Task 2) */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
              Discipline
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DisciplineFlag
                label="Setup valide avant entrée"
                value={trade.setupValid}
              />
              <DisciplineFlag
                label="Règles suivies"
                value={trade.rulesFollowed}
              />
            </div>
          </div>

          <DetailRow>
            <DetailItem label="Date d'entrée" value={formatDateTime(trade.entryDate)} />
            <DetailItem label="Date de sortie" value={trade.exitDate ? formatDateTime(trade.exitDate) : "—"} />
            <DetailItem label="Raison d'entrée" value={trade.entryReason ?? "—"} />
            <DetailItem label="Raison de sortie" value={trade.exitReason ?? "—"} />
          </DetailRow>

          {trade.ruleViolated && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500">
                Règle violée
              </p>
              <p className="mt-1 text-sm">{trade.ruleViolated}</p>
            </div>
          )}

          {trade.pnlPercent != null && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <DetailItem label="P/L %" value={<span className={cn("font-mono text-sm", trade.pnlPercent > 0 ? "text-emerald-500" : "text-rose-500")}>{formatPercent(trade.pnlPercent, { sign: true })}</span>} />
            </div>
          )}

          <Separator className="bg-white/5" />

          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
              Psychologie
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <DetailItem label="Émotion" value={<EmotionTag emotion={trade.emotion} />} />
              <DetailItem label="Intensité" value={`${trade.emotionScore ?? "—"}/10`} mono />
              <DetailItem label="Confiance" value={`${trade.confidence ?? "—"}/10`} mono />
              <DetailItem label="Discipline" value={`${trade.disciplineScore ?? "—"}/10`} mono />
            </div>
          </div>

          {trade.biggestMistake && (
            <div className="rounded-md border border-rose-500/20 bg-rose-500/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-500">
                Plus grosse erreur
              </p>
              <p className="mt-1 text-sm">{trade.biggestMistake}</p>
            </div>
          )}

          {trade.improvementNext && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
                Amélioration pour le prochain trade
              </p>
              <p className="mt-1 text-sm">{trade.improvementNext}</p>
            </div>
          )}

          {trade.notes && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Notes
              </p>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">
                {trade.notes}
              </p>
            </div>
          )}

          {trade.lessons && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Leçons apprises
              </p>
              <p className="whitespace-pre-wrap text-sm italic text-foreground/90">
                {trade.lessons}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-white/5 bg-zinc-950/95 px-5 py-3 backdrop-blur">
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              if (tradeId) {
                onEdit?.(tradeId);
                setTradeForm(true, tradeId);
              }
            }}
            className="border-white/10"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function fmtPrice(p: number, instrument: string): string {
  if (instrument.includes("JPY")) return p.toFixed(3);
  if (instrument.startsWith("BTC") || instrument.startsWith("ETH")) return p.toFixed(2);
  if (instrument.includes("USD") && instrument.length === 6) return p.toFixed(5);
  return p.toFixed(2);
}

function biasBadgeClass(bias: string | null): string {
  if (bias === "bullish") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (bias === "bearish") return "border-rose-500/30 bg-rose-500/10 text-rose-500";
  return "border-white/10 bg-white/5 text-muted-foreground";
}

function DisciplineFlag({
  label,
  value,
}: {
  label: string;
  value: boolean | null;
}) {
  const isTrue = value === true;
  const isFalse = value === false;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border p-3",
        isTrue
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isFalse
          ? "border-rose-500/30 bg-rose-500/5"
          : "border-white/10 bg-white/5"
      )}
    >
      {isTrue ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : isFalse ? (
        <XCircle className="h-5 w-5 text-rose-500" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-xs",
            isTrue ? "text-emerald-500" : isFalse ? "text-rose-500" : "text-muted-foreground"
          )}
        >
          {isTrue ? "Oui" : isFalse ? "Non" : "Non renseigné"}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>;
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
