import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await db.account.findUnique({ where: { id } });
    if (!account)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(account);
  } catch (e) {
    console.error("GET /api/accounts/[id] error", e);
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
    const { name, broker, initialCapital, currency, color, isDefault } = body;
    if (isDefault) {
      await db.account.updateMany({ data: { isDefault: false } });
    }
    const updated = await db.account.update({
      where: { id },
      data: {
        ...(name != null ? { name } : {}),
        ...(broker != null ? { broker } : {}),
        ...(initialCapital != null ? { initialCapital } : {}),
        ...(currency != null ? { currency } : {}),
        ...(color != null ? { color } : {}),
        ...(isDefault != null ? { isDefault } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT /api/accounts/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.account.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/accounts/[id] error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
