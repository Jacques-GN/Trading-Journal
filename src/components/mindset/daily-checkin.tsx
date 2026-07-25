"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFetch, apiPost } from "@/lib/api";
import { DAILY_HABITS } from "@/lib/enums";
import { toast } from "sonner";
import { TrendingUp, ClipboardList, BookOpen, Brain, Flame } from "lucide-react";
import { format } from "date-fns";
import { useCallback } from "react";

const ICONS: Record<string, any> = {
  TrendingUp,
  ClipboardList,
  BookOpen,
  Brain,
};

interface MindsetData {
  id: string | null;
  marketAnalysis: boolean;
  reviewPlan: boolean;
  journalUpdate: boolean;
  mindfulness: boolean;
  moodScore: number | null;
  focusScore: number | null;
  disciplineScore: number | null;
  preMarketDone: boolean;
  postMarketDone: boolean;
  reflection: string | null;
  streak: number;
}

export function DailyCheckin() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, refresh } = useFetch<MindsetData>(`/api/mindset?date=${today}`);

  const update = useCallback(
    async (partial: Partial<MindsetData>) => {
      if (!data) return;
      try {
        await apiPost("/api/mindset", { date: today, ...data, ...partial });
        refresh();
      } catch {
        toast.error("Échec de la mise à jour");
      }
    },
    [data, today, refresh]
  );

  if (!data) {
    return (
      <Card className="h-64 animate-pulse border-white/5 bg-zinc-900/40" />
    );
  }

  const completed = [data.marketAnalysis, data.reviewPlan, data.journalUpdate, data.mindfulness].filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Habits */}
      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle
          sub="Complétez chaque jour"
          right={
            data.streak > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <Flame className="h-3.5 w-3.5" />
                {data.streak}j
              </span>
            ) : null
          }
        >
          Habitudes du jour
        </SectionTitle>
        <CardContent className="space-y-1 px-0">
          {DAILY_HABITS.map((h) => {
            const Icon = ICONS[h.icon] ?? Brain;
            const checked = (data as any)[h.key] as boolean;
            return (
              <label
                key={h.key}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors hover:border-white/5 hover:bg-white/5"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => update({ [h.key]: !checked } as any)}
                  className="border-white/20 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                />
                <Icon className={`h-4 w-4 ${checked ? "text-emerald-500" : "text-muted-foreground"}`} />
                <span className={`text-sm ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                  {h.label}
                </span>
              </label>
            );
          })}
          <div className="mt-3 rounded-md bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Progression</span>
              <span className="font-mono text-sm font-semibold text-emerald-500">{completed}/4</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(completed / 4) * 100}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mental state */}
      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle sub="Échelle 1-10">État mental</SectionTitle>
        <CardContent className="space-y-4 px-0">
          <SliderRow label="Humeur" value={data.moodScore ?? 5} onChange={(v) => update({ moodScore: v[0] })} />
          <SliderRow label="Focus" value={data.focusScore ?? 5} onChange={(v) => update({ focusScore: v[0] })} />
          <SliderRow label="Discipline" value={data.disciplineScore ?? 5} onChange={(v) => update({ disciplineScore: v[0] })} />
        </CardContent>
      </Card>

      {/* Checklists */}
      <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
        <SectionTitle sub="Routine trading">Checklists</SectionTitle>
        <CardContent className="space-y-3 px-0">
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] p-3">
            <div>
              <p className="text-sm font-medium">Pré-market</p>
              <p className="text-[11px] text-muted-foreground">Analyse, plan, niveaux</p>
            </div>
            <Switch checked={data.preMarketDone} onCheckedChange={(v) => update({ preMarketDone: v })} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] p-3">
            <div>
              <p className="text-sm font-medium">Post-market</p>
              <p className="text-[11px] text-muted-foreground">Revue, journal, leçons</p>
            </div>
            <Switch checked={data.postMarketDone} onCheckedChange={(v) => update({ postMarketDone: v })} />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Réflexion du jour
            </Label>
            <Textarea
              value={data.reflection ?? ""}
              onChange={(e) => update({ reflection: e.target.value })}
              rows={3}
              placeholder="Qu'avez-vous appris aujourd'hui ?"
              className="mt-1.5 border-white/10 bg-white/5"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SliderRow({
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
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={1}
        max={10}
        step={1}
        className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400 [&>span:first-child]:bg-white/10"
      />
    </div>
  );
}
