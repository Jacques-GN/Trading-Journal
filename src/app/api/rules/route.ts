import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rules = await db.rule.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(rules);
  } catch (e) {
    console.error("GET /api/rules error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, severity, isActive } = body;
    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    const rule = await db.rule.create({
      data: {
        title,
        description: description ?? null,
        category: category ?? "risk",
        severity: severity ?? "high",
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(rule, { status: 201 });
  } catch (e) {
    console.error("POST /api/rules error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
