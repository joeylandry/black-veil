import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { attempts, solves } from "@/lib/db/schema";
import { findingKey, getMemberProgress, getViewer } from "@/lib/case/file";
import { answerMatches } from "@/lib/case/text";
import { findingAnswers } from "@/data/case/answers";
import { siteConfig } from "@/config/site";

/** Answer a week's finding. Checked here, against answers that never leave the server. */
export async function POST(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer.member) {
    return NextResponse.json({ error: "Join the file or sign in to answer.", code: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const week = Number(body?.week);
  const answer = typeof body?.answer === "string" ? body.answer.trim().slice(0, 200) : "";
  if (!Number.isInteger(week) || week < 1 || week > siteConfig.weeks) {
    return NextResponse.json({ error: "No such week." }, { status: 400 });
  }
  if (!answer) return NextResponse.json({ error: "Write an answer first." }, { status: 400 });
  if (week > viewer.weeks) {
    return NextResponse.json({ error: "That exhibit is still sealed." }, { status: 403 });
  }

  const key = findingKey(week);
  try {
    const progress = await getMemberProgress(viewer.member.id);
    if (progress.solved.has(key)) return NextResponse.json({ correct: true, already: true, remaining: 0 });

    const wrong = progress.wrongByKey.get(key) ?? 0;
    if (wrong >= siteConfig.findingAttempts) {
      return NextResponse.json({ correct: false, locked: true, remaining: 0 });
    }

    const correct = answerMatches(answer, findingAnswers[week] ?? []);
    const db = await getDb();
    await db.insert(attempts).values({ memberId: viewer.member.id, key, answer, correct });
    if (correct) {
      await db.insert(solves).values({ memberId: viewer.member.id, key, points: siteConfig.findingPoints }).onConflictDoNothing();
      return NextResponse.json({ correct: true, points: siteConfig.findingPoints, remaining: 0 });
    }
    const remaining = siteConfig.findingAttempts - wrong - 1;
    return NextResponse.json({ correct: false, locked: remaining <= 0, remaining });
  } catch (error) {
    console.error("[finding]", error);
    return NextResponse.json({ error: "The file could not be reached. Try again in a minute." }, { status: 503 });
  }
}
