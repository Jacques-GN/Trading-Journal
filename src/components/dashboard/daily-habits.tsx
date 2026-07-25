"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/stat-card";
import { Checkbox } from "@/components/ui/checkbox";
import { useFetch, apiPost } from "@/lib/api";
import { DAILY_HABITS } from "@/lib/enums";
import { toast } from "sonner";
import { TrendingUp, ClipboardList, BookOpen, Brain, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

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

export function DailyHabits() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, refresh } = useFetch<MindsetData>(`/api/mindset?date=${today}`);

  const toggle = async (key: keyof MindsetData) => {
    if (!data) return;
    const newValue = !data[key as keyof MindsetData];
    try {
      await apiPost("/api/mindset", {
        date: today,
        ...data,
        [key]: newValue,
      });
      refresh();
    } catch {
      toast.error("Échec de la mise à jour");
    }
  };

  const completed = data
    ? [data.marketAnalysis, data.reviewPlan, data.journalUpdate, data.mindfulness].filter(Boolean).length
    : 0;

  return (
    <Card className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
      <SectionTitle
        sub={`Habitudes du jour · ${completed}/4`}
        right={
          data?.streak != null && data.streak > 0 ? (
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{data.streak}j de série</span>
            </div>
          ) : null
        }
      >
        Habitudes quotidiennes
      </SectionTitle>
      <CardContent className="space-y-1 px-0">
        {DAILY_HABITS.map((h) => {
          const Icon = ICONS[h.icon] ?? Brain;
          const checked = data ? (data as any)[h.key] : false;
          return (
            <label
              key={h.key}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors hover:border-white/5 hover:bg-white/5"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(h.key as any)}
                className="border-white/20 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
              />
              <Icon className={`h-4 w-4 ${checked ? "text-emerald-500" : "text-muted-foreground"}`} />
              <span className={`text-sm ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                {h.label}
              </span>
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}
