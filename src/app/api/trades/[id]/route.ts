import { NextRequest, NextResponse } from "next/server";
import { db, enrichTradesWithNewFields, updateTradeNewFields } from "@/lib/db";
import { computePnl, computeRR, computeDurationMin } from "@/lib/stats";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trade = await db.trade.findUnique({
      where: { id },
      include: { strategy: true, account: true },
    });
    if (!trade) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [enriched] = await enrichTradesWithNewFields([trade]);
    return NextResponse.json(enriched);
  } catch (e) {
    console.error("GET /api/trades/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      accountId,
      strategyId,
      instrument,
      assetClass,
      direction,
      orderType,
      // Task 2 — handled via raw SQL below
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

    let finalPnl = typeof pnl === "number" ? pnl : undefined;
    let finalRR = typeof rrRatio === "number" ? rrRatio : undefined;
    let durationMin: number | null | undefined = undefined;

    if (status === "closed" && exitPrice != null && entryPrice != null && direction) {
      if (finalPnl === undefined) {
        finalPnl = computePnl({
          direction,
          entryPrice,
          exitPrice,
          positionSize: positionSize ?? 1,
          fees: fees ?? 0,
        });
      }
      if (finalRR === undefined) {
        finalRR = computeRR({ entryPrice, stopLoss, takeProfit, direction });
      }
      if (exitDate && entryDate) {
        durationMin = computeDurationMin(new Date(entryDate), new Date(exitDate));
      }
    } else if (status === "open") {
      durationMin = null;
    }

    // Auto-compute pnlPercent when P/L changes
    let finalPnlPercent: number | null | undefined = undefined;
    if (pnlPercent !== undefined) {
      finalPnlPercent = pnlPercent;
    } else if (finalPnl !== undefined && accountId) {
      const account = await db.account.findUnique({ where: { id: accountId } });
      const cap = account?.initialCapital ?? 0;
      finalPnlPercent = cap > 0 ? (finalPnl / cap) * 100 : null;
    }

    const updated = await db.trade.update({
      where: { id },
      data: {
        ...(accountId != null ? { accountId } : {}),
        ...(strategyId !== undefined ? { strategyId: strategyId || null } : {}),
        ...(instrument != null ? { instrument } : {}),
        ...(assetClass != null ? { assetClass } : {}),
        ...(direction != null ? { direction } : {}),
        ...(orderType != null ? { orderType } : {}),
        ...(entryPrice != null ? { entryPrice } : {}),
        ...(exitPrice !== undefined ? { exitPrice: status === "closed" ? exitPrice : null } : {}),
        ...(stopLoss !== undefined ? { stopLoss: stopLoss ?? null } : {}),
        ...(takeProfit !== undefined ? { takeProfit: takeProfit ?? null } : {}),
        ...(positionSize != null ? { positionSize } : {}),
        ...(fees != null ? { fees } : {}),
        ...(entryDate != null ? { entryDate: new Date(entryDate) } : {}),
        ...(exitDate !== undefined ? { exitDate: exitDate ? new Date(exitDate) : null } : {}),
        ...(finalPnl !== undefined ? { pnl: finalPnl } : {}),
        ...(finalRR !== undefined ? { rrRatio: finalRR } : {}),
        ...(durationMinInput !== undefined ? { durationMin: durationMinInput } : {}),
        ...(durationMin !== undefined ? { durationMin } : {}),
        ...(entryReason !== undefined ? { entryReason: entryReason ?? null } : {}),
        ...(exitReason !== undefined ? { exitReason: exitReason ?? null } : {}),
        ...(ruleViolated !== undefined ? { ruleViolated: ruleViolated || null } : {}),
        ...(emotion !== undefined ? { emotion: emotion ?? null } : {}),
        ...(emotionScore !== undefined ? { emotionScore: emotionScore ?? null } : {}),
        ...(confidence !== undefined ? { confidence: confidence ?? null } : {}),
        ...(disciplineScore !== undefined ? { disciplineScore: disciplineScore ?? null } : {}),
        ...(notes !== undefined ? { notes: notes ?? null } : {}),
        ...(lessons !== undefined ? { lessons: lessons ?? null } : {}),
        ...(status != null ? { status } : {}),
      },
      include: { strategy: true, account: true },
    });

    // Apply the new discipline/calibration fields via raw SQL.
    const newFieldsUpdate: Parameters<typeof updateTradeNewFields>[1] = {};
    if (marketSession !== undefined) newFieldsUpdate.marketSession = marketSession ?? null;
    if (marketBias !== undefined) newFieldsUpdate.marketBias = marketBias ?? null;
    if (timeframe !== undefined) newFieldsUpdate.timeframe = timeframe ?? null;
    if (riskPercent !== undefined) newFieldsUpdate.riskPercent = riskPercent ?? null;
    if (finalPnlPercent !== undefined) newFieldsUpdate.pnlPercent = finalPnlPercent;
    if (setupValid !== undefined) newFieldsUpdate.setupValid = setupValid ?? null;
    if (rulesFollowed !== undefined) newFieldsUpdate.rulesFollowed = rulesFollowed ?? null;
    if (biggestMistake !== undefined) newFieldsUpdate.biggestMistake = biggestMistake || null;
    if (improvementNext !== undefined) newFieldsUpdate.improvementNext = improvementNext || null;
    await updateTradeNewFields(id, newFieldsUpdate);

    const [enriched] = await enrichTradesWithNewFields([updated]);
    return NextResponse.json(enriched);
  } catch (e) {
    console.error("PUT /api/trades/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.trade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/trades/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
