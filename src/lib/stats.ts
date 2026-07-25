// Pure statistics functions for trading analysis
import type { Trade } from "@prisma/client";

export interface EquityPoint {
  i: number;
  date: string;
  balance: number;
  drawdown: number;
  pnl: number;
}

export interface DistributionBucket {
  bucket: string;
  count: number;
  total: number;
  isLoss: boolean;
}

export interface GroupPerformance {
  key: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  avgPnl: number;
}

export interface PeriodPerformance {
  label: string;
  trades: number;
  winRate: number;
  pnl: number;
}

export interface RiskMultipleBucket {
  bucket: string;
  count: number;
  isLoss: boolean;
}

export interface EmotionStat {
  emotion: string;
  trades: number;
  winRate: number;
  avgPnl: number;
  totalPnl: number;
}

// ---------- Discipline & calibration (Task 2) ----------

export interface SessionPerformance {
  session: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  avgPnl: number;
}

export interface TimeframePerformance {
  timeframe: string;
  trades: number;
  winRate: number;
  pnl: number;
  avgRr: number;
}

export interface BiasPerformance {
  bias: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  withTrend: number;
  counterTrend: number;
  counterTrendLossRate: number;
}

export interface DisciplineScore {
  setupValidPct: number;
  rulesFollowedPct: number;
  overallPct: number;
  disciplinedTradesPnl: number;
  indisciplinedTradesPnl: number;
  disciplinedTradesCount: number;
  indisciplinedTradesCount: number;
}

export interface ConfidenceBucket {
  bucket: string;
  trades: number;
  winRate: number;
  avgPnl: number;
}

export interface RiskBucket {
  bucket: string;
  count: number;
  pnl: number;
  isRecommended: boolean;
}

export interface MistakeStat {
  text: string;
  count: number;
  totalLoss: number;
}

export interface ImprovementFollowThrough {
  applied: number;
  notApplied: number;
  winRateAfterApplied: number;
  winRateAfterNotApplied: number;
  followThroughPct: number;
}

export interface SessionStrategyCell {
  session: string;
  strategy: string;
  pnl: number;
  trades: number;
}

export interface StatsResult {
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  lossRate: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  profitLossRatio: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  avgPnl: number;
  bestTrade: number;
  worstTrade: number;
  avgRR: number;
  avgDurationMin: number | null;
  maxDrawdown: number;
  currentStreak: { type: "win" | "loss" | "none"; count: number };
  longestWinStreak: number;
  longestLossStreak: number;
  initialCapital: number;
  endBalance: number;
  returnPct: number;
  kellyCriterion: number;
  avgPositionSize: number;
  equity: EquityPoint[];
  distribution: DistributionBucket[];
  byStrategy: GroupPerformance[];
  byInstrument: GroupPerformance[];
  byPeriod: PeriodPerformance[];
  byExitReason: GroupPerformance[];
  byEntryReason: GroupPerformance[];
  riskMultiples: RiskMultipleBucket[];
  byEmotion: EmotionStat[];
  last20: {
    winRate: number;
    netPnl: number;
    avgRR: number;
    expectancy: number;
  };
  all: {
    winRate: number;
    netPnl: number;
    avgRR: number;
    expectancy: number;
  };
  // Discipline & calibration (Task 2)
  bySession: SessionPerformance[];
  byTimeframe: TimeframePerformance[];
  byBias: BiasPerformance[];
  discipline: DisciplineScore;
  confidenceCalibration: ConfidenceBucket[];
  riskDistribution: RiskBucket[];
  topMistakes: MistakeStat[];
  improvementFollowThrough: ImprovementFollowThrough;
  sessionStrategyMatrix: SessionStrategyCell[];
}

function isWin(t: Trade): boolean {
  return t.pnl > 0;
}
function isLoss(t: Trade): boolean {
  return t.pnl < 0;
}

export function sortTradesByEntry(trades: Trade[]): Trade[] {
  return [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );
}

export function equityCurve(
  trades: Trade[],
  initialCapital: number
): EquityPoint[] {
  const sorted = sortTradesByEntry(trades).filter((t) => t.status === "closed");
  let balance = initialCapital;
  let peak = initialCapital;
  const points: EquityPoint[] = [];
  sorted.forEach((t, i) => {
    balance += t.pnl;
    peak = Math.max(peak, balance);
    const drawdown = peak > 0 ? ((balance - peak) / peak) * 100 : 0;
    points.push({
      i: i + 1,
      date: new Date(t.entryDate).toISOString(),
      balance,
      drawdown,
      pnl: t.pnl,
    });
  });
  return points;
}

export function winRate(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "closed");
  if (closed.length === 0) return 0;
  const wins = closed.filter(isWin).length;
  return (wins / closed.length) * 100;
}

export function profitFactor(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "closed");
  const grossProfit = closed.filter(isWin).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(closed.filter(isLoss).reduce((s, t) => s + t.pnl, 0));
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export function avgWin(trades: Trade[]): number {
  const wins = trades.filter((t) => t.status === "closed").filter(isWin);
  if (wins.length === 0) return 0;
  return wins.reduce((s, t) => s + t.pnl, 0) / wins.length;
}

export function avgLoss(trades: Trade[]): number {
  const losses = trades.filter((t) => t.status === "closed").filter(isLoss);
  if (losses.length === 0) return 0;
  return losses.reduce((s, t) => s + t.pnl, 0) / losses.length;
}

export function expectancy(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === "closed");
  if (closed.length === 0) return 0;
  const wr = winRate(closed) / 100;
  const lr = 1 - wr;
  const aw = avgWin(closed);
  const al = Math.abs(avgLoss(closed));
  return wr * aw - lr * al;
}

export function maxDrawdown(equity: EquityPoint[]): number {
  if (equity.length === 0) return 0;
  let peak = equity[0].balance;
  let maxDd = 0;
  for (const p of equity) {
    peak = Math.max(peak, p.balance);
    const dd = peak > 0 ? ((peak - p.balance) / peak) * 100 : 0;
    maxDd = Math.max(maxDd, dd);
  }
  return maxDd;
}

export function currentStreak(
  trades: Trade[]
): { type: "win" | "loss" | "none"; count: number } {
  const sorted = sortTradesByEntry(
    trades.filter((t) => t.status === "closed")
  ).reverse();
  if (sorted.length === 0) return { type: "none", count: 0 };
  const first = sorted[0];
  if (first.pnl === 0) return { type: "none", count: 0 };
  const type = first.pnl > 0 ? "win" : "loss";
  let count = 0;
  for (const t of sorted) {
    if (type === "win" && t.pnl > 0) count++;
    else if (type === "loss" && t.pnl < 0) count++;
    else break;
  }
  return { type, count };
}

export function longestStreak(
  trades: Trade[],
  type: "win" | "loss"
): number {
  const sorted = sortTradesByEntry(trades.filter((t) => t.status === "closed"));
  let max = 0;
  let cur = 0;
  for (const t of sorted) {
    if (type === "win" && t.pnl > 0) cur++;
    else if (type === "loss" && t.pnl < 0) cur++;
    else cur = 0;
    max = Math.max(max, cur);
  }
  return max;
}

export function distribution(trades: Trade[]): DistributionBucket[] {
  const closed = trades.filter((t) => t.status === "closed");
  const buckets = [
    { min: -Infinity, max: -1000, label: "<-$1k" },
    { min: -1000, max: -500, label: "-$1k à -$500" },
    { min: -500, max: -200, label: "-$500 à -$200" },
    { min: -200, max: -50, label: "-$200 à -$50" },
    { min: -50, max: 0, label: "-$50 à $0" },
    { min: 0, max: 50, label: "$0 à $50" },
    { min: 50, max: 200, label: "$50 à $200" },
    { min: 200, max: 500, label: "$200 à $500" },
    { min: 500, max: 1000, label: "$500 à $1k" },
    { min: 1000, max: Infinity, label: ">$1k" },
  ];
  return buckets.map((b) => {
    const inRange = closed.filter((t) => t.pnl > b.min && t.pnl <= b.max);
    return {
      bucket: b.label,
      count: inRange.length,
      total: inRange.reduce((s, t) => s + t.pnl, 0),
      isLoss: b.max <= 0,
    };
  });
}

export function groupBy(
  trades: Trade[],
  keyFn: (t: Trade) => string | null | undefined
): GroupPerformance[] {
  const closed = trades.filter((t) => t.status === "closed");
  const map = new Map<string, Trade[]>();
  for (const t of closed) {
    const key = keyFn(t);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries())
    .map(([key, ts]) => {
      const wins = ts.filter(isWin).length;
      const losses = ts.filter(isLoss).length;
      const pnl = ts.reduce((s, t) => s + t.pnl, 0);
      return {
        key,
        trades: ts.length,
        wins,
        losses,
        winRate: ts.length ? (wins / ts.length) * 100 : 0,
        pnl,
        avgPnl: ts.length ? pnl / ts.length : 0,
      };
    })
    .sort((a, b) => b.pnl - a.pnl);
}

export function performanceByStrategy(trades: Trade[]): GroupPerformance[] {
  return groupBy(trades, (t) => t.strategyId);
}

export function performanceByInstrument(trades: Trade[]): GroupPerformance[] {
  return groupBy(trades, (t) => t.instrument);
}

export function performanceByExitReason(trades: Trade[]): GroupPerformance[] {
  return groupBy(trades, (t) => t.exitReason);
}

export function performanceByEntryReason(trades: Trade[]): GroupPerformance[] {
  return groupBy(trades, (t) => t.entryReason);
}

export function performanceByEmotion(trades: Trade[]): EmotionStat[] {
  return groupBy(trades, (t) => t.emotion).map((g) => ({
    emotion: g.key,
    trades: g.trades,
    winRate: g.winRate,
    avgPnl: g.avgPnl,
    totalPnl: g.pnl,
  }));
}

function inPeriod(
  trades: Trade[],
  start: Date,
  end: Date
): Trade[] {
  return trades.filter((t) => {
    const d = new Date(t.entryDate);
    return d >= start && d < end;
  });
}

export function performanceByPeriod(trades: Trade[]): PeriodPerformance[] {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = thisMonthStart;
  const thisQuarterStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  const periods = [
    { label: "Ce mois", start: thisMonthStart, end: now },
    { label: "Mois dernier", start: lastMonthStart, end: lastMonthEnd },
    {
      label: "Ce trimestre",
      start: thisQuarterStart,
      end: now,
    },
    { label: "Cette année", start: thisYearStart, end: now },
    { label: "YTD", start: thisYearStart, end: now },
  ];

  return periods.map((p) => {
    const ts = inPeriod(trades, p.start, p.end).filter(
      (t) => t.status === "closed"
    );
    const wins = ts.filter(isWin).length;
    const pnl = ts.reduce((s, t) => s + t.pnl, 0);
    return {
      label: p.label,
      trades: ts.length,
      winRate: ts.length ? (wins / ts.length) * 100 : 0,
      pnl,
    };
  });
}

export function kellyCriterion(trades: Trade[]): number {
  const wr = winRate(trades) / 100;
  if (wr === 0 || wr === 1) return 0;
  const aw = avgWin(trades);
  const al = Math.abs(avgLoss(trades));
  if (al === 0) return 0;
  const r = aw / al;
  const kelly = wr - (1 - wr) / r;
  return kelly * 100;
}

export function riskMultiples(trades: Trade[]): RiskMultipleBucket[] {
  const closed = trades.filter(
    (t) => t.status === "closed" && t.rrRatio != null
  );
  const buckets = [
    { label: "-3R", min: -Infinity, max: -2.5 },
    { label: "-2R", min: -2.5, max: -1.5 },
    { label: "-1R", min: -1.5, max: -0.5 },
    { label: "0R", min: -0.5, max: 0.5 },
    { label: "+1R", min: 0.5, max: 1.5 },
    { label: "+2R", min: 1.5, max: 2.5 },
    { label: "+3R+", min: 2.5, max: Infinity },
  ];
  return buckets.map((b) => ({
    bucket: b.label,
    count: closed.filter((t) => (t.rrRatio ?? 0) > b.min && (t.rrRatio ?? 0) <= b.max)
      .length,
    isLoss: b.max <= 0,
  }));
}

export function avgRR(trades: Trade[]): number {
  const ts = trades.filter(
    (t) => t.status === "closed" && t.rrRatio != null
  );
  if (ts.length === 0) return 0;
  return ts.reduce((s, t) => s + (t.rrRatio ?? 0), 0) / ts.length;
}

export function avgDuration(trades: Trade[]): number | null {
  const ts = trades.filter(
    (t) => t.status === "closed" && t.durationMin != null
  );
  if (ts.length === 0) return null;
  return Math.round(
    ts.reduce((s, t) => s + (t.durationMin ?? 0), 0) / ts.length
  );
}

export function avgPositionSize(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  return trades.reduce((s, t) => s + t.positionSize, 0) / trades.length;
}

export function lastNComparison(
  trades: Trade[],
  n = 20
): {
  last20: { winRate: number; netPnl: number; avgRR: number; expectancy: number };
  all: { winRate: number; netPnl: number; avgRR: number; expectancy: number };
} {
  const sorted = sortTradesByEntry(
    trades.filter((t) => t.status === "closed")
  );
  const last = sorted.slice(-n);
  return {
    last20: {
      winRate: winRate(last),
      netPnl: last.reduce((s, t) => s + t.pnl, 0),
      avgRR: avgRR(last),
      expectancy: expectancy(last),
    },
    all: {
      winRate: winRate(sorted),
      netPnl: sorted.reduce((s, t) => s + t.pnl, 0),
      avgRR: avgRR(sorted),
      expectancy: expectancy(sorted),
    },
  };
}

export function computeStats(
  trades: Trade[],
  initialCapital: number
): StatsResult {
  const closed = trades.filter((t) => t.status === "closed");
  const open = trades.filter((t) => t.status === "open");
  const wins = closed.filter(isWin);
  const losses = closed.filter(isLoss);
  const breakeven = closed.filter((t) => t.pnl === 0);
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const netPnl = closed.reduce((s, t) => s + t.pnl, 0);
  const aw = avgWin(closed);
  const al = Math.abs(avgLoss(closed));
  const wr = winRate(closed);
  const lr = 100 - wr;
  const pf = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  const plr = al === 0 ? 0 : aw / al;
  const equity = equityCurve(closed, initialCapital);
  const exp = (wr / 100) * aw - (lr / 100) * al;
  const endBalance = initialCapital + netPnl;

  return {
    totalTrades: trades.length,
    closedTrades: closed.length,
    openTrades: open.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakevenTrades: breakeven.length,
    winRate: wr,
    lossRate: lr,
    netPnl,
    grossProfit,
    grossLoss,
    profitFactor: pf,
    profitLossRatio: plr,
    avgWin: aw,
    avgLoss: avgLoss(closed),
    expectancy: exp,
    avgPnl: closed.length ? netPnl / closed.length : 0,
    bestTrade: closed.length ? Math.max(...closed.map((t) => t.pnl)) : 0,
    worstTrade: closed.length ? Math.min(...closed.map((t) => t.pnl)) : 0,
    avgRR: avgRR(closed),
    avgDurationMin: avgDuration(closed),
    maxDrawdown: maxDrawdown(equity),
    currentStreak: currentStreak(closed),
    longestWinStreak: longestStreak(closed, "win"),
    longestLossStreak: longestStreak(closed, "loss"),
    initialCapital,
    endBalance,
    returnPct: initialCapital > 0 ? (netPnl / initialCapital) * 100 : 0,
    kellyCriterion: kellyCriterion(closed),
    avgPositionSize: avgPositionSize(closed),
    equity,
    distribution: distribution(closed),
    byStrategy: performanceByStrategy(closed),
    byInstrument: performanceByInstrument(closed),
    byPeriod: performanceByPeriod(closed),
    byExitReason: performanceByExitReason(closed),
    byEntryReason: performanceByEntryReason(closed),
    riskMultiples: riskMultiples(closed),
    byEmotion: performanceByEmotion(closed),
    last20: lastNComparison(closed, 20).last20,
    all: lastNComparison(closed, 20).all,
    // Discipline & calibration (Task 2)
    bySession: performanceBySession(closed),
    byTimeframe: performanceByTimeframe(closed),
    byBias: performanceByBias(closed),
    discipline: disciplineScore(closed),
    confidenceCalibration: confidenceCalibration(closed),
    riskDistribution: riskDistribution(closed),
    topMistakes: topMistakes(closed),
    improvementFollowThrough: improvementFollowThrough(closed),
    sessionStrategyMatrix: sessionStrategyMatrix(closed),
  };
}

// Compute P/L from trade data (used in form auto-calc)
export function computePnl(input: {
  direction: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  fees: number;
}): number {
  const dir = input.direction === "long" ? 1 : -1;
  return (input.exitPrice - input.entryPrice) * input.positionSize * dir - input.fees;
}

export function computeRR(input: {
  entryPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  direction: string;
}): number | null {
  if (input.stopLoss == null || input.takeProfit == null) return null;
  if (input.direction === "long") {
    const risk = input.entryPrice - input.stopLoss;
    const reward = input.takeProfit - input.entryPrice;
    if (risk === 0) return null;
    return reward / risk;
  } else {
    const risk = input.stopLoss - input.entryPrice;
    const reward = input.entryPrice - input.takeProfit;
    if (risk === 0) return null;
    return reward / risk;
  }
}

export function computeDurationMin(entry: Date, exit: Date): number {
  return Math.max(1, Math.round((exit.getTime() - entry.getTime()) / 60000));
}

// ============================================================
// Discipline & calibration functions (Task 2)
// ============================================================

const SESSION_ORDER = ["london", "new_york", "asia", "sydney", "overlap"];
const TIMEFRAME_ORDER = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

export function performanceBySession(trades: Trade[]): SessionPerformance[] {
  const closed = trades.filter((t) => t.status === "closed");
  const map = new Map<string, Trade[]>();
  for (const t of closed) {
    const s = t.marketSession ?? "unknown";
    if (!map.has(s)) map.set(s, []);
    map.get(s)!.push(t);
  }
  const results: SessionPerformance[] = [];
  for (const session of SESSION_ORDER) {
    const ts = map.get(session);
    if (!ts || ts.length === 0) {
      results.push({
        session,
        trades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        pnl: 0,
        avgPnl: 0,
      });
      continue;
    }
    const wins = ts.filter(isWin).length;
    const losses = ts.filter(isLoss).length;
    const pnl = ts.reduce((s, t) => s + t.pnl, 0);
    results.push({
      session,
      trades: ts.length,
      wins,
      losses,
      winRate: ts.length ? (wins / ts.length) * 100 : 0,
      pnl,
      avgPnl: ts.length ? pnl / ts.length : 0,
    });
  }
  // Include unknown sessions (if any) at the end
  for (const [session, ts] of map.entries()) {
    if (SESSION_ORDER.includes(session)) continue;
    const wins = ts.filter(isWin).length;
    const losses = ts.filter(isLoss).length;
    const pnl = ts.reduce((s, t) => s + t.pnl, 0);
    results.push({
      session,
      trades: ts.length,
      wins,
      losses,
      winRate: ts.length ? (wins / ts.length) * 100 : 0,
      pnl,
      avgPnl: ts.length ? pnl / ts.length : 0,
    });
  }
  return results;
}

export function performanceByTimeframe(trades: Trade[]): TimeframePerformance[] {
  const closed = trades.filter((t) => t.status === "closed");
  const map = new Map<string, Trade[]>();
  for (const t of closed) {
    const tf = t.timeframe ?? "—";
    if (!map.has(tf)) map.set(tf, []);
    map.get(tf)!.push(t);
  }
  const results: TimeframePerformance[] = [];
  for (const tf of TIMEFRAME_ORDER) {
    const ts = map.get(tf);
    if (!ts || ts.length === 0) continue;
    const wins = ts.filter(isWin).length;
    const pnl = ts.reduce((s, t) => s + t.pnl, 0);
    const rrVals = ts
      .map((t) => t.rrRatio)
      .filter((r): r is number => r != null);
    const avgRr = rrVals.length
      ? rrVals.reduce((s, r) => s + r, 0) / rrVals.length
      : 0;
    results.push({
      timeframe: tf,
      trades: ts.length,
      winRate: ts.length ? (wins / ts.length) * 100 : 0,
      pnl,
      avgRr,
    });
  }
  return results;
}

function isCounterTrend(t: Trade): boolean {
  if (!t.marketBias || t.marketBias === "neutral") return false;
  if (t.direction === "long" && t.marketBias === "bearish") return true;
  if (t.direction === "short" && t.marketBias === "bullish") return true;
  return false;
}

export function performanceByBias(trades: Trade[]): BiasPerformance[] {
  const closed = trades.filter((t) => t.status === "closed");
  const biases = ["bullish", "bearish", "neutral"];
  return biases.map((bias) => {
    const ts = closed.filter((t) => (t.marketBias ?? "neutral") === bias);
    const wins = ts.filter(isWin).length;
    const losses = ts.filter(isLoss).length;
    const pnl = ts.reduce((s, t) => s + t.pnl, 0);
    const counter = ts.filter(isCounterTrend);
    const withTrend = ts.length - counter.length;
    const counterLosses = counter.filter(isLoss).length;
    return {
      bias,
      trades: ts.length,
      wins,
      losses,
      winRate: ts.length ? (wins / ts.length) * 100 : 0,
      pnl,
      withTrend,
      counterTrend: counter.length,
      counterTrendLossRate: counter.length
        ? (counterLosses / counter.length) * 100
        : 0,
    };
  });
}

export function disciplineScore(trades: Trade[]): DisciplineScore {
  const closed = trades.filter((t) => t.status === "closed");
  if (closed.length === 0) {
    return {
      setupValidPct: 0,
      rulesFollowedPct: 0,
      overallPct: 0,
      disciplinedTradesPnl: 0,
      indisciplinedTradesPnl: 0,
      disciplinedTradesCount: 0,
      indisciplinedTradesCount: 0,
    };
  }
  const setupValidCount = closed.filter((t) => t.setupValid === true).length;
  const rulesCount = closed.filter((t) => t.rulesFollowed === true).length;
  const disciplined = closed.filter(
    (t) => t.setupValid === true && t.rulesFollowed === true
  );
  const indisciplined = closed.filter(
    (t) => !(t.setupValid === true && t.rulesFollowed === true)
  );
  const disciplinedPnl = disciplined.reduce((s, t) => s + t.pnl, 0);
  const indisciplinedPnl = indisciplined.reduce((s, t) => s + t.pnl, 0);
  return {
    setupValidPct: (setupValidCount / closed.length) * 100,
    rulesFollowedPct: (rulesCount / closed.length) * 100,
    overallPct:
      ((setupValidCount + rulesCount) / (closed.length * 2)) * 100,
    disciplinedTradesPnl: disciplinedPnl,
    indisciplinedTradesPnl: indisciplinedPnl,
    disciplinedTradesCount: disciplined.length,
    indisciplinedTradesCount: indisciplined.length,
  };
}

export function confidenceCalibration(trades: Trade[]): ConfidenceBucket[] {
  const closed = trades.filter(
    (t) => t.status === "closed" && t.confidence != null
  );
  const buckets = [
    { label: "1-3", min: 1, max: 3 },
    { label: "4-6", min: 4, max: 6 },
    { label: "7-8", min: 7, max: 8 },
    { label: "9-10", min: 9, max: 10 },
  ];
  return buckets.map((b) => {
    const ts = closed.filter(
      (t) => (t.confidence ?? 0) >= b.min && (t.confidence ?? 0) <= b.max
    );
    const wins = ts.filter(isWin).length;
    const pnl = ts.reduce((s, t) => s + t.pnl, 0);
    return {
      bucket: b.label,
      trades: ts.length,
      winRate: ts.length ? (wins / ts.length) * 100 : 0,
      avgPnl: ts.length ? pnl / ts.length : 0,
    };
  });
}

export function riskDistribution(trades: Trade[]): RiskBucket[] {
  const closed = trades.filter(
    (t) => t.status === "closed" && t.riskPercent != null
  );
  const buckets = [
    { label: "<1%", min: -Infinity, max: 1, isRecommended: false },
    { label: "1-2%", min: 1, max: 2, isRecommended: true },
    { label: "2-3%", min: 2, max: 3, isRecommended: false },
    { label: "3-5%", min: 3, max: 5, isRecommended: false },
    { label: ">5%", min: 5, max: Infinity, isRecommended: false },
  ];
  return buckets.map((b) => {
    const ts = closed.filter(
      (t) => (t.riskPercent ?? 0) >= b.min && (t.riskPercent ?? 0) < b.max
    );
    return {
      bucket: b.label,
      count: ts.length,
      pnl: ts.reduce((s, t) => s + t.pnl, 0),
      isRecommended: b.isRecommended,
    };
  });
}

// Common recurring mistake keywords — when biggestMistake text contains one of these
// substrings (lowercase), it counts toward that mistake category.
const MISTAKE_KEYWORDS: Array<{ key: string; patterns: string[] }> = [
  { key: "Sortie trop tôt", patterns: ["sortie trop tôt", "trop tôt", "sorti avant", "sortie précoce"] },
  { key: "Taille de position excessive", patterns: ["taille", "position excessive", "surdimensionné", "lot trop"] },
  { key: "Entrée impulsive sans confirmation", patterns: ["impulsive", "impulsif", "sans confirmation", "entrée précipitée", "précipit"] },
  { key: "Pas de stop loss", patterns: ["pas de stop", "sans stop", "stop loss manquant", "no stop"] },
  { key: "Revenge trading", patterns: ["revenge", "revanche", "rattraper"] },
  { key: "Stop déplacé", patterns: ["déplacé", "déplacer", "stop déplacé", "bougé le stop", "écarté le stop"] },
  { key: "Surtrading", patterns: ["surtrading", "sur-trading", "trop de trades", "trop de positions"] },
  { key: "Ignorer la structure du marché", patterns: ["structure", "ignorer", "à contre-tendance", "contre tendance"] },
  { key: "FOMO", patterns: ["fomo", "peur de manquer"] },
  { key: "Pas respecté mon plan", patterns: ["plan", "respecté", "respecter", "non respect"] },
  { key: "Éviter les news", patterns: ["news", "actualité", "nfp", "fomc", "cpi"] },
  { key: "Avoir déplacé mon stop", patterns: ["déplacé mon stop", "stop trop tard", "stop élargi"] },
];

export function topMistakes(trades: Trade[]): MistakeStat[] {
  const counts = new Map<string, { count: number; loss: number }>();
  for (const t of trades) {
    if (!t.biggestMistake) continue;
    const raw = t.biggestMistake.toLowerCase();
    let matched = false;
    for (const { key, patterns } of MISTAKE_KEYWORDS) {
      if (patterns.some((p) => raw.includes(p))) {
        const e = counts.get(key) ?? { count: 0, loss: 0 };
        e.count += 1;
        e.loss += Math.min(0, t.pnl);
        counts.set(key, e);
        matched = true;
        break;
      }
    }
    // If no keyword matched, use the trimmed text as its own category
    if (!matched) {
      const key = t.biggestMistake.trim().slice(0, 60);
      if (!key) continue;
      const e = counts.get(key) ?? { count: 0, loss: 0 };
      e.count += 1;
      e.loss += Math.min(0, t.pnl);
      counts.set(key, e);
    }
  }
  return Array.from(counts.entries())
    .map(([text, v]) => ({
      text,
      count: v.count,
      totalLoss: Math.abs(v.loss),
    }))
    .sort((a, b) => b.count - a.count || b.totalLoss - a.totalLoss)
    .slice(0, 8);
}

export function improvementFollowThrough(
  trades: Trade[]
): ImprovementFollowThrough {
  const sorted = sortTradesByEntry(trades);
  let applied = 0;
  let notApplied = 0;
  let appliedWins = 0;
  let notAppliedWins = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const t = sorted[i];
    const next = sorted[i + 1];
    if (!t.improvementNext) continue;
    if (next.rulesFollowed === true) {
      applied += 1;
      if (next.status === "closed" && next.pnl > 0) appliedWins += 1;
    } else {
      notApplied += 1;
      if (next.status === "closed" && next.pnl > 0) notAppliedWins += 1;
    }
  }
  const total = applied + notApplied;
  return {
    applied,
    notApplied,
    winRateAfterApplied: applied ? (appliedWins / applied) * 100 : 0,
    winRateAfterNotApplied: notApplied
      ? (notAppliedWins / notApplied) * 100
      : 0,
    followThroughPct: total ? (applied / total) * 100 : 0,
  };
}

export function sessionStrategyMatrix(
  trades: Trade[]
): SessionStrategyCell[] {
  const closed = trades.filter((t) => t.status === "closed");
  const map = new Map<string, { pnl: number; trades: number }>();
  for (const t of closed) {
    const session = t.marketSession ?? "unknown";
    const strategy = t.strategyId ?? "none";
    const key = `${session}__${strategy}`;
    const e = map.get(key) ?? { pnl: 0, trades: 0 };
    e.pnl += t.pnl;
    e.trades += 1;
    map.set(key, e);
  }
  const cells: SessionStrategyCell[] = [];
  for (const [key, v] of map.entries()) {
    const [session, strategy] = key.split("__");
    cells.push({
      session,
      strategy,
      pnl: v.pnl,
      trades: v.trades,
    });
  }
  return cells;
}
