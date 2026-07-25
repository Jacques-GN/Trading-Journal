"use client";

import { useAppStore, type ViewKey } from "@/lib/store";
import { NAV_ITEMS, colorOf } from "@/lib/enums";
import { NavIcon } from "./nav-icon";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CalendarRange, ScrollText, Wallet, MoreHorizontal, TrendingUp } from "lucide-react";
import { useState } from "react";

const MORE_ITEMS: Array<{ view: ViewKey; label: string; icon: React.ReactNode }> = [
  { view: "monthly", label: "Rapport mensuel", icon: <CalendarRange className="h-4 w-4" /> },
  { view: "rules", label: "Règles de trading", icon: <ScrollText className="h-4 w-4" /> },
  { view: "accounts", label: "Comptes", icon: <Wallet className="h-4 w-4" /> },
];

export function BottomNav() {
  const { currentView, setView, accounts, currentAccountId, setAccount } =
    useAppStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = ["monthly", "rules", "accounts"].includes(currentView);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-zinc-950/90 backdrop-blur-md md:hidden safe-area-inset-bottom">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view as ViewKey)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-emerald-400" : "text-muted-foreground"
                )}
                aria-label={item.label}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  moreActive ? "text-emerald-400" : "text-muted-foreground"
                )}
                aria-label="Plus"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span>Plus</span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="border-t border-white/10 bg-zinc-950 p-0"
            >
              <SheetHeader className="px-5 pb-2 pt-4">
                <SheetTitle className="text-left text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="px-3 pb-6">
                {MORE_ITEMS.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => {
                      setView(item.view);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors",
                      currentView === item.view
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "text-foreground hover:bg-white/5"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                <div className="mt-4 border-t border-white/5 pt-3">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Comptes
                  </p>
                  {accounts.length === 0 && (
                    <p className="px-3 text-xs text-muted-foreground">
                      Aucun compte.
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
                          setMoreOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-white/5"
                            : "text-muted-foreground hover:bg-white/5"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", c.dot)} />
                          {a.name}
                        </span>
                        <span className="font-mono text-[11px]">
                          $
                          {Math.round(a.balance).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  className="mt-4 w-full border-white/10"
                  onClick={() => {
                    setMoreOpen(false);
                    setView("accounts");
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Gérer les comptes
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
