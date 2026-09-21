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

  let token: string;
  try {
    ({ token } = await issueMagicLink(email, ""));
  } catch (error) {
    // DATABASE_URL missing on this deployment, an unreachable database, or migrations
    // never applied to it. No link exists and retrying will not conjure one, so say so
    // rather than inviting the guest to keep submitting the form.
    console.error("[request-link] could not issue a sign-in link:", error);
    return NextResponse.json(
      { error: "Sign-in links are not configured on this deployment. Please let the host know." },
      { status: 503 },
    );
  }

  try {
    await sendMagicLinkEmail(email, `${getSiteUrl()}/api/auth/verify?token=${token}`);
  } catch (error) {
    // The link is valid but undeliverable — no or invalid RESEND_API_KEY, or an
    // EMAIL_FROM domain Resend has not verified. Claiming it was sent would leave the
    // guest waiting on an email that is never going to arrive.
    console.error("[request-link] issued a sign-in link but could not email it:", error);
    return NextResponse.json(
      { error: "The sign-in link could not be emailed. Please let the host know." },
      { status: 502 },
    );
  }

  // Always respond ok, whether or not the email is already registered, so this
  // endpoint can't be used to test which emails have RSVP'd.
  return NextResponse.json({ ok: true });
}
