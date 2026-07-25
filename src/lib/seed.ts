import { db } from "@/lib/db";
import { updateTradeNewFields } from "@/lib/db";

// Seed demo data — realistic trading journal with 3 accounts, 6 strategies,
// ~65 trades, 6 rules, 14 days of psychological checks, 3 goals.
// Equity curve tells a story: rough start, learning, improving.

interface SeedTrade {
  instrument: string;
  assetClass: string;
  direction: "long" | "short";
  orderType: string;
  strategyName: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  fees: number;
  entryDate: Date;
  durationMin: number;
  entryReason: string;
  exitReason: string;
  ruleViolated: string | null;
  emotion: string;
  emotionScore: number;
  confidence: number;
  disciplineScore: number;
  notes: string;
  lessons: string;
  status: string;
  // New template fields (optional — auto-derived when absent)
  marketSession?: string;
  marketBias?: string;
  timeframe?: string;
  riskPercent?: number;
  setupValid?: boolean;
  rulesFollowed?: boolean;
  biggestMistake?: string;
  improvementNext?: string;
}

function daysAgo(n: number, hour = 9, minute = 30): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const FOREX_TRADES: SeedTrade[] = [
  // Rough start (days 88-70) — losses, FOMO, rule violations
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 1.085,
    exitPrice: 1.082,
    stopLoss: 1.083,
    takeProfit: 1.091,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(88, 8, 15),
    durationMin: 240,
    entryReason: "FOMO",
    exitReason: "Stop touché",
    ruleViolated: "Pas de FOMO",
    emotion: "FOMO",
    emotionScore: 8,
    confidence: 4,
    disciplineScore: 3,
    notes: "Entrée précipitée sans confirmation. Le marché était déjà monté.",
    lessons: "Attendre le retracement, ne pas chasser le prix.",
    status: "closed",
  },
  {
    instrument: "GBPUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "market",
    strategyName: "News",
    entryPrice: 1.272,
    exitPrice: 1.276,
    stopLoss: 1.275,
    takeProfit: 1.265,
    positionSize: 40000,
    fees: 6,
    entryDate: daysAgo(85, 13, 45),
    durationMin: 120,
    entryReason: "news économique",
    exitReason: "Stop touché",
    ruleViolated: "Pas de trading pendant news à fort impact",
    emotion: "avidité",
    emotionScore: 7,
    confidence: 5,
    disciplineScore: 4,
    notes: "Trade pendant NFP. Spread élargi, stop touché immédiatement.",
    lessons: "Éviter les news à fort impact, attendre la stabilisation.",
    status: "closed",
  },
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 2015,
    exitPrice: 2028,
    stopLoss: 2010,
    takeProfit: 2030,
    positionSize: 20,
    fees: 5,
    entryDate: daysAgo(82, 10, 0),
    durationMin: 360,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 6,
    confidence: 8,
    disciplineScore: 8,
    notes: "Beau pullback sur tendance haussière. TP touché.",
    lessons: "Les plans disciplinés paient.",
    status: "closed",
  },
  {
    instrument: "USDJPY",
    assetClass: "forex",
    direction: "short",
    orderType: "market",
    strategyName: "Range",
    entryPrice: 149.8,
    exitPrice: 150.2,
    stopLoss: 150.1,
    takeProfit: 149.2,
    positionSize: 30000,
    fees: 6,
    entryDate: daysAgo(79, 14, 30),
    durationMin: 180,
    entryReason: "signal technique",
    exitReason: "violation des règles",
    ruleViolated: "Max 3 trades par jour",
    emotion: "frustration",
    emotionScore: 7,
    confidence: 5,
    disciplineScore: 3,
    notes: "4e trade de la journée, forcé. Sorti manuellement en perte.",
    lessons: "Respecter la limite quotidienne. La frustration mène à la perte.",
    status: "closed",
  },
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 1.088,
    exitPrice: 1.084,
    stopLoss: 1.085,
    takeProfit: 1.095,
    positionSize: 40000,
    fees: 6,
    entryDate: daysAgo(76, 9, 0),
    durationMin: 90,
    entryReason: "intuition",
    exitReason: "Stop touché",
    ruleViolated: "Toujours set un stop avant l'entrée",
    emotion: "espoir",
    emotionScore: 6,
    confidence: 4,
    disciplineScore: 3,
    notes: "Pas de stop défini au départ, ajouté tard.",
    lessons: "Toujours définir le stop avant l'entrée.",
    status: "closed",
  },
  // Learning phase (days 70-50) — mixed results
  {
    instrument: "AUDUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 0.658,
    exitPrice: 0.663,
    stopLoss: 0.656,
    takeProfit: 0.665,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(72, 10, 30),
    durationMin: 300,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 4,
    confidence: 7,
    disciplineScore: 8,
    notes: "Pullback propre sur support. Patience récompensée.",
    lessons: "Continuer à attendre les configurations.",
    status: "closed",
  },
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "market",
    strategyName: "Range",
    entryPrice: 2032,
    exitPrice: 2025,
    stopLoss: 2036,
    takeProfit: 2022,
    positionSize: 20,
    fees: 5,
    entryDate: daysAgo(68, 14, 0),
    durationMin: 240,
    entryReason: "signal technique",
    exitReason: "selon le plan",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 5,
    confidence: 7,
    disciplineScore: 7,
    notes: "Rejet de résistance, sortie propre selon plan.",
    lessons: "Bonne gestion.",
    status: "closed",
  },
  {
    instrument: "GBPUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 1.268,
    exitPrice: 1.265,
    stopLoss: 1.266,
    takeProfit: 1.275,
    positionSize: 40000,
    fees: 6,
    entryDate: daysAgo(65, 9, 15),
    durationMin: 150,
    entryReason: "signal technique",
    exitReason: "Stop touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 6,
    disciplineScore: 7,
    notes: "Faux breakout. Stop respecté.",
    lessons: "Les faux breakouts font partie du jeu.",
    status: "closed",
  },
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "limit",
    strategyName: "Trend Following",
    entryPrice: 1.092,
    exitPrice: 1.085,
    stopLoss: 1.095,
    takeProfit: 1.085,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(61, 11, 0),
    durationMin: 420,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 5,
    confidence: 8,
    disciplineScore: 9,
    notes: "Suivi de tendance baissière, TP atteint.",
    lessons: "Excellent trade selon plan.",
    status: "closed",
  },
  {
    instrument: "USDJPY",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Pullback",
    entryPrice: 150.1,
    exitPrice: 150.5,
    stopLoss: 149.9,
    takeProfit: 150.6,
    positionSize: 30000,
    fees: 6,
    entryDate: daysAgo(58, 10, 0),
    durationMin: 200,
    entryReason: "selon le plan",
    exitReason: "trop tôt",
    ruleViolated: "Laisser courir les gains",
    emotion: "peur",
    emotionScore: 6,
    confidence: 7,
    disciplineScore: 5,
    notes: "Sorti avant le TP par peur. Trade fini par atteindre le TP.",
    lessons: "Laisser courir les gagnants.",
    status: "closed",
  },
  // Improving phase (days 50-30) — more wins, discipline up
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 2025,
    exitPrice: 2040,
    stopLoss: 2020,
    takeProfit: 2040,
    positionSize: 30,
    fees: 5,
    entryDate: daysAgo(54, 9, 30),
    durationMin: 480,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 5,
    confidence: 8,
    disciplineScore: 9,
    notes: "Pullback parfait, TP touché.",
    lessons: "Discipline récompensée.",
    status: "closed",
  },
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 1.086,
    exitPrice: 1.09,
    stopLoss: 1.084,
    takeProfit: 1.09,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(50, 10, 0),
    durationMin: 240,
    entryReason: "signal technique",
    exitReason: "selon le plan",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 4,
    confidence: 7,
    disciplineScore: 8,
    notes: "Breakout validé. Gestion propre.",
    lessons: "Continuer comme ça.",
    status: "closed",
  },
  {
    instrument: "GBPUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "limit",
    strategyName: "Range",
    entryPrice: 1.278,
    exitPrice: 1.273,
    stopLoss: 1.281,
    takeProfit: 1.273,
    positionSize: 40000,
    fees: 6,
    entryDate: daysAgo(47, 11, 30),
    durationMin: 320,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Range clean, TP touché.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "AUDUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "market",
    strategyName: "Trend Following",
    entryPrice: 0.662,
    exitPrice: 0.658,
    stopLoss: 0.664,
    takeProfit: 0.658,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(44, 14, 0),
    durationMin: 280,
    entryReason: "selon le plan",
    exitReason: "selon le plan",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 7,
    disciplineScore: 8,
    notes: "Suivi tendance baissière.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "USDJPY",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "News",
    entryPrice: 151.2,
    exitPrice: 150.8,
    stopLoss: 150.9,
    takeProfit: 151.8,
    positionSize: 30000,
    fees: 6,
    entryDate: daysAgo(41, 8, 30),
    durationMin: 100,
    entryReason: "news économique",
    exitReason: "Stop touché",
    ruleViolated: "Pas de trading pendant news à fort impact",
    emotion: "frustration",
    emotionScore: 6,
    confidence: 4,
    disciplineScore: 4,
    notes: "Encore une news. Stop touché en volatilité.",
    lessons: "Éviter les news à fort impact.",
    status: "closed",
  },
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "limit",
    strategyName: "Range",
    entryPrice: 2042,
    exitPrice: 2035,
    stopLoss: 2046,
    takeProfit: 2035,
    positionSize: 30,
    fees: 5,
    entryDate: daysAgo(38, 13, 0),
    durationMin: 360,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Range, rejet résistance, TP touché.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Scalp",
    entryPrice: 1.082,
    exitPrice: 1.084,
    stopLoss: 1.081,
    takeProfit: 1.084,
    positionSize: 60000,
    fees: 8,
    entryDate: daysAgo(35, 15, 0),
    durationMin: 60,
    entryReason: "signal technique",
    exitReason: "selon le plan",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 7,
    disciplineScore: 8,
    notes: "Scalp rapide.",
    lessons: "Bon scalp.",
    status: "closed",
  },
  // Mature phase (days 30-5) — consistent wins
  {
    instrument: "GBPUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 1.265,
    exitPrice: 1.272,
    stopLoss: 1.262,
    takeProfit: 1.272,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(30, 10, 0),
    durationMin: 400,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Pullback sur tendance. TP touché.",
    lessons: "Plan exécuté.",
    status: "closed",
  },
  {
    instrument: "AUDUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 0.657,
    exitPrice: 0.661,
    stopLoss: 0.655,
    takeProfit: 0.661,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(27, 9, 0),
    durationMin: 220,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 8,
    disciplineScore: 9,
    notes: "Breakout validé.",
    lessons: "Continue.",
    status: "closed",
  },
  {
    instrument: "USDJPY",
    assetClass: "forex",
    direction: "short",
    orderType: "limit",
    strategyName: "Trend Following",
    entryPrice: 151.5,
    exitPrice: 150.8,
    stopLoss: 151.8,
    takeProfit: 150.8,
    positionSize: 40000,
    fees: 6,
    entryDate: daysAgo(24, 11, 0),
    durationMin: 360,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Tendance baissière suivie.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Pullback",
    entryPrice: 2030,
    exitPrice: 2024,
    stopLoss: 2025,
    takeProfit: 2042,
    positionSize: 30,
    fees: 5,
    entryDate: daysAgo(21, 14, 30),
    durationMin: 200,
    entryReason: "signal technique",
    exitReason: "Stop touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 6,
    disciplineScore: 8,
    notes: "Stop respecté. Setup non validé finalement.",
    lessons: "Les stops protègent le capital.",
    status: "closed",
  },
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 1.087,
    exitPrice: 1.092,
    stopLoss: 1.085,
    takeProfit: 1.092,
    positionSize: 60000,
    fees: 8,
    entryDate: daysAgo(18, 10, 0),
    durationMin: 280,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Breakout puissant, TP touché.",
    lessons: "Top trade.",
    status: "closed",
  },
  {
    instrument: "GBPUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "limit",
    strategyName: "Range",
    entryPrice: 1.276,
    exitPrice: 1.271,
    stopLoss: 1.279,
    takeProfit: 1.271,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(15, 13, 0),
    durationMin: 320,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 8,
    disciplineScore: 9,
    notes: "Range clean.",
    lessons: "Continue.",
    status: "closed",
  },
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Trend Following",
    entryPrice: 2035,
    exitPrice: 2050,
    stopLoss: 2030,
    takeProfit: 2050,
    positionSize: 40,
    fees: 6,
    entryDate: daysAgo(12, 9, 30),
    durationMin: 500,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 9,
    disciplineScore: 9,
    notes: "Tendance haussière suivie. Gros gain.",
    lessons: "Meilleur trade du mois.",
    status: "closed",
  },
  {
    instrument: "USDJPY",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Pullback",
    entryPrice: 150.5,
    exitPrice: 151,
    stopLoss: 150.2,
    takeProfit: 151,
    positionSize: 40000,
    fees: 6,
    entryDate: daysAgo(10, 10, 30),
    durationMin: 240,
    entryReason: "selon le plan",
    exitReason: "selon le plan",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 7,
    disciplineScore: 8,
    notes: "Bonne gestion.",
    lessons: "Continue.",
    status: "closed",
  },
  {
    instrument: "EURUSD",
    assetClass: "forex",
    direction: "short",
    orderType: "limit",
    strategyName: "Range",
    entryPrice: 1.094,
    exitPrice: 1.09,
    stopLoss: 1.096,
    takeProfit: 1.09,
    positionSize: 50000,
    fees: 7,
    entryDate: daysAgo(7, 14, 0),
    durationMin: 300,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Range. TP touché.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "AUDUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 0.66,
    exitPrice: 0.663,
    stopLoss: 0.658,
    takeProfit: 0.663,
    positionSize: 60000,
    fees: 8,
    entryDate: daysAgo(4, 9, 0),
    durationMin: 180,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 8,
    disciplineScore: 9,
    notes: "Breakout, TP touché.",
    lessons: "Continue.",
    status: "closed",
  },
  {
    instrument: "XAUUSD",
    assetClass: "forex",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 2048,
    exitPrice: 0,
    stopLoss: 2044,
    takeProfit: 2058,
    positionSize: 30,
    fees: 0,
    entryDate: daysAgo(1, 10, 0),
    durationMin: 0,
    entryReason: "selon le plan",
    exitReason: null,
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Trade en cours.",
    lessons: "",
    status: "open",
  },
];

const CRYPTO_TRADES: SeedTrade[] = [
  {
    instrument: "BTCUSD",
    assetClass: "crypto",
    direction: "long",
    orderType: "market",
    strategyName: "Trend Following",
    entryPrice: 42000,
    exitPrice: 43500,
    stopLoss: 41000,
    takeProfit: 44000,
    positionSize: 0.5,
    fees: 25,
    entryDate: daysAgo(60, 8, 0),
    durationMin: 2880,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 5,
    confidence: 8,
    disciplineScore: 8,
    notes: "Suivi tendance haussière BTC.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "ETHUSD",
    assetClass: "crypto",
    direction: "short",
    orderType: "limit",
    strategyName: "Range",
    entryPrice: 2350,
    exitPrice: 2200,
    stopLoss: 2400,
    takeProfit: 2200,
    positionSize: 5,
    fees: 20,
    entryDate: daysAgo(52, 12, 0),
    durationMin: 1440,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 4,
    confidence: 7,
    disciplineScore: 8,
    notes: "Range ETH, TP touché.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "BTCUSD",
    assetClass: "crypto",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 43800,
    exitPrice: 42000,
    stopLoss: 43000,
    takeProfit: 46000,
    positionSize: 0.5,
    fees: 25,
    entryDate: daysAgo(45, 14, 0),
    durationMin: 720,
    entryReason: "signal technique",
    exitReason: "Stop touché",
    ruleViolated: null,
    emotion: "frustration",
    emotionScore: 6,
    confidence: 6,
    disciplineScore: 7,
    notes: "Faux breakout. Stop touché.",
    lessons: "Volatilité crypto, accepter la perte.",
    status: "closed",
  },
  {
    instrument: "SOLUSD",
    assetClass: "crypto",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 95,
    exitPrice: 110,
    stopLoss: 90,
    takeProfit: 110,
    positionSize: 50,
    fees: 15,
    entryDate: daysAgo(38, 9, 0),
    durationMin: 2160,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Pullback SOL, gros gain.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "ETHUSD",
    assetClass: "crypto",
    direction: "long",
    orderType: "market",
    strategyName: "Trend Following",
    entryPrice: 2250,
    exitPrice: 2400,
    stopLoss: 2180,
    takeProfit: 2400,
    positionSize: 4,
    fees: 20,
    entryDate: daysAgo(28, 11, 0),
    durationMin: 1800,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 8,
    disciplineScore: 9,
    notes: "Suivi tendance ETH.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "BTCUSD",
    assetClass: "crypto",
    direction: "short",
    orderType: "market",
    strategyName: "Range",
    entryPrice: 45000,
    exitPrice: 46500,
    stopLoss: 46000,
    takeProfit: 43500,
    positionSize: 0.4,
    fees: 22,
    entryDate: daysAgo(22, 16, 0),
    durationMin: 600,
    entryReason: "FOMO",
    exitReason: "Stop touché",
    ruleViolated: "Pas de FOMO",
    emotion: "FOMO",
    emotionScore: 7,
    confidence: 4,
    disciplineScore: 3,
    notes: "Short FOMO, marché a continué à monter.",
    lessons: "Ne pas short FOMO sur crypto haussière.",
    status: "closed",
  },
  {
    instrument: "SOLUSD",
    assetClass: "crypto",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 102,
    exitPrice: 118,
    stopLoss: 97,
    takeProfit: 118,
    positionSize: 60,
    fees: 18,
    entryDate: daysAgo(14, 10, 0),
    durationMin: 2400,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Pullback SOL encore.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "BTCUSD",
    assetClass: "crypto",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 47000,
    exitPrice: 48500,
    stopLoss: 46200,
    takeProfit: 48500,
    positionSize: 0.5,
    fees: 25,
    entryDate: daysAgo(6, 9, 0),
    durationMin: 1200,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Breakout BTC, TP touché.",
    lessons: "Top trade.",
    status: "closed",
  },
];

const STOCK_TRADES: SeedTrade[] = [
  {
    instrument: "AAPL",
    assetClass: "stock",
    direction: "long",
    orderType: "market",
    strategyName: "Trend Following",
    entryPrice: 185,
    exitPrice: 192,
    stopLoss: 182,
    takeProfit: 192,
    positionSize: 100,
    fees: 5,
    entryDate: daysAgo(55, 14, 30),
    durationMin: 4320,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 7,
    disciplineScore: 8,
    notes: "Tendance haussière AAPL.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "TSLA",
    assetClass: "stock",
    direction: "short",
    orderType: "limit",
    strategyName: "Range",
    entryPrice: 245,
    exitPrice: 255,
    stopLoss: 252,
    takeProfit: 232,
    positionSize: 50,
    fees: 4,
    entryDate: daysAgo(48, 10, 0),
    durationMin: 2880,
    entryReason: "signal technique",
    exitReason: "Stop touché",
    ruleViolated: null,
    emotion: "frustration",
    emotionScore: 6,
    confidence: 5,
    disciplineScore: 7,
    notes: "TSLA a cassé la résistance, stop touché.",
    lessons: "TSLA très volatile, stop plus large.",
    status: "closed",
  },
  {
    instrument: "NVDA",
    assetClass: "stock",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 480,
    exitPrice: 520,
    stopLoss: 470,
    takeProfit: 520,
    positionSize: 30,
    fees: 5,
    entryDate: daysAgo(40, 14, 0),
    durationMin: 5760,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Breakout NVDA, gros gain.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "AMZN",
    assetClass: "stock",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 178,
    exitPrice: 185,
    stopLoss: 174,
    takeProfit: 185,
    positionSize: 80,
    fees: 5,
    entryDate: daysAgo(33, 11, 0),
    durationMin: 3600,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 7,
    disciplineScore: 8,
    notes: "Pullback AMZN, TP touché.",
    lessons: "Bon trade.",
    status: "closed",
  },
  {
    instrument: "META",
    assetClass: "stock",
    direction: "long",
    orderType: "market",
    strategyName: "Trend Following",
    entryPrice: 490,
    exitPrice: 475,
    stopLoss: 480,
    takeProfit: 510,
    positionSize: 30,
    fees: 4,
    entryDate: daysAgo(25, 14, 0),
    durationMin: 1440,
    entryReason: "intuition",
    exitReason: "Stop touché",
    ruleViolated: "Toujours set un stop avant l'entrée",
    emotion: "espoir",
    emotionScore: 6,
    confidence: 4,
    disciplineScore: 4,
    notes: "Trade impulsif, stop touché.",
    lessons: "Attendre le signal.",
    status: "closed",
  },
  {
    instrument: "AAPL",
    assetClass: "stock",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 188,
    exitPrice: 195,
    stopLoss: 184,
    takeProfit: 195,
    positionSize: 100,
    fees: 5,
    entryDate: daysAgo(16, 10, 0),
    durationMin: 4320,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Pullback AAPL, TP touché.",
    lessons: "Excellent.",
    status: "closed",
  },
  {
    instrument: "NVDA",
    assetClass: "stock",
    direction: "long",
    orderType: "market",
    strategyName: "Breakout",
    entryPrice: 525,
    exitPrice: 540,
    stopLoss: 515,
    takeProfit: 540,
    positionSize: 25,
    fees: 4,
    entryDate: daysAgo(8, 14, 0),
    durationMin: 2880,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "confiance",
    emotionScore: 4,
    confidence: 8,
    disciplineScore: 9,
    notes: "Breakout NVDA, TP touché.",
    lessons: "Top trade.",
    status: "closed",
  },
  {
    instrument: "TSLA",
    assetClass: "stock",
    direction: "long",
    orderType: "limit",
    strategyName: "Pullback",
    entryPrice: 238,
    exitPrice: 248,
    stopLoss: 233,
    takeProfit: 248,
    positionSize: 60,
    fees: 4,
    entryDate: daysAgo(3, 10, 0),
    durationMin: 2160,
    entryReason: "selon le plan",
    exitReason: "TP touché",
    ruleViolated: null,
    emotion: "calme",
    emotionScore: 3,
    confidence: 7,
    disciplineScore: 8,
    notes: "Pullback TSLA, TP touché.",
    lessons: "Bon trade.",
    status: "closed",
  },
];

const RULES = [
  {
    title: "Risque max 2% par trade",
    description:
      "Ne jamais risquer plus de 2% du capital sur une seule position. Calcule la taille en fonction du stop.",
    category: "risk",
    severity: "critical",
    isActive: true,
  },
  {
    title: "Toujours set un stop avant l'entrée",
    description:
      "Le stop loss doit être défini avant l'ouverture de la position, jamais après.",
    category: "entry",
    severity: "high",
    isActive: true,
  },
  {
    title: "Pas de trading pendant news à fort impact",
    description:
      "Attendre 15 minutes après une news à fort impact (NFP, FOMC, CPI) avant de trader.",
    category: "entry",
    severity: "high",
    isActive: true,
  },
  {
    title: "Max 3 trades par jour",
    description:
      "Maximum 3 trades par jour pour éviter le surtrading et la fatigue décisionnelle.",
    category: "money_management",
    severity: "medium",
    isActive: true,
  },
  {
    title: "Pas de revenge trading",
    description:
      "Après une perte, attendre au moins 30 minutes avant de reprendre une position.",
    category: "psychology",
    severity: "high",
    isActive: true,
  },
  {
    title: "Fermer toutes les positions avant le weekend",
    description:
      "Aucune position ouverte le vendredi après 20h pour éviter les gaps du weekend.",
    category: "exit",
    severity: "medium",
    isActive: true,
  },
];

const STRATEGIES = [
  { name: "Breakout", description: "Cassure de niveau avec volume", category: "Breakout", color: "emerald" },
  { name: "Pullback", description: "Retracement sur tendance", category: "Pullback", color: "cyan" },
  { name: "Range", description: "Trading dans un range défini", category: "Range", color: "amber" },
  { name: "News", description: "Trading autour des news", category: "News", color: "rose" },
  { name: "Scalp", description: "Mouvements courts et rapides", category: "Scalp", color: "violet" },
  { name: "Trend Following", description: "Suivi de tendance long terme", category: "Trend Following", color: "teal" },
];

function computePnlForTrade(t: SeedTrade): number {
  if (t.status === "open") return 0;
  const dir = t.direction === "long" ? 1 : -1;
  return (t.exitPrice - t.entryPrice) * t.positionSize * dir - t.fees;
}

function computeRRForTrade(t: SeedTrade): number | null {
  if (t.direction === "long") {
    const risk = t.entryPrice - t.stopLoss;
    const reward = t.takeProfit - t.entryPrice;
    if (risk === 0) return null;
    return reward / risk;
  } else {
    const risk = t.stopLoss - t.entryPrice;
    const reward = t.entryPrice - t.takeProfit;
    if (risk === 0) return null;
    return reward / risk;
  }
}

// ============================================================
// Discipline & calibration fields — derived from existing trade data
// (used both at seed time and to backfill pre-existing trades)
// ============================================================

function deriveSession(t: Pick<SeedTrade, "instrument" | "assetClass" | "entryDate">): string {
  const h = t.entryDate.getHours();
  // Crypto: asia for night entries, london/new_york for day entries
  if (t.assetClass === "crypto") {
    if (h < 7 || h >= 22) return "asia";
    if (h >= 7 && h < 12) return "london";
    return "new_york";
  }
  // Stocks: always New York session (US market)
  if (t.assetClass === "stock") return "new_york";
  // Forex: by hour & pair
  if (t.instrument.includes("JPY") && (h < 7 || h >= 23)) return "asia";
  if (h < 7) return "asia";
  if (h < 12) return "london";
  if (h < 16) return "overlap";
  if (h < 22) return "new_york";
  return "sydney";
}

function deriveBias(t: Pick<SeedTrade, "direction" | "ruleViolated" | "emotion" | "exitReason">): string {
  // Counter-trend losers (rule violations) → bias opposite to direction
  const isViolation =
    !!t.ruleViolated ||
    t.emotion === "FOMO" ||
    t.emotion === "avidité" ||
    t.emotion === "frustration" ||
    t.exitReason === "violation des règles";
  if (isViolation && Math.random() < 0.7) {
    return t.direction === "long" ? "bearish" : "bullish";
  }
  // ~20% neutral
  if (Math.random() < 0.2) return "neutral";
  // Otherwise aligned with direction
  return t.direction === "long" ? "bullish" : "bearish";
}

function deriveTimeframe(t: Pick<SeedTrade, "strategyName" | "assetClass">): string {
  if (t.assetClass === "stock") return Math.random() < 0.5 ? "H4" : "D1";
  if (t.assetClass === "crypto") return Math.random() < 0.5 ? "H4" : "H1";
  switch (t.strategyName) {
    case "Scalp":
      return Math.random() < 0.6 ? "M5" : "M15";
    case "News":
      return Math.random() < 0.5 ? "M5" : "M15";
    case "Range":
      return Math.random() < 0.5 ? "M15" : "H1";
    case "Breakout":
      return Math.random() < 0.6 ? "M15" : "H1";
    case "Pullback":
      return Math.random() < 0.5 ? "H1" : "H4";
    case "Trend Following":
      return Math.random() < 0.5 ? "H4" : "D1";
    default:
      return "H1";
  }
}

function deriveRiskPercent(t: Pick<SeedTrade, "ruleViolated" | "emotion" | "disciplineScore">): number {
  const indisciplined =
    !!t.ruleViolated ||
    t.emotion === "FOMO" ||
    t.emotion === "avidité" ||
    t.disciplineScore <= 5;
  if (indisciplined) {
    // 3.0% – 5.0% (overleveraging)
    return Math.round((3 + Math.random() * 2) * 10) / 10;
  }
  // Disciplined: 1.0% – 2.0%
  return Math.round((1 + Math.random() * 1) * 10) / 10;
}

function deriveSetupValid(t: Pick<SeedTrade, "ruleViolated" | "emotion" | "exitReason" | "confidence">): boolean {
  if (t.exitReason === "violation des règles") return false;
  if (t.ruleViolated && t.confidence <= 5) return false;
  if (t.emotion === "FOMO" && Math.random() < 0.7) return false;
  // ~75% true overall
  return Math.random() < 0.75;
}

function deriveRulesFollowed(t: Pick<SeedTrade, "ruleViolated" | "emotion" | "exitReason" | "disciplineScore">): boolean {
  if (t.ruleViolated) return false;
  if (t.exitReason === "violation des règles") return false;
  if (t.emotion === "FOMO" || t.emotion === "frustration") return false;
  if (t.disciplineScore <= 4) return false;
  return true;
}

function deriveBiggestMistake(t: Pick<SeedTrade, "ruleViolated" | "emotion" | "exitReason" | "status">): string | null {
  if (t.status === "open") return null;
  if (t.exitReason === "trop tôt") return "Sortie trop tôt";
  if (t.exitReason === "violation des règles") return "Pas respecté mon plan";
  if (t.emotion === "FOMO") return "FOMO";
  if (t.emotion === "avidité") return "Taille de position excessive";
  if (t.emotion === "frustration") return "Revenge trading";
  if (t.emotion === "peur") return "Sortie trop tôt";
  if (t.emotion === "espoir") return "Entrée impulsive sans confirmation";
  if (t.ruleViolated?.includes("FOMO")) return "FOMO";
  if (t.ruleViolated?.includes("stop")) return "Pas de stop loss";
  if (t.ruleViolated?.includes("news")) return "Ignorer la structure du marché";
  if (t.ruleViolated?.includes("3 trades")) return "Surtrading";
  if (t.ruleViolated?.includes("revenge")) return "Revenge trading";
  if (t.ruleViolated?.includes("Laisser courir")) return "Sortie trop tôt";
  // Disciplined winning trades: no mistake
  return null;
}

function deriveImprovementNext(mistake: string | null): string | null {
  if (!mistake) return Math.random() < 0.3 ? "Journaliser chaque trade" : null;
  switch (mistake) {
    case "Sortie trop tôt":
      return "Laisser courir les gagnants";
    case "Taille de position excessive":
      return "Calculer le risque avant l'entrée";
    case "Entrée impulsive sans confirmation":
      return "Attendre la confirmation de la bougie";
    case "Pas de stop loss":
      return "Respecter le stop initial";
    case "Revenge trading":
      return "Max 3 trades par jour";
    case "Surtrading":
      return "Max 3 trades par jour";
    case "Ignorer la structure du marché":
      return "Ne pas trader pendant les news";
    case "FOMO":
      return "Attendre la confirmation de la bougie";
    case "Pas respecté mon plan":
      return "Revoir le plan avant la séance";
    case "Avoir déplacé mon stop":
      return "Respecter le stop initial";
    default:
      return "Revoir le plan avant la séance";
  }
}

interface DerivedFields {
  marketSession: string;
  marketBias: string;
  timeframe: string;
  riskPercent: number;
  pnlPercent: number | null;
  setupValid: boolean;
  rulesFollowed: boolean;
  biggestMistake: string | null;
  improvementNext: string | null;
}

function deriveNewFields(
  t: SeedTrade,
  pnl: number,
  initialCapital: number
): DerivedFields {
  const session = t.marketSession ?? deriveSession(t);
  const bias = t.marketBias ?? deriveBias(t);
  const timeframe = t.timeframe ?? deriveTimeframe(t);
  const riskPercent = t.riskPercent ?? deriveRiskPercent(t);
  const pnlPercent = initialCapital > 0 ? (pnl / initialCapital) * 100 : null;
  const setupValid = t.setupValid ?? deriveSetupValid(t);
  const rulesFollowed = t.rulesFollowed ?? deriveRulesFollowed(t);
  const biggestMistake =
    t.biggestMistake !== undefined
      ? t.biggestMistake
      : deriveBiggestMistake(t);
  const improvementNext =
    t.improvementNext !== undefined
      ? t.improvementNext
      : deriveImprovementNext(biggestMistake);
  return {
    marketSession: session,
    marketBias: bias,
    timeframe,
    riskPercent,
    pnlPercent,
    setupValid,
    rulesFollowed,
    biggestMistake,
    improvementNext,
  };
}

// Backfill existing trades that lack the new template fields (Task 2 migration)
async function backfillNewFields(): Promise<number> {
  // Use raw SQL to detect unmigrated trades — the dev-server may have an old
  // PrismaClient that doesn't recognise the marketSession column in findMany.
  const unmigrated = await db.$queryRawUnsafe<Array<{ id: string }>>(
    "SELECT id FROM Trade WHERE marketSession IS NULL"
  );
  if (unmigrated.length === 0) return 0;

  const ids = unmigrated.map((r) => r.id);
  const trades = await db.trade.findMany({
    where: { id: { in: ids } },
    include: { account: true, strategy: true },
  });

  for (const t of trades) {
    const seedView: SeedTrade = {
      instrument: t.instrument,
      assetClass: t.assetClass,
      direction: t.direction as "long" | "short",
      orderType: t.orderType,
      strategyName: t.strategy?.name ?? "",
      entryPrice: t.entryPrice,
      exitPrice: t.exitPrice ?? 0,
      stopLoss: t.stopLoss ?? 0,
      takeProfit: t.takeProfit ?? 0,
      positionSize: t.positionSize,
      fees: t.fees,
      entryDate: t.entryDate,
      durationMin: t.durationMin ?? 0,
      entryReason: t.entryReason ?? "",
      exitReason: t.exitReason ?? "",
      ruleViolated: t.ruleViolated,
      emotion: t.emotion ?? "",
      emotionScore: t.emotionScore ?? 5,
      confidence: t.confidence ?? 5,
      disciplineScore: t.disciplineScore ?? 5,
      notes: t.notes ?? "",
      lessons: t.lessons ?? "",
      status: t.status,
    };
    const derived = deriveNewFields(
      seedView,
      t.pnl,
      t.account?.initialCapital ?? 10000
    );
    await updateTradeNewFields(t.id, derived);
  }
  return trades.length;
}

export async function seedDemoData(): Promise<{ accounts: number; trades: number }> {
  // ── Migration: backfill new template fields on pre-existing trades ──
  try {
    await backfillNewFields();
  } catch (e) {
    console.error("backfillNewFields error", e);
  }

  // Check if already seeded
  const existing = await db.account.count();
  if (existing > 0) {
    return { accounts: existing, trades: await db.trade.count() };
  }

  // Strategies
  const strategyMap = new Map<string, string>();
  for (const s of STRATEGIES) {
    const created = await db.strategy.create({ data: s });
    strategyMap.set(s.name, created.id);
  }

  // Accounts
  const forexAccount = await db.account.create({
    data: {
      name: "Forex Primaire",
      broker: "IC Markets",
      initialCapital: 50000,
      currency: "USD",
      color: "emerald",
      isDefault: true,
    },
  });
  const cryptoAccount = await db.account.create({
    data: {
      name: "Crypto Swing",
      broker: "Binance",
      initialCapital: 10000,
      currency: "USD",
      color: "amber",
    },
  });
  const stockAccount = await db.account.create({
    data: {
      name: "Actions US",
      broker: "Interactive Brokers",
      initialCapital: 25000,
      currency: "USD",
      color: "violet",
    },
  });

  // Trades
  const allTradesByAccount: Array<{
    account: string;
    initialCapital: number;
    trades: SeedTrade[];
  }> = [
    { account: forexAccount.id, initialCapital: 50000, trades: FOREX_TRADES },
    { account: cryptoAccount.id, initialCapital: 10000, trades: CRYPTO_TRADES },
    { account: stockAccount.id, initialCapital: 25000, trades: STOCK_TRADES },
  ];

  let tradeCount = 0;
  for (const { account, initialCapital, trades } of allTradesByAccount) {
    for (const t of trades) {
      const pnl = computePnlForTrade(t);
      const rr = computeRRForTrade(t);
      const exitDate =
        t.status === "closed"
          ? new Date(new Date(t.entryDate).getTime() + t.durationMin * 60000)
          : null;
      const derived = deriveNewFields(t, pnl, initialCapital);
      const created = await db.trade.create({
        data: {
          accountId: account,
          strategyId: strategyMap.get(t.strategyName) ?? null,
          instrument: t.instrument,
          assetClass: t.assetClass,
          direction: t.direction,
          orderType: t.orderType,
          entryPrice: t.entryPrice,
          exitPrice: t.status === "closed" ? t.exitPrice : null,
          stopLoss: t.stopLoss,
          takeProfit: t.takeProfit,
          positionSize: t.positionSize,
          pnl,
          fees: t.fees,
          rrRatio: rr,
          entryDate: t.entryDate,
          exitDate,
          durationMin: t.status === "closed" ? t.durationMin : null,
          entryReason: t.entryReason,
          exitReason: t.exitReason,
          ruleViolated: t.ruleViolated,
          emotion: t.emotion,
          emotionScore: t.emotionScore,
          confidence: t.confidence,
          disciplineScore: t.disciplineScore,
          notes: t.notes,
          lessons: t.lessons,
          status: t.status,
        },
      });
      // Write the new discipline/calibration columns via raw SQL — the
      // cached dev-server PrismaClient may not recognise them in .create().
      await updateTradeNewFields(created.id, derived);
      tradeCount++;
    }
  }

  // Rules
  for (const r of RULES) {
    await db.rule.create({ data: r });
  }

  // Psychological checks (last 14 days, varied)
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    // Weekends skip mindfulness sometimes
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const improving = i < 7; // last week better than the prior
    await db.psychologicalCheck.create({
      data: {
        date,
        marketAnalysis: improving ? Math.random() > 0.2 : Math.random() > 0.4,
        reviewPlan: improving ? Math.random() > 0.3 : Math.random() > 0.5,
        journalUpdate: improving ? Math.random() > 0.2 : Math.random() > 0.4,
        mindfulness: isWeekend ? Math.random() > 0.5 : Math.random() > 0.4,
        moodScore: improving ? 7 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 3),
        focusScore: improving ? 7 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 3),
        disciplineScore: improving ? 7 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 4),
        preMarketDone: improving ? Math.random() > 0.2 : Math.random() > 0.5,
        postMarketDone: improving ? Math.random() > 0.3 : Math.random() > 0.5,
        reflection:
          i === 0
            ? "Aujourd'hui j'ai respecté mon plan. Patience et discipline."
            : i < 7
            ? "Semaine en progression, je sens la discipline s'installer."
            : "Semaine difficile, beaucoup d'émotions. Besoin de repos.",
      },
    });
  }

  // Goals
  await db.tradingGoal.createMany({
    data: [
      {
        title: "Respecter le plan sur 30 trades",
        description: "Aucune violation de règle pendant 30 trades consécutifs.",
        targetValue: 30,
        currentValue: 18,
        unit: "trades",
        isAchieved: false,
        deadline: new Date(Date.now() + 30 * 86400000),
      },
      {
        title: "Profit factor > 1.5",
        description: "Atteindre un profit factor de 1.5 sur le mois.",
        targetValue: 1.5,
        currentValue: 1.39,
        unit: "ratio",
        isAchieved: false,
        deadline: new Date(Date.now() + 15 * 86400000),
      },
      {
        title: "Risque max 2% par trade",
        description: "Ne jamais dépasser 2% de risque sur une position.",
        targetValue: 2,
        currentValue: 2,
        unit: "%",
        isAchieved: true,
      },
    ],
  });

  return { accounts: 3, trades: tradeCount };
}
