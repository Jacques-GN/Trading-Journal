import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/seed";

export async function POST() {
  try {
    const result = await seedDemoData();
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST /api/seed error", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await seedDemoData();
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/seed error", e);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
