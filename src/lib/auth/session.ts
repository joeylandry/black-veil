import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const cookieName = "black-veil-session";
const sessionTtlSeconds = 60 * 60 * 24 * 180; // 180 days — the event is a year out; a guest should stay signed in.

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

export function createSessionToken(guestId: string) {
  const payload = JSON.stringify({ guestId, exp: Date.now() + sessionTtlSeconds * 1000 });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifySessionToken(token: string): { guestId: string } | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
      guestId: string;
      exp: number;
    };
    if (typeof payload.guestId !== "string" || Date.now() > payload.exp) return null;
    return { guestId: payload.guestId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(guestId: string) {
  const store = await cookies();
  store.set(cookieName, createSessionToken(guestId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionTtlSeconds,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(cookieName);
}

/** Reads and verifies the session cookie for the current request. Null if signed out or the cookie is invalid/expired. */
export async function getSessionGuestId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  return verifySessionToken(token)?.guestId ?? null;
}
