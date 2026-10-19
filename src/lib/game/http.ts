import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getSessionGuestId } from "@/lib/auth/session";
import type { GameDb } from "./service";

/** The database, typed for the game service. */
export function gameDb(): GameDb {
  return getDb() as unknown as GameDb;
}

const noStore = { "Cache-Control": "no-store" };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}

/** The signed-in guest's id, or the 401 to send back. */
export async function requireGuest(): Promise<{ guestId: string } | { response: NextResponse }> {
  const guestId = await getSessionGuestId();
  if (!guestId) return { response: json({ error: "Sign in again.", code: "unauthenticated" }, 401) };
  return { guestId };
}
