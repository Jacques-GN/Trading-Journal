"use client";

import { useAppStore, type ViewKey } from "@/lib/store";
import { NAV_ITEMS, NAV_MORE_ITEMS, colorOf } from "@/lib/enums";
import { NavIcon } from "./nav-icon";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp } from "lucide-react";

export function Sidebar() {
  const { currentView, setView, accounts, currentAccountId, setAccount } =
    useAppStore();

  const go = (v: ViewKey) => setView(v);

  return (
    <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:z-30 md:h-screen md:w-60 md:flex-col md:border-r md:border-white/5 md:bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-white/5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            Trading Journal
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Discipline · Data
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.view}
              active={currentView === item.view}
              label={item.label}
              icon={item.icon}
              onClick={() => go(item.view as ViewKey)}
            />
          ))}
          {NAV_MORE_ITEMS.map((item) => (
            <NavButton
              key={item.view}
              active={currentView === item.view}
              label={item.label}
              icon={item.icon}
              onClick={() => go(item.view as ViewKey)}
            />
          ))}
        </nav>

        <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Comptes
        </p>
        <div className="flex flex-col gap-1">
          {accounts.length === 0 && (
            <p className="px-3 text-xs text-muted-foreground">
              Aucun compte. Cliquez sur + pour en créer un.
            </p>
          )}
          {accounts.map((a) => {
            const c = colorOf(a.color);
            const active = currentAccountId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => {
                  setAccount(a.id);
                  setView("dashboard");
                }}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-white/5 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                  <span className="truncate">{a.name}</span>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  $
                  {Math.round(a.balance).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-white/5 p-4">
        <div className="rounded-md bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Citation du jour
          </p>
          <p className="mt-1 text-xs italic text-foreground/80">
            "Le plan prime sur l'émotion. La discipline prime sur la prédiction."
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-emerald-500/15 text-emerald-400"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      <NavIcon name={icon} className="h-4 w-4" />
      <span>{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}
