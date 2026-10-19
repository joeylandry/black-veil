import { inArray, or } from "drizzle-orm";
import type { getDb } from "@/lib/db/client";
import { ctfSolves, gameEvents, gameGrades, gameSubmissions, guests, magicLinks, pointClaims, rsvps } from "@/lib/db/schema";

type Db = ReturnType<typeof getDb>;

/** Deletes guests and everything that hangs off them (sign-in links, solves, claims, game answers and grades), plus RSVP rows by email. */
export async function deleteGuests(db: Db, guestIds: string[], emails: string[]) {
  if (guestIds.length) {
    await db.delete(magicLinks).where(inArray(magicLinks.guestId, guestIds));
    await db.delete(ctfSolves).where(inArray(ctfSolves.guestId, guestIds));
    await db.delete(pointClaims).where(inArray(pointClaims.guestId, guestIds));
    await db.delete(gameGrades).where(inArray(gameGrades.guestId, guestIds));
    await db.delete(gameSubmissions).where(inArray(gameSubmissions.guestId, guestIds));
    await db.delete(gameEvents).where(or(inArray(gameEvents.guestId, guestIds), inArray(gameEvents.byGuestId, guestIds)));
    await db.delete(guests).where(inArray(guests.id, guestIds));
  }
  if (emails.length) await db.delete(rsvps).where(inArray(rsvps.email, emails));
}
