"use client";

import { useAppStore } from "@/lib/store";
import { useFetch, apiPost, apiPut, apiDelete } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionTitle, EmptyState } from "@/components/shared/stat-card";
import { SeverityBadge } from "@/components/shared/badges";
import { ViolationsPanel } from "./violations-panel";
import { RULE_CATEGORIES, RULE_SEVERITY } from "@/lib/enums";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ScrollText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: string;
  isActive: boolean;
}

export function RulesView() {
  const { currentAccountId, refreshVersion } = useAppStore();
  const { data: rules, refresh } = useFetch<Rule[]>("/api/rules", {
    refreshKey: refreshVersion,
  });
  const { data: trades } = useFetch<any[]>(
    currentAccountId ? `/api/trades?accountId=${currentAccountId}` : null,
    { refreshKey: refreshVersion }
  );
  const [editing, setEditing] = useState<Rule | null>(null);
  const [open, setOpen] = useState(false);

  const grouped = (RULE_CATEGORIES as readonly string[]).map((cat) => ({
    cat,
    rules: (rules ?? []).filter((r) => r.category === cat),
  }));

  const newRule = () => {
    setEditing(null);
    setOpen(true);
  };
  const editRule = (r: Rule) => {
    setEditing(r);
    setOpen(true);
  };

  const toggleActive = async (r: Rule) => {
    try {
      await apiPut(`/api/rules/${r.id}`, { isActive: !r.isActive });
      refresh();
    } catch {
      toast.error("Échec");
    }
  };

  const delRule = async (r: Rule) => {
    if (!confirm(`Supprimer la règle "${r.title}" ?`)) return;
    try {
      await apiDelete(`/api/rules/${r.id}`);
      toast.success("Règle supprimée");
      refresh();
    } catch {
      toast.error("Échec");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Définissez vos règles et suivez leur respect à travers vos trades.
        </p>
        <Button onClick={newRule} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle règle
        </Button>
      </div>

      <ViolationsPanel trades={trades ?? []} />

      {grouped.map(({ cat, rules: rs }) => (
        <Card key={cat} className="border-white/5 bg-zinc-900/60 p-4 md:p-5">
          <SectionTitle sub={`${rs.length} règle(s)`}>
            {categoryLabel(cat)}
          </SectionTitle>
          <CardContent className="space-y-2 px-0">
            {rs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Aucune règle dans cette catégorie.
              </p>
            )}
            {rs.map((r) => {
              const violatedCount = (trades ?? []).filter(
                (t) => t.ruleViolated && t.ruleViolated.toLowerCase().includes(r.title.toLowerCase().split(" ").slice(0, 3).join(" ").toLowerCase())
              ).length;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md border border-white/5 bg-white/[0.02] p-3 transition-colors",
                    !r.isActive && "opacity-50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{r.title}</span>
                      <SeverityBadge severity={r.severity} />
                      {violatedCount > 0 && (
                        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-500 text-[10px]">
                          {violatedCount} violation(s)
                        </Badge>
                      )}
                    </div>
                    {r.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={r.isActive}
                      onCheckedChange={() => toggleActive(r)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editRule(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10" onClick={() => delRule(r)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {(rules ?? []).length === 0 && (
        <EmptyState
          title="Aucune règle"
          description="Créez votre première règle de trading."
          icon={<ScrollText className="h-5 w-5" />}
        />
      )}

      <RuleFormDialog
        open={open}
        onOpenChange={setOpen}
        rule={editing}
        onSaved={refresh}
      />
    </div>
  );
}

function categoryLabel(c: string): string {
  const map: Record<string, string> = {
    risk: "Gestion du risque",
    entry: "Entrée",
    exit: "Sortie",
    psychology: "Psychologie",
    money_management: "Money management",
  };
  return map[c] ?? c;
}

function RuleFormDialog({
  open,
  onOpenChange,
  rule,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rule: Rule | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("risk");
  const [severity, setSeverity] = useState("high");

  // Re-init when dialog opens
  const init = () => {
    if (rule) {
      setTitle(rule.title);
      setDescription(rule.description ?? "");
      setCategory(rule.category);
      setSeverity(rule.severity);
    } else {
      setTitle("");
      setDescription("");
      setCategory("risk");
      setSeverity("high");
    }
  };

  const save = async () => {
    if (!title.trim()) {
      toast.error("Titre requis");
      return;
    }
    try {
      if (rule) {
        await apiPut(`/api/rules/${rule.id}`, { title, description, category, severity });
        toast.success("Règle mise à jour");
      } else {
        await apiPost("/api/rules", { title, description, category, severity, isActive: true });
        toast.success("Règle créée");
      }
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) init();
        onOpenChange(o);
      }}
    >
      <DialogContent className="border-white/10 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest">
            {rule ? "Modifier la règle" : "Nouvelle règle"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Titre *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-white/10 bg-white/5" />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="border-white/10 bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900">
                  {RULE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Sévérité</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900">
                  {RULE_SEVERITY.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10">
            Annuler
          </Button>
          <Button onClick={save} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
