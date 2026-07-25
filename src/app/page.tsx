"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DataProvider } from "@/components/shared/data-provider";
import { useAppStore } from "@/lib/store";
import { DashboardView } from "@/components/dashboard";
import { JournalView } from "@/components/journal";
import { StatisticsView } from "@/components/statistics";
import { MonthlyView } from "@/components/monthly";
import { RulesView } from "@/components/rules";
import { MindsetView } from "@/components/mindset";
import { AccountsView } from "@/components/accounts";
import { TradeFormDialog } from "@/components/journal/trade-form";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const {
    currentView,
    tradeFormOpen,
    setTradeForm,
    tradeFormId,
    triggerRefresh,
  } = useAppStore();

  return (
    <DataProvider>
      <AppShell>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === "dashboard" && <DashboardView />}
            {currentView === "journal" && <JournalView />}
            {currentView === "statistics" && <StatisticsView />}
            {currentView === "monthly" && <MonthlyView />}
            {currentView === "rules" && <RulesView />}
            {currentView === "mindset" && <MindsetView />}
            {currentView === "accounts" && <AccountsView />}
          </motion.div>
        </AnimatePresence>
      </AppShell>

      <TradeFormDialog
        open={tradeFormOpen}
        onOpenChange={(o) => setTradeForm(o, null)}
        tradeId={tradeFormId}
        onSaved={() => {
          triggerRefresh();
        }}
      />
    </DataProvider>
  );
}
