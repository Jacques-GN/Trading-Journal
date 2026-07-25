"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useFetch, apiPost, type AccountSummary } from "@/lib/api";
import { toast } from "sonner";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { setAccounts, setAccount, refreshVersion } = useAppStore();
  const seeded = useRef(false);
  const { data, loading, refresh } = useFetch<AccountSummary[]>("/api/accounts", {
    refreshKey: refreshVersion,
  });

  // Auto-seed on first load if no accounts
  useEffect(() => {
    if (loading) return;
    if (data && data.length === 0 && !seeded.current) {
      seeded.current = true;
      apiPost<{ accounts: number; trades: number }>("/api/seed", {})
        .then(() => {
          toast.success("Données de démonstration chargées");
          refresh();
        })
        .catch(() => toast.error("Échec du seed"));
    }
  }, [data, loading, refresh]);

  // Sync accounts to store
  useEffect(() => {
    if (data && data.length > 0) {
      setAccounts(data);
      const store = useAppStore.getState();
      if (!store.currentAccountId) {
        const def = data.find((a) => a.isDefault) ?? data[0];
        setAccount(def.id);
      }
    }
  }, [data, setAccounts, setAccount]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-500" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Chargement du journal…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
