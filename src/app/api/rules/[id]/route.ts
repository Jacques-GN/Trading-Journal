import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, category, severity, isActive } = body;
    const updated = await db.rule.update({
      where: { id },
      data: {
        ...(title != null ? { title } : {}),
        ...(description !== undefined ? { description: description ?? null } : {}),
        ...(category != null ? { category } : {}),
        ...(severity != null ? { severity } : {}),
        ...(isActive != null ? { isActive } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/rules/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.rule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/rules/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
