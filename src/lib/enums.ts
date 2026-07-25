// Domain enums and constants for the trading journal

export const ENTRY_REASONS = [
  "selon le plan",
  "signal technique",
  "configuration",
  "news économique",
  "intuition",
  "FOMO",
] as const;
export type EntryReason = (typeof ENTRY_REASONS)[number];

export const EXIT_REASONS = [
  "selon le plan",
  "TP touché",
  "Stop touché",
  "trop tôt",
  "violation des règles",
  "panique",
] as const;
export type ExitReason = (typeof EXIT_REASONS)[number];

export const EMOTIONS = [
  "peur",
  "espoir",
  "avidité",
  "FOMO",
  "confiance",
  "calme",
  "frustration",
  "excitation",
] as const;
export type Emotion = (typeof EMOTIONS)[number];

export const ASSET_CLASSES = [
  "forex",
  "stock",
  "crypto",
  "futures",
  "options",
] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export const ORDER_TYPES = ["market", "limit", "stop"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const DIRECTIONS = ["long", "short"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const TRADE_STATUS = ["open", "closed"] as const;
export type TradeStatus = (typeof TRADE_STATUS)[number];

export const RULE_CATEGORIES = [
  "risk",
  "entry",
  "exit",
  "psychology",
  "money_management",
] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export const RULE_SEVERITY = ["low", "medium", "high", "critical"] as const;
export type RuleSeverity = (typeof RULE_SEVERITY)[number];

export const DAILY_HABITS = [
  { key: "marketAnalysis", label: "Analyse du marché", icon: "TrendingUp" },
  { key: "reviewPlan", label: "Revue du plan", icon: "ClipboardList" },
  { key: "journalUpdate", label: "Mise à jour du journal", icon: "BookOpen" },
  { key: "mindfulness", label: "Pleine conscience", icon: "Brain" },
] as const;

export const VIEW_TITLES: Record<string, string> = {
  dashboard: "Tableau de bord",
  journal: "Journal des trades",
  statistics: "Statistiques",
  monthly: "Rapport mensuel",
  rules: "Règles de trading",
  mindset: "État psychologique",
  accounts: "Comptes",
};

export const NAV_ITEMS = [
  { view: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { view: "journal", label: "Journal", icon: "BookOpen" },
  { view: "statistics", label: "Stats", icon: "BarChart3" },
  { view: "mindset", label: "Mindset", icon: "Brain" },
] as const;

export const NAV_MORE_ITEMS = [
  { view: "monthly", label: "Rapport mensuel", icon: "CalendarRange" },
  { view: "rules", label: "Règles de trading", icon: "ScrollText" },
  { view: "accounts", label: "Comptes", icon: "Wallet" },
] as const;

export const STRATEGY_COLORS = [
  "emerald",
  "cyan",
  "amber",
  "violet",
  "rose",
  "teal",
  "orange",
  "sky",
] as const;

export const ACCOUNT_COLORS = [
  "emerald",
  "cyan",
  "amber",
  "violet",
  "rose",
  "teal",
] as const;

// Color mapping for tailwind class generation
export const COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    border: "border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/30",
    dot: "bg-violet-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-500",
    border: "border-teal-500/30",
    dot: "bg-teal-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/30",
    dot: "bg-sky-500",
  },
};

export function colorOf(name: string) {
  return COLOR_MAP[name] ?? COLOR_MAP.emerald;
}

// HEX values for chart series
export const CHART_HEX = {
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  teal: "#14b8a6",
  orange: "#f97316",
  sky: "#0ea5e9",
  zinc: "#71717a",
};

export function hexForColor(name: string): string {
  return (CHART_HEX as Record<string, string>)[name] ?? CHART_HEX.emerald;
}
