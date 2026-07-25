import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const strategies = await db.strategy.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(strategies);
  } catch (e) {
    console.error("GET /api/strategies error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, category, color } = body;
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const strategy = await db.strategy.create({
      data: {
        name,
        description: description ?? null,
        category: category ?? null,
        color: color ?? "cyan",
      },
    });
    return NextResponse.json(strategy, { status: 201 });
  } catch (e) {
    console.error("POST /api/strategies error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
