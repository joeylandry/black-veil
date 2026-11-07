import { NextRequest, NextResponse } from "next/server";
import { issueMagicLink } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "A valid email address, please." }, { status: 400 });
  }

  try {
    const issued = await issueMagicLink(email);
    if (issued) await sendMagicLinkEmail(email, `${getSiteUrl()}/api/auth/verify?token=${issued.token}`);
  } catch (error) {
    console.error("[request-link]", error);
    return NextResponse.json({ error: "The link could not be sent just now. Try again in a minute." }, { status: 503 });
  }

  // Same answer whether or not the email is on the file, so this can't be used to test addresses.
  return NextResponse.json({ ok: true });
}
