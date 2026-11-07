import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";

const memberTtlSeconds = 60 * 60 * 24 * 120; // a ten-week run, with room either side
const staffTtlSeconds = 60 * 60 * 12; // one working day

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Add it to .env.local (see .env.example).");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function createToken(subject: string, ttlSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ sub: subject, exp: Date.now() + ttlSeconds * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub: unknown; exp: unknown };
    if (typeof parsed.sub !== "string" || typeof parsed.exp !== "number" || Date.now() > parsed.exp) return null;
    return parsed.sub;
  } catch {
    return null;
  }
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export async function setSessionCookie(memberId: string) {
  const store = await cookies();
  store.set(siteConfig.sessionCookie, createToken(`member:${memberId}`, memberTtlSeconds), cookieOptions(memberTtlSeconds));
  // A member who signs in by link has, in effect, come through the door.
  store.set(siteConfig.enteredCookie, "1", { path: "/", sameSite: "lax", maxAge: memberTtlSeconds });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(siteConfig.sessionCookie);
}

/** The signed-in member's id, or null. */
export async function getSessionMemberId(): Promise<string | null> {
  const store = await cookies();
  const subject = verifyToken(store.get(siteConfig.sessionCookie)?.value);
  return subject?.startsWith("member:") ? subject.slice("member:".length) : null;
}

/** Staff sign in at /admin with ADMIN_SECRET; the cookie lets them preview every week. */
export async function setStaffCookie() {
  const store = await cookies();
  store.set(siteConfig.staffCookie, createToken("staff", staffTtlSeconds), cookieOptions(staffTtlSeconds));
  store.set(siteConfig.enteredCookie, "1", { path: "/", sameSite: "lax", maxAge: staffTtlSeconds });
}

export async function clearStaffCookie() {
  const store = await cookies();
  store.delete(siteConfig.staffCookie);
}

export async function isStaff(): Promise<boolean> {
  if (!process.env.SESSION_SECRET) return false;
  const store = await cookies();
  return verifyToken(store.get(siteConfig.staffCookie)?.value) === "staff";
}
