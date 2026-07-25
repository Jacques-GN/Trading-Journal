"use client";

import { useAppStore, type ViewKey } from "@/lib/store";
import { VIEW_TITLES, colorOf } from "@/lib/enums";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar() {
  const {
    currentView,
    accounts,
    currentAccountId,
    setAccount,
    setView,
    setTradeForm,
  } = useAppStore();

  const title = VIEW_TITLES[currentView as ViewKey] ?? currentView;
  const current = accounts.find((a) => a.id === currentAccountId);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-sm font-semibold uppercase tracking-widest text-foreground md:text-base">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {accounts.length > 0 && (
          <Select
            value={currentAccountId ?? undefined}
            onValueChange={(v) => {
              setAccount(v);
              setView("dashboard");
            }}
          >
            <SelectTrigger className="h-9 w-[150px] gap-2 border-white/10 bg-white/5 px-3 text-xs md:w-[210px] md:text-sm">
              <SelectValue placeholder="Compte">
                {current && (
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        colorOf(current.color).dot
                      )}
                    />
                    <span className="truncate">{current.name}</span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-zinc-900">
              {accounts.map((a) => (
                <SelectItem
                  key={a.id}
                  value={a.id}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        colorOf(a.color).dot
                      )}
                    />
                    {a.name}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    $
                    {Math.round(a.balance).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          size="sm"
          onClick={() => setTradeForm(true)}
          className="h-9 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Nouveau Trade</span>
          <span className="md:hidden">Trade</span>
        </Button>
      </div>
    </header>
  );
}
