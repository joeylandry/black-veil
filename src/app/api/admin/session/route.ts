import { NextRequest, NextResponse } from "next/server";
import { passphraseMatches } from "@/lib/auth/admin";
import { clearStaffCookie, isStaff, setStaffCookie } from "@/lib/auth/session";

export async function GET() {
  return NextResponse.json({ staff: await isStaff(), configured: Boolean(process.env.ADMIN_SECRET && process.env.SESSION_SECRET) });
}

/** Staff sign-in. The cookie it sets opens /api/admin/* and lets staff read every week. */
export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_SECRET || !process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "ADMIN_SECRET and SESSION_SECRET must both be set on this deployment.", code: "not-configured" }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  const passphrase = typeof body?.passphrase === "string" ? body.passphrase : "";
  if (!passphraseMatches(passphrase)) {
    return NextResponse.json({ error: "That passphrase was rejected.", code: "bad-passphrase" }, { status: 401 });
  }
  await setStaffCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearStaffCookie();
  return NextResponse.json({ ok: true });
}
