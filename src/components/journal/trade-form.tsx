"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { useFetch, apiPost, apiPut } from "@/lib/api";
import {
  ASSET_CLASSES,
  DIRECTIONS,
  ORDER_TYPES,
  ENTRY_REASONS,
  EXIT_REASONS,
  EMOTIONS,
  TRADE_STATUS,
  STRATEGY_COLORS,
  MARKET_SESSIONS,
  MARKET_BIAS,
  TIMEFRAMES,
  BIGGEST_MISTAKES,
  IMPROVEMENT_NEXT,
} from "@/lib/enums";
import { toLocalInputValue } from "@/lib/format";
import { computePnl, computeRR } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { Loader2, Save, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Strategy {
  id: string;
  name: string;
  color: string;
}

interface FormState {
  accountId: string;
  strategyId: string;
  instrument: string;
  assetClass: string;
  direction: string;
  orderType: string;
  marketSession: string;
  marketBias: string;
  timeframe: string;
  entryPrice: string;
  exitPrice: string;
  stopLoss: string;
  takeProfit: string;
  positionSize: string;
  riskPercent: string;
  fees: string;
  entryDate: string;
  exitDate: string;
  entryReason: string;
  exitReason: string;
  ruleViolated: string;
  setupValid: boolean;
  rulesFollowed: boolean;
  biggestMistake: string;
  improvementNext: string;
  emotion: string;
  emotionScore: number;
  confidence: number;
  disciplineScore: number;
  notes: string;
  lessons: string;
  status: string;
}

const emptyForm: FormState = {
  accountId: "",
  strategyId: "none",
  instrument: "",
  assetClass: "forex",
  direction: "long",
  orderType: "market",
  marketSession: "london",
  marketBias: "neutral",
  timeframe: "H1",
  entryPrice: "",
  exitPrice: "",
  stopLoss: "",
  takeProfit: "",
  positionSize: "1",
  riskPercent: "1",
  fees: "0",
  entryDate: toLocalInputValue(new Date()),
  exitDate: toLocalInputValue(new Date()),
  entryReason: "selon le plan",
  exitReason: "selon le plan",
  ruleViolated: "",
  setupValid: true,
  rulesFollowed: true,
  biggestMistake: "",
  improvementNext: "",
  emotion: "calme",
  emotionScore: 5,
  confidence: 5,
  disciplineScore: 5,
  notes: "",
  lessons: "",
  status: "closed",
};

export function TradeFormDialog({
  open,
  onOpenChange,
  tradeId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tradeId?: string | null;
  onSaved?: () => void;
}) {
  const { currentAccountId, accounts } = useAppStore();
  const { data: strategies } = useFetch<Strategy[]>("/api/strategies");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [newStratOpen, setNewStratOpen] = useState(false);
  const [newStrat, setNewStrat] = useState({ name: "", color: "emerald" });

  const editing = !!tradeId;
  const { data: editTrade } = useFetch<any>(
    tradeId ? `/api/trades/${tradeId}` : null
  );

  useEffect(() => {
    if (open && !editing) {
      setForm({
        ...emptyForm,
        accountId: currentAccountId ?? accounts[0]?.id ?? "",
      });
    }
  }, [open, editing, currentAccountId, accounts]);

  useEffect(() => {
    if (open && editing && editTrade) {
      setForm({
        accountId: editTrade.accountId,
        strategyId: editTrade.strategyId ?? "none",
        instrument: editTrade.instrument,
        assetClass: editTrade.assetClass,
        direction: editTrade.direction,
        orderType: editTrade.orderType,
        marketSession: editTrade.marketSession ?? "london",
        marketBias: editTrade.marketBias ?? "neutral",
        timeframe: editTrade.timeframe ?? "H1",
        entryPrice: String(editTrade.entryPrice),
        exitPrice: editTrade.exitPrice != null ? String(editTrade.exitPrice) : "",
        stopLoss: editTrade.stopLoss != null ? String(editTrade.stopLoss) : "",
        takeProfit:
          editTrade.takeProfit != null ? String(editTrade.takeProfit) : "",
        positionSize: String(editTrade.positionSize),
        riskPercent:
          editTrade.riskPercent != null ? String(editTrade.riskPercent) : "1",
        fees: String(editTrade.fees),
        entryDate: toLocalInputValue(new Date(editTrade.entryDate)),
        exitDate: editTrade.exitDate
          ? toLocalInputValue(new Date(editTrade.exitDate))
          : toLocalInputValue(new Date()),
        entryReason: editTrade.entryReason ?? "selon le plan",
        exitReason: editTrade.exitReason ?? "selon le plan",
        ruleViolated: editTrade.ruleViolated ?? "",
        setupValid: editTrade.setupValid ?? true,
        rulesFollowed: editTrade.rulesFollowed ?? true,
        biggestMistake: editTrade.biggestMistake ?? "",
        improvementNext: editTrade.improvementNext ?? "",
        emotion: editTrade.emotion ?? "calme",
        emotionScore: editTrade.emotionScore ?? 5,
        confidence: editTrade.confidence ?? 5,
        disciplineScore: editTrade.disciplineScore ?? 5,
        notes: editTrade.notes ?? "",
        lessons: editTrade.lessons ?? "",
        status: editTrade.status,
      });
    }
  }, [open, editing, editTrade]);

  // Live preview of computed P/L and R/R
  const previewPnl = (() => {
    if (form.status !== "closed") return null;
    const ep = parseFloat(form.entryPrice);
    const xp = parseFloat(form.exitPrice);
    const ps = parseFloat(form.positionSize);
    const f = parseFloat(form.fees);
    if (isNaN(ep) || isNaN(xp) || isNaN(ps) || isNaN(f)) return null;
    return computePnl({
      direction: form.direction,
      entryPrice: ep,
      exitPrice: xp,
      positionSize: ps,
      fees: f,
    });
  })();

  const previewRR = (() => {
    const ep = parseFloat(form.entryPrice);
    const sl = parseFloat(form.stopLoss);
    const tp = parseFloat(form.takeProfit);
    if (isNaN(ep) || isNaN(sl) || isNaN(tp)) return null;
    return computeRR({
      entryPrice: ep,
      stopLoss: sl,
      takeProfit: tp,
      direction: form.direction,
    });
  })();

  const handleSave = async () => {
    if (!form.accountId) {
      toast.error("Sélectionnez un compte");
      return;
    }
    if (!form.instrument.trim()) {
      toast.error("Instrument requis");
      return;
    }
    if (!form.entryPrice) {
      toast.error("Prix d'entrée requis");
      return;
    }
    setSaving(true);
    const payload = {
      accountId: form.accountId,
      strategyId: form.strategyId === "none" ? null : form.strategyId,
      instrument: form.instrument.toUpperCase().trim(),
      assetClass: form.assetClass,
      direction: form.direction,
      orderType: form.orderType,
      marketSession: form.marketSession,
      marketBias: form.marketBias,
      timeframe: form.timeframe,
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
      takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
      positionSize: parseFloat(form.positionSize) || 1,
      riskPercent: parseFloat(form.riskPercent) || null,
      fees: parseFloat(form.fees) || 0,
      entryDate: new Date(form.entryDate).toISOString(),
      exitDate:
        form.status === "closed" && form.exitDate
          ? new Date(form.exitDate).toISOString()
          : null,
      entryReason: form.entryReason,
      exitReason: form.status === "closed" ? form.exitReason : null,
      ruleViolated: form.ruleViolated || null,
      setupValid: form.setupValid,
      rulesFollowed: form.rulesFollowed,
      biggestMistake: form.biggestMistake || null,
      improvementNext: form.improvementNext || null,
      emotion: form.emotion,
      emotionScore: form.emotionScore,
      confidence: form.confidence,
      disciplineScore: form.disciplineScore,
      notes: form.notes || null,
      lessons: form.lessons || null,
      status: form.status,
    };
    try {
      if (editing && tradeId) {
        await apiPut(`/api/trades/${tradeId}`, payload);
        toast.success("Trade mis à jour");
      } else {
        await apiPost("/api/trades", payload);
        toast.success("Trade ajouté");
      }
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const addStrategy = async () => {
    if (!newStrat.name.trim()) return;
    try {
      const s = await apiPost<Strategy>("/api/strategies", {
        name: newStrat.name,
        color: newStrat.color,
      });
      setForm((f) => ({ ...f, strategyId: s.id }));
      setNewStratOpen(false);
      setNewStrat({ name: "", color: "emerald" });
      toast.success("Stratégie ajoutée");
    } catch {
      toast.error("Échec");
    }
  };

  const update = (k: keyof FormState, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-3xl overflow-y-auto border-white/10 bg-zinc-950 p-0 scroll-thin">
        <DialogHeader className="border-b border-white/5 px-5 py-4">
          <DialogTitle className="text-base uppercase tracking-widest">
            {editing ? "Modifier le trade" : "Nouveau trade"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Documentez chaque trade avec rigueur — la discipline construit la performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-5 py-5">
          {/* Trade Setup */}
          <Section label="Configuration du trade">
            <Grid>
              <Field label="Compte *">
                <Select value={form.accountId} onValueChange={(v) => update("accountId", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Instrument *">
                <Input
                  value={form.instrument}
                  onChange={(e) => update("instrument", e.target.value)}
                  placeholder="EURUSD, AAPL, BTCUSD…"
                  className="border-white/10 bg-white/5 font-mono uppercase"
                />
              </Field>
              <Field label="Classe d'actif">
                <Select value={form.assetClass} onValueChange={(v) => update("assetClass", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {ASSET_CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Direction">
                <Select value={form.direction} onValueChange={(v) => update("direction", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === "long" ? "Long (achat)" : "Short (vente)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Type d'ordre">
                <Select value={form.orderType} onValueChange={(v) => update("orderType", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {ORDER_TYPES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Stratégie">
                <div className="flex gap-2">
                  <Select value={form.strategyId} onValueChange={(v) => update("strategyId", v)}>
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-zinc-900">
                      <SelectItem value="none">Aucune</SelectItem>
                      {strategies?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setNewStratOpen((v) => !v)}
                    className="border-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            </Grid>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Session marché">
                <Select value={form.marketSession} onValueChange={(v) => update("marketSession", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {MARKET_SESSIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Biais de marché">
                <Select value={form.marketBias} onValueChange={(v) => update("marketBias", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {MARKET_BIAS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Timeframe">
                <Select value={form.timeframe} onValueChange={(v) => update("timeframe", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {TIMEFRAMES.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {newStratOpen && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-3">
                <Input
                  value={newStrat.name}
                  onChange={(e) => setNewStrat((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Nom de la stratégie"
                  className="border-white/10 bg-zinc-900"
                />
                <Select
                  value={newStrat.color}
                  onValueChange={(v) => setNewStrat((s) => ({ ...s, color: v }))}
                >
                  <SelectTrigger className="w-28 border-white/10 bg-zinc-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {STRATEGY_COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" onClick={addStrategy} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
                  OK
                </Button>
              </div>
            )}
          </Section>

          {/* Prices */}
          <Section label="Prix & tailles">
            <Grid>
              <Field label="Prix d'entrée *">
                <Input type="number" step="any" value={form.entryPrice} onChange={(e) => update("entryPrice", e.target.value)} className="border-white/10 bg-white/5 font-mono" />
              </Field>
              <Field label="Prix de sortie">
                <Input type="number" step="any" value={form.exitPrice} onChange={(e) => update("exitPrice", e.target.value)} disabled={form.status === "open"} className="border-white/10 bg-white/5 font-mono disabled:opacity-40" />
              </Field>
              <Field label="Stop Loss">
                <Input type="number" step="any" value={form.stopLoss} onChange={(e) => update("stopLoss", e.target.value)} className="border-white/10 bg-white/5 font-mono" />
              </Field>
              <Field label="Take Profit">
                <Input type="number" step="any" value={form.takeProfit} onChange={(e) => update("takeProfit", e.target.value)} className="border-white/10 bg-white/5 font-mono" />
              </Field>
              <Field label="Taille (lots/actions)">
                <Input type="number" step="any" value={form.positionSize} onChange={(e) => update("positionSize", e.target.value)} className="border-white/10 bg-white/5 font-mono" />
              </Field>
              <Field label="Frais">
                <Input type="number" step="any" value={form.fees} onChange={(e) => update("fees", e.target.value)} className="border-white/10 bg-white/5 font-mono" />
              </Field>
            </Grid>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Risque par trade (%)">
                <Input type="number" step="0.1" min="0" value={form.riskPercent} onChange={(e) => update("riskPercent", e.target.value)} placeholder="1.0" className="border-white/10 bg-white/5 font-mono" />
              </Field>
            </div>
            {(previewPnl != null || previewRR != null) && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-white/5 bg-white/5 p-3 text-sm">
                {previewPnl != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">P/L calculé</span>
                    <span className={cn("font-mono font-semibold", previewPnl > 0 ? "text-emerald-500" : previewPnl < 0 ? "text-rose-500" : "text-muted-foreground")}>
                      {formatCurrency(previewPnl, { sign: true })}
                    </span>
                  </div>
                )}
                {previewRR != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">R/R</span>
                    <span className="font-mono font-semibold text-foreground">
                      {previewRR.toFixed(2)}:1
                    </span>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Timing */}
          <Section label="Timing">
            <Grid>
              <Field label="Date d'entrée">
                <Input type="datetime-local" value={form.entryDate} onChange={(e) => update("entryDate", e.target.value)} className="border-white/10 bg-white/5 font-mono" />
              </Field>
              <Field label="Date de sortie">
                <Input type="datetime-local" value={form.exitDate} onChange={(e) => update("exitDate", e.target.value)} disabled={form.status === "open"} className="border-white/10 bg-white/5 font-mono disabled:opacity-40" />
              </Field>
              <Field label="Statut">
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {TRADE_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === "open" ? "Ouvert" : "Clôturé"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Grid>
          </Section>

          {/* Discipline */}
          <Section label="Discipline">
            <Grid>
              <Field label="Raison d'entrée">
                <Select value={form.entryReason} onValueChange={(v) => update("entryReason", v)}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {ENTRY_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Raison de sortie">
                <Select value={form.exitReason} onValueChange={(v) => update("exitReason", v)} disabled={form.status === "open"}>
                  <SelectTrigger className="border-white/10 bg-white/5 disabled:opacity-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-900">
                    {EXIT_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Règle violée">
                <Input value={form.ruleViolated} onChange={(e) => update("ruleViolated", e.target.value)} placeholder="Ex: Pas de FOMO, Max 3 trades par jour…" className="border-white/10 bg-white/5" />
              </Field>
            </Grid>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <SwitchField
                label="Setup valide avant entrée"
                hint="Le setup était-il confirmé avant l'entrée ?"
                checked={form.setupValid}
                onChange={(v) => update("setupValid", v)}
              />
              <SwitchField
                label="Règles suivies"
                hint="Ai-je respecté mon plan de trading ?"
                checked={form.rulesFollowed}
                onChange={(v) => update("rulesFollowed", v)}
              />
            </div>
          </Section>

          {/* Psychology */}
          <Section label="Psychologie">
            <Field label="Émotion dominante">
              <Select value={form.emotion} onValueChange={(v) => update("emotion", v)}>
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900">
                  {EMOTIONS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <SliderField label="Intensité émotion" value={form.emotionScore} onChange={(v) => update("emotionScore", v[0])} />
              <SliderField label="Confiance" value={form.confidence} onChange={(v) => update("confidence", v[0])} />
              <SliderField label="Discipline" value={form.disciplineScore} onChange={(v) => update("disciplineScore", v[0])} />
            </div>
          </Section>

          {/* Notes */}
          <Section label="Notes & leçons">
            <Field label="Notes">
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} placeholder="Contexte du trade, observation du marché…" className="border-white/10 bg-white/5" />
            </Field>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Plus grosse erreur">
                <Textarea value={form.biggestMistake} onChange={(e) => update("biggestMistake", e.target.value)} rows={2} placeholder="Ex: Sortie trop tôt, FOMO, taille excessive…" className="border-white/10 bg-white/5" />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {BIGGEST_MISTAKES.slice(0, 5).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update("biggestMistake", m)}
                      className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:border-rose-500/30 hover:text-rose-400"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Amélioration pour le prochain trade">
                <Textarea value={form.improvementNext} onChange={(e) => update("improvementNext", e.target.value)} rows={2} placeholder="Ex: Attendre la confirmation, calculer le risque…" className="border-white/10 bg-white/5" />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {IMPROVEMENT_NEXT.slice(0, 5).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update("improvementNext", m)}
                      className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-400"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Leçons apprises">
                <Textarea value={form.lessons} onChange={(e) => update("lessons", e.target.value)} rows={2} placeholder="Qu'avez-vous appris de ce trade ?" className="border-white/10 bg-white/5" />
              </Field>
            </div>
          </Section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-white/5 bg-zinc-950/95 px-5 py-3 backdrop-blur">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {editing ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-3">{children}</div>;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <span className="font-mono text-sm font-semibold text-emerald-500">{value}</span>
      </div>
      <Slider value={[value]} onValueChange={onChange} min={1} max={10} step={1} className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400 [&>span:first-child]:bg-white/10" />
    </div>
  );
}

function SwitchField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-white/10 bg-white/5 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground">
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/10"
        )}
      />
    </div>
  );
}
