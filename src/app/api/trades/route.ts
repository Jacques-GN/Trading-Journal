import { NextRequest, NextResponse } from "next/server";
import { db, enrichTradesWithNewFields, updateTradeNewFields } from "@/lib/db";
import { computePnl, computeRR, computeDurationMin } from "@/lib/stats";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const instrument = searchParams.get("instrument");
    const strategyId = searchParams.get("strategyId");
    const result = searchParams.get("result");

    const where: Record<string, unknown> = {};
    if (accountId) where.accountId = accountId;
    if (strategyId) where.strategyId = strategyId;
    if (instrument) {
      where.instrument = { contains: instrument, mode: "insensitive" };
    }
    if (from || to) {
      const e: Record<string, unknown> = {};
      if (from) e.gte = new Date(from);
      if (to) e.lte = new Date(to);
      where.entryDate = e;
    }
    if (result === "win") where.pnl = { gt: 0 };
    if (result === "loss") where.pnl = { lt: 0 };

    const trades = await db.trade.findMany({
      where,
      orderBy: { entryDate: "desc" },
      include: { strategy: true, account: true },
    });
    // Merge the new discipline/calibration fields via raw SQL (workaround
    // for the dev-server Prisma client cache that doesn't know the new cols).
    const enriched = await enrichTradesWithNewFields(trades);
    return NextResponse.json(enriched);
  } catch (e) {
    console.error("GET /api/trades error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountId,
      strategyId,
      instrument,
      assetClass,
      direction,
      orderType,
      // Market context (Task 2) — written via raw SQL below
      marketSession,
      marketBias,
      timeframe,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      positionSize,
      riskPercent,
      fees,
      entryDate,
      exitDate,
      pnl,
      pnlPercent,
      rrRatio,
      setupValid,
      rulesFollowed,
      durationMin: durationMinInput,
      entryReason,
      exitReason,
      ruleViolated,
      emotion,
      emotionScore,
      confidence,
      disciplineScore,
      biggestMistake,
      improvementNext,
      notes,
      lessons,
      status,
    } = body;

    if (!accountId || !instrument || !direction || entryPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch account for pnlPercent auto-computation
    const account = await db.account.findUnique({ where: { id: accountId } });
    const initialCapital = account?.initialCapital ?? 0;

    // Auto-compute P/L, R/R, duration
    let finalPnl = typeof pnl === "number" ? pnl : 0;
    let finalRR = typeof rrRatio === "number" ? rrRatio : null;
    let durationMin: number | null = null;

    if (status === "closed" && exitPrice != null) {
      if (finalPnl === 0) {
        finalPnl = computePnl({
          direction,
          entryPrice,
          exitPrice,
          positionSize: positionSize ?? 1,
          fees: fees ?? 0,
        });
      }
      if (finalRR == null) {
        finalRR = computeRR({ entryPrice, stopLoss, takeProfit, direction });
      }
      if (exitDate) {
        durationMin = computeDurationMin(
          new Date(entryDate),
          new Date(exitDate)
        );
      }
    }

    // Auto-compute pnlPercent if not provided
    const finalPnlPercent =
      typeof pnlPercent === "number"
        ? pnlPercent
        : initialCapital > 0
        ? (finalPnl / initialCapital) * 100
        : null;

    const trade = await db.trade.create({
      data: {
        accountId,
        strategyId: strategyId || null,
        instrument,
        assetClass: assetClass ?? "forex",
        direction,
        orderType: orderType ?? "market",
        entryPrice,
        exitPrice: status === "closed" ? exitPrice : null,
        stopLoss: stopLoss ?? null,
        takeProfit: takeProfit ?? null,
        positionSize: positionSize ?? 1,
        pnl: finalPnl,
        fees: fees ?? 0,
        rrRatio: finalRR,
        entryDate: new Date(entryDate),
        exitDate: exitDate ? new Date(exitDate) : null,
        durationMin: typeof durationMinInput === "number" ? durationMinInput : durationMin,
        entryReason: entryReason ?? null,
        exitReason: exitReason ?? null,
        ruleViolated: ruleViolated || null,
        emotion: emotion ?? null,
        emotionScore: emotionScore ?? null,
        confidence: confidence ?? null,
        disciplineScore: disciplineScore ?? null,
        notes: notes ?? null,
        lessons: lessons ?? null,
        status: status ?? "closed",
      },
      include: { strategy: true, account: true },
    });

    // Write the new discipline/calibration fields via raw SQL.
    await updateTradeNewFields(trade.id, {
      marketSession: marketSession ?? null,
      marketBias: marketBias ?? null,
      timeframe: timeframe ?? null,
      riskPercent: riskPercent != null ? riskPercent : null,
      pnlPercent: finalPnlPercent,
      setupValid: setupValid != null ? setupValid : null,
      rulesFollowed: rulesFollowed != null ? rulesFollowed : null,
      biggestMistake: biggestMistake || null,
      improvementNext: improvementNext || null,
    });

    const [enriched] = await enrichTradesWithNewFields([trade]);
    return NextResponse.json(enriched, { status: 201 });
  } catch (e) {
    console.error("POST /api/trades error", e);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
