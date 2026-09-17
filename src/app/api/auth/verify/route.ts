import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth/magic-link";
import { setSessionCookie } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${getSiteUrl()}/resume?error=missing-token`);
  }

  const guestId = await consumeMagicLink(token);
  if (!guestId) {
    return NextResponse.redirect(`${getSiteUrl()}/resume?error=invalid-token`);
  }

  await setSessionCookie(guestId);
  return NextResponse.redirect(`${getSiteUrl()}/resume/restored`);
}
