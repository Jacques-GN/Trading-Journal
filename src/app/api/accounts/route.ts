import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const accounts = await db.account.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        trades: {
          where: { status: "closed" },
          select: { pnl: true },
        },
      },
    });
    const result = accounts.map((a) => {
      const realizedPnl = a.trades.reduce((s, t) => s + t.pnl, 0);
      return {
        id: a.id,
        name: a.name,
        broker: a.broker,
        initialCapital: a.initialCapital,
        currency: a.currency,
        color: a.color,
        isDefault: a.isDefault,
        balance: a.initialCapital + realizedPnl,
        realizedPnl,
        tradesCount: a.trades.length,
        createdAt: a.createdAt,
      };
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/accounts error", e);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, broker, initialCapital, currency, color, isDefault } = body;
    if (!name || typeof initialCapital !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (isDefault) {
      await db.account.updateMany({ data: { isDefault: false } });
    }
    const account = await db.account.create({
      data: {
        name,
        broker: broker ?? null,
        initialCapital,
        currency: currency ?? "USD",
        color: color ?? "emerald",
        isDefault: !!isDefault,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (e) {
    console.error("POST /api/accounts error", e);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
