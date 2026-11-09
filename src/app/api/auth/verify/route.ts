import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth/magic-link";
import { setSessionCookie } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(`${getSiteUrl()}/sign-in?error=missing-token`);

  const memberId = await consumeMagicLink(token).catch(() => null);
  if (!memberId) return NextResponse.redirect(`${getSiteUrl()}/sign-in?error=invalid-token`);

  await setSessionCookie(memberId);
  return NextResponse.redirect(`${getSiteUrl()}/file`);
}
