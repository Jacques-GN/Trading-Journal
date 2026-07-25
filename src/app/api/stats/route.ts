import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeStats } from "@/lib/stats";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId required" },
        { status: 400 }
      );
    }
    const account = await db.account.findUnique({ where: { id: accountId } });
    if (!account)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const trades = await db.trade.findMany({
      where: { accountId },
      include: { strategy: true },
      orderBy: { entryDate: "asc" },
    });

    const stats = computeStats(trades, account.initialCapital);
    // Enrich byStrategy with strategy name + color
    const strategies = await db.strategy.findMany();
    const stratMap = new Map(strategies.map((s) => [s.id, s]));
    const byStrategyEnriched = stats.byStrategy.map((g) => {
      const s = stratMap.get(g.key);
      return {
        ...g,
        name: s?.name ?? g.key,
        color: s?.color ?? "cyan",
        category: s?.category ?? null,
      };
    });

    return NextResponse.json({
      ...stats,
      byStrategy: byStrategyEnriched,
      account: {
        id: account.id,
        name: account.name,
        initialCapital: account.initialCapital,
        currency: account.currency,
        color: account.color,
      },
    });
  } catch (e) {
    console.error("GET /api/stats error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
