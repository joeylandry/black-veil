import { NextRequest, NextResponse } from "next/server";
import { issueMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const { token } = await issueMagicLink(email, "");
  const url = `${getSiteUrl()}/api/auth/verify?token=${token}`;
  await sendMagicLinkEmail(email, url);

  // Always respond ok, whether or not the email is already registered, so this
  // endpoint can't be used to test which emails have RSVP'd.
  return NextResponse.json({ ok: true });
}
