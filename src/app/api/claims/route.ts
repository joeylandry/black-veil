import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pointClaims } from "@/lib/db/schema";
import { getSessionGuestId } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const guestId = await getSessionGuestId();
  if (!guestId) {
    return NextResponse.json({ error: "Sign in again to submit a claim.", code: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";
  if (label.length < 3) {
    return NextResponse.json({ error: "Describe what you're claiming points for." }, { status: 400 });
  }

  const db = getDb();
  const [claim] = await db.insert(pointClaims).values({ guestId, label, note }).returning();

  return NextResponse.json({
    ok: true,
    claim: {
      id: claim.id,
      label: claim.label,
      note: claim.note,
      points: claim.points,
      status: claim.status,
      submittedAt: claim.submittedAt.toISOString(),
    },
  });
}

export async function GET() {
  const guestId = await getSessionGuestId();
  if (!guestId) {
    return NextResponse.json({ error: "Sign in again.", code: "unauthenticated" }, { status: 401 });
  }

  const db = getDb();
  const claims = await db
    .select()
    .from(pointClaims)
    .where(eq(pointClaims.guestId, guestId))
    .orderBy(desc(pointClaims.submittedAt));

  return NextResponse.json({
    claims: claims.map((claim) => ({
      id: claim.id,
      label: claim.label,
      note: claim.note,
      points: claim.points,
      status: claim.status,
      submittedAt: claim.submittedAt.toISOString(),
    })),
  });
}
