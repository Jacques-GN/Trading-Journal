"use client";

import { useAppStore } from "@/lib/store";
import { useFetch, apiPost, apiPut, apiDelete } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle, EmptyState } from "@/components/shared/stat-card";
import { AccountForm } from "./account-form";
import { formatCurrency, formatPercent } from "@/lib/format";
import { colorOf } from "@/lib/enums";
import { Plus, Wallet, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AccountsView() {
  const {
    accounts,
    currentAccountId,
    setAccount,
    setView,
    refreshVersion,
    triggerRefresh,
  } = useAppStore();
  const { refresh } = useFetch<any[]>("/api/accounts", {
    refreshKey: refreshVersion,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      await apiDelete(`/api/accounts/${delTarget}`);
      toast.success("Compte supprimé");
      triggerRefresh();
      if (currentAccountId === delTarget) {
        const r = await fetch("/api/accounts");
        const list = await r.json();
        setAccount(list[0]?.id ?? null);
      }
      setDelTarget(null);
    } catch {
      toast.error("Échec");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gérez vos comptes de trading. Le solde est calculé automatiquement à partir des trades.
        </p>
        <Button onClick={() => setFormOpen(true)} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau compte
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="Aucun compte"
          description="Créez votre premier compte pour commencer."
          icon={<Wallet className="h-5 w-5" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const c = colorOf(a.color);
            const active = currentAccountId === a.id;
            return (
              <Card
                key={a.id}
                className={cn(
                  "relative overflow-hidden border bg-zinc-900/60 p-5 transition-all hover:bg-zinc-900/80",
                  active ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-white/5"
                )}
              >
                <div className={cn("absolute left-0 top-0 h-1 w-full", c.dot)} />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                      <h3 className="text-base font-semibold">{a.name}</h3>
                    </div>
                    {a.broker && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.broker}</p>
                    )}
                  </div>
                  {a.isDefault && (
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      Défaut
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Capital initial</p>
                    <p className="font-mono text-sm font-medium">{formatCurrency(a.initialCapital)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Solde actuel</p>
                    <p className={cn("font-mono text-sm font-semibold", a.realizedPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {formatCurrency(a.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">P/L réalisé</p>
                    <p className={cn("font-mono text-sm font-semibold", a.realizedPnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {formatCurrency(a.realizedPnl, { sign: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Trades</p>
                    <p className="font-mono text-sm font-medium">{a.tradesCount}</p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn("h-full transition-all", a.realizedPnl >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                    style={{ width: `${Math.min(100, Math.abs((a.realizedPnl / a.initialCapital) * 100))}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatPercent((a.realizedPnl / a.initialCapital) * 100, { sign: true })} du capital
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAccount(a.id);
                      setView("dashboard");
                    }}
                    className="border-white/10 text-xs"
                  >
                    {active && <Check className="mr-1 h-3 w-3 text-emerald-500" />}
                    {active ? "Actif" : "Sélectionner"}
                  </Button>
                  {!a.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await apiPut(`/api/accounts/${a.id}`, { isDefault: true });
                        toast.success("Compte par défaut");
                        triggerRefresh();
                      }}
                      className="text-xs text-muted-foreground"
                    >
                      Définir défaut
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                    onClick={() => setDelTarget(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() => {
          triggerRefresh();
          setFormOpen(false);
        }}
      />

      <AlertDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera aussi tous les trades associés. Action irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
