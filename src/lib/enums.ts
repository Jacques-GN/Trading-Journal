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

// Market context — sessions, bias, timeframes
export const MARKET_SESSIONS = [
  { value: "london", label: "Londres", abbr: "LDN" },
  { value: "new_york", label: "New York", abbr: "NY" },
  { value: "asia", label: "Asie", abbr: "ASIA" },
  { value: "sydney", label: "Sydney", abbr: "SYD" },
  { value: "overlap", label: "Chevauchement", abbr: "OVL" },
] as const;
export type MarketSession = (typeof MARKET_SESSIONS)[number]["value"];

export const MARKET_BIAS = [
  { value: "bullish", label: "Haussier" },
  { value: "bearish", label: "Baissier" },
  { value: "neutral", label: "Neutre" },
] as const;
export type MarketBias = (typeof MARKET_BIAS)[number]["value"];

export const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"].map(
  (value) => ({ value, label: value })
) as ReadonlyArray<{ value: string; label: string }>;
export type Timeframe = (typeof TIMEFRAMES)[number]["value"];

export function sessionLabel(value?: string | null): string {
  if (!value) return "—";
  return MARKET_SESSIONS.find((s) => s.value === value)?.label ?? value;
}
export function sessionAbbr(value?: string | null): string {
  if (!value) return "—";
  return MARKET_SESSIONS.find((s) => s.value === value)?.abbr ?? value;
}
export function biasLabel(value?: string | null): string {
  if (!value) return "—";
  return MARKET_BIAS.find((b) => b.value === value)?.label ?? value;
}

// Common recurring mistakes (suggested values for the form dropdown / chip picker)
export const BIGGEST_MISTAKES = [
  "Sortie trop tôt",
  "Taille de position excessive",
  "Entrée impulsive sans confirmation",
  "Pas de stop loss",
  "Revenge trading",
  "Avoir déplacé mon stop",
  "Surtrading",
  "Ignorer la structure du marché",
  "FOMO",
  "Pas respecté mon plan",
] as const;

export const IMPROVEMENT_NEXT = [
  "Attendre la confirmation de la bougie",
  "Calculer le risque avant l'entrée",
  "Max 3 trades par jour",
  "Ne pas trader pendant les news",
  "Respecter le stop initial",
  "Laisser courir les gagnants",
  "Journaliser chaque trade",
  "Revoir le plan avant la séance",
] as const;

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
