"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar />
        <main className="min-h-[calc(100vh-3.5rem)] px-4 pb-24 pt-6 md:px-6 md:pb-12">
          {children}
        </main>
        <footer className="mt-auto hidden border-t border-white/5 bg-zinc-950/40 px-6 py-4 text-center text-[11px] uppercase tracking-widest text-muted-foreground md:block">
          Trading Journal — Discipline over Prediction
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
