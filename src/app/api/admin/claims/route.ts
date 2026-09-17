import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests, pointClaims } from "@/lib/db/schema";
import { isAuthorizedAdmin } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const statusFilter = request.nextUrl.searchParams.get("status");
  const db = getDb();
  const rows = await db
    .select({
      id: pointClaims.id,
      label: pointClaims.label,
      note: pointClaims.note,
      points: pointClaims.points,
      status: pointClaims.status,
      submittedAt: pointClaims.submittedAt,
      guestFullName: guests.fullName,
      guestEmail: guests.email,
    })
    .from(pointClaims)
    .innerJoin(guests, eq(pointClaims.guestId, guests.id))
    .orderBy(desc(pointClaims.submittedAt));

  const filtered = statusFilter ? rows.filter((row) => row.status === statusFilter) : rows;

  return NextResponse.json({
    claims: filtered.map((row) => ({ ...row, submittedAt: row.submittedAt.toISOString() })),
  });
}
