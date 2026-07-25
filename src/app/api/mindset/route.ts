import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const check = await db.psychologicalCheck.findFirst({
      where: { date: { gte: start, lt: end } },
    });

    // Also fetch last 30 days for trends
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const recent = await db.psychologicalCheck.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "asc" },
    });

    // Compute streak of consecutive completed check-ins
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const dStart = new Date(today);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setDate(dEnd.getDate() + 1);
      const c = recent.find((c) => {
        const cd = new Date(c.date);
        return cd >= dStart && cd < dEnd;
      });
      if (c && (c.marketAnalysis || c.reviewPlan || c.journalUpdate || c.mindfulness)) {
        streak++;
      } else if (i === 0) {
        // today not done yet, do not break streak
        continue;
      } else {
        break;
      }
    }

    if (!check) {
      return NextResponse.json({
        id: null,
        date: start.toISOString(),
        marketAnalysis: false,
        reviewPlan: false,
        journalUpdate: false,
        mindfulness: false,
        moodScore: null,
        focusScore: null,
        disciplineScore: null,
        preMarketDone: false,
        postMarketDone: false,
        reflection: null,
        streak,
        recent,
      });
    }
    return NextResponse.json({ ...check, streak, recent });
  } catch (e) {
    console.error("GET /api/mindset error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      date,
      marketAnalysis,
      reviewPlan,
      journalUpdate,
      mindfulness,
      moodScore,
      focusScore,
      disciplineScore,
      preMarketDone,
      postMarketDone,
      reflection,
    } = body;

    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const existing = await db.psychologicalCheck.findFirst({
      where: { date: { gte: start, lt: end } },
    });

    const data = {
      marketAnalysis: !!marketAnalysis,
      reviewPlan: !!reviewPlan,
      journalUpdate: !!journalUpdate,
      mindfulness: !!mindfulness,
      moodScore: moodScore ?? null,
      focusScore: focusScore ?? null,
      disciplineScore: disciplineScore ?? null,
      preMarketDone: !!preMarketDone,
      postMarketDone: !!postMarketDone,
      reflection: reflection ?? null,
    };

    let result;
    if (existing) {
      result = await db.psychologicalCheck.update({
        where: { id: existing.id },
        data,
      });
    } else {
      result = await db.psychologicalCheck.create({
        data: { ...data, date: start },
      });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("POST /api/mindset error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
