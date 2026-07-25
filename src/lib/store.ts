"use client";

import { create } from "zustand";

export type ViewKey =
  | "dashboard"
  | "journal"
  | "statistics"
  | "monthly"
  | "rules"
  | "mindset"
  | "accounts";

interface AppState {
  currentView: ViewKey;
  currentAccountId: string | null;
  accounts: Array<{
    id: string;
    name: string;
    broker: string | null;
    initialCapital: number;
    color: string;
    balance: number;
  }>;
  setView: (v: ViewKey) => void;
  setAccount: (id: string | null) => void;
  setAccounts: (
    accounts: Array<{
      id: string;
      name: string;
      broker: string | null;
      initialCapital: number;
      color: string;
      balance: number;
    }>
  ) => void;
  // UI state for dialogs
  tradeFormOpen: boolean;
  tradeFormId: string | null;
  setTradeForm: (open: boolean, id?: string | null) => void;
  // Global data refresh signal (incremented after mutations)
  refreshVersion: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
  currentAccountId: null,
  accounts: [],
  setView: (v) => set({ currentView: v }),
  setAccount: (id) => set({ currentAccountId: id }),
  setAccounts: (accounts) => set({ accounts }),
  tradeFormOpen: false,
  tradeFormId: null,
  setTradeForm: (open, id = null) =>
    set({ tradeFormOpen: open, tradeFormId: id }),
  refreshVersion: 0,
  triggerRefresh: () =>
    set((s) => ({ refreshVersion: s.refreshVersion + 1 })),
}));
