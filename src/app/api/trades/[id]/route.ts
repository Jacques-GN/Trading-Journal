import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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
    return NextResponse.json(trade);
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
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      positionSize,
      fees,
      entryDate,
      exitDate,
      pnl,
      rrRatio,
      entryReason,
      exitReason,
      ruleViolated,
      emotion,
      emotionScore,
      confidence,
      disciplineScore,
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
    return NextResponse.json(updated);
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
