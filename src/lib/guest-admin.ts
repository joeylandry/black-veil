import { inArray } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { ctfSolves, guests, magicLinks, pointClaims, rsvps } from "@/lib/db/schema";

type Db = ReturnType<typeof getDb>;

/** Deletes guests and everything that hangs off them (sign-in links, solves, claims), plus RSVP rows by email. */
export async function deleteGuests(db: Db, guestIds: string[], emails: string[]) {
  if (guestIds.length) {
    await db.delete(magicLinks).where(inArray(magicLinks.guestId, guestIds));
    await db.delete(ctfSolves).where(inArray(ctfSolves.guestId, guestIds));
    await db.delete(pointClaims).where(inArray(pointClaims.guestId, guestIds));
    await db.delete(guests).where(inArray(guests.id, guestIds));
  }
  if (emails.length) await db.delete(rsvps).where(inArray(rsvps.email, emails));
}
