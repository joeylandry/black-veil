import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pointClaims } from "@/lib/db/schema";
import { isAuthorizedAdmin } from "@/lib/auth/admin";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/claims/[id]">) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "approved" && decision !== "rejected") {
    return NextResponse.json({ error: 'decision must be "approved" or "rejected".' }, { status: 400 });
  }

  let points: number | null = null;
  if (decision === "approved") {
    points = Number(body?.points);
    if (!Number.isFinite(points) || points < 0) {
      return NextResponse.json({ error: "A non-negative points value is required to approve." }, { status: 400 });
    }
  }

  const db = getDb();
  const [updated] = await db
    .update(pointClaims)
    .set({
      status: decision,
      points,
      reviewedAt: new Date(),
      reviewedBy: typeof body?.reviewedBy === "string" && body.reviewedBy.trim() ? body.reviewedBy.trim() : "staff",
    })
    .where(eq(pointClaims.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Claim not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
