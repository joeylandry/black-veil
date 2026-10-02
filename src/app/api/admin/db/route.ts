import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { characters, ctfSolves, guests, pointClaims, rsvps } from "@/lib/db/schema";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import { deleteGuests } from "@/lib/demo/seed";
import { ctfChallenges } from "@/data/ctf";
import { benchLabs, benchSolveId } from "@/data/bench";

/**
 * Staff-only editor for the register: GET returns every table the event uses; POST
 * creates, updates or deletes one row. Each table has its own whitelist of editable
 * fields, so nothing outside them can be written through here.
 */

const challengeOptions = [
  ...ctfChallenges.map((challenge) => ({ id: challenge.id, label: `${challenge.number} · ${challenge.title}` })),
  ...benchLabs.map((lab) => ({ id: benchSolveId(lab.id), label: `${lab.ticket} · ${lab.title}` })),
];
const challengeIds = new Set(challengeOptions.map((option) => option.id));

class InputError extends Error {}

const uuid = (value: unknown, what: string) => {
  if (typeof value !== "string" || !/^[0-9a-f-]{36}$/i.test(value)) throw new InputError(`${what} is missing or malformed.`);
  return value;
};
const text = (value: unknown, what: string, { min = 0, max = 4000 } = {}) => {
  const result = typeof value === "string" ? value.trim() : "";
  if (result.length < min) throw new InputError(`${what} is required.`);
  return result.slice(0, max);
};
const email = (value: unknown) => {
  const result = text(value, "Email", { min: 1, max: 320 }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(result)) throw new InputError("That email doesn't look valid.");
  return result;
};
/** Accepts an array of strings or newline/comma-separated text. */
const list = (value: unknown, separator: RegExp) =>
  (Array.isArray(value) ? value : typeof value === "string" ? value.split(separator) : [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);

function characterFields(data: Record<string, unknown>) {
  return {
    characterName: text(data.characterName, "Character name", { min: 1, max: 200 }),
    occupation: text(data.occupation, "Occupation", { max: 200 }),
    publicBiography: text(data.publicBiography, "Public biography"),
    factions: list(data.factions, /,/),
    privateBiography: text(data.privateBiography, "Private biography"),
    secrets: list(data.secrets, /\n/),
    objectives: list(data.objectives, /\n/),
    murderer: data.murderer === true,
    victim: data.victim === true,
    active: data.active !== false,
  };
}

export async function GET(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    const db = getDb();
    const [guestRows, rsvpRows, characterRows, claimRows, solveRows] = await Promise.all([
      db.select().from(guests).orderBy(guests.fullName),
      db.select().from(rsvps).orderBy(desc(rsvps.createdAt)),
      db.select().from(characters).orderBy(characters.characterName),
      db.select().from(pointClaims).orderBy(desc(pointClaims.submittedAt)),
      db.select().from(ctfSolves).orderBy(desc(ctfSolves.solvedAt)),
    ]);
    return NextResponse.json({
      guests: guestRows,
      rsvps: rsvpRows,
      characters: characterRows,
      claims: claimRows,
      solves: solveRows,
      challenges: challengeOptions,
    });
  } catch (error) {
    return adminDatabaseError("database editor read", error);
  }
}

export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const op = body?.op;
  const table = body?.table;
  const data: Record<string, unknown> = body?.data && typeof body.data === "object" ? body.data : {};
  const db = getDb();

  try {
    if (table === "guests") {
      const id = uuid(body?.id, "Guest");
      const [guest] = await db.select().from(guests).where(eq(guests.id, id)).limit(1);
      if (!guest) return NextResponse.json({ error: "That guest no longer exists." }, { status: 404 });

      if (op === "delete") {
        await deleteGuests(db, [id], [guest.email]);
        return NextResponse.json({ ok: true, message: `Removed ${guest.fullName} and everything attached to them.` });
      }
      if (op === "update") {
        const nextEmail = email(data.email);
        const characterId = data.characterId ? uuid(data.characterId, "Character") : null;
        if (characterId) {
          const [holder] = await db.select().from(guests).where(eq(guests.characterId, characterId)).limit(1);
          if (holder && holder.id !== id) {
            return NextResponse.json({ error: `That character already belongs to ${holder.fullName}. Take it from them first.` }, { status: 409 });
          }
        }
        await db
          .update(guests)
          .set({ fullName: text(data.fullName, "Name", { min: 1, max: 200 }), email: nextEmail, characterId })
          .where(eq(guests.id, id));
        // RSVPs are joined to guests by email, so an email edit carries their RSVP rows with it.
        if (nextEmail !== guest.email) await db.update(rsvps).set({ email: nextEmail }).where(eq(rsvps.email, guest.email));
        return NextResponse.json({ ok: true, message: "Guest saved." });
      }
    }

    if (table === "rsvps") {
      const id = uuid(body?.id, "RSVP");
      if (op === "delete") {
        await db.delete(rsvps).where(eq(rsvps.id, id));
        return NextResponse.json({ ok: true, message: "RSVP removed." });
      }
      if (op === "update") {
        const attending = data.attending === "no" ? "no" : "yes";
        await db
          .update(rsvps)
          .set({
            fullName: text(data.fullName, "Name", { min: 1, max: 200 }),
            email: email(data.email),
            attending,
            attendanceStatus: attending === "yes" ? "confirmed" : "declined",
            note: text(data.note, "Note", { max: 500 }),
          })
          .where(eq(rsvps.id, id));
        return NextResponse.json({ ok: true, message: "RSVP saved." });
      }
    }

    if (table === "characters") {
      if (op === "create") {
        await db.insert(characters).values(characterFields(data));
        return NextResponse.json({ ok: true, message: "Character created." });
      }
      const id = uuid(body?.id, "Character");
      if (op === "update") {
        await db.update(characters).set(characterFields(data)).where(eq(characters.id, id));
        return NextResponse.json({ ok: true, message: "Character saved." });
      }
      if (op === "delete") {
        await db.update(guests).set({ characterId: null }).where(eq(guests.characterId, id));
        await db.delete(characters).where(eq(characters.id, id));
        return NextResponse.json({ ok: true, message: "Character removed." });
      }
    }

    if (table === "claims") {
      const id = uuid(body?.id, "Claim");
      if (op === "delete") {
        await db.delete(pointClaims).where(eq(pointClaims.id, id));
        return NextResponse.json({ ok: true, message: "Claim removed." });
      }
      if (op === "update") {
        const status = data.status === "approved" || data.status === "rejected" ? data.status : "pending";
        const points = data.points === "" || data.points === null || data.points === undefined ? null : Number(data.points);
        if (points !== null && (!Number.isInteger(points) || points < 0)) throw new InputError("Points must be a whole number, 0 or more.");
        if (status === "approved" && points === null) throw new InputError("An approved claim needs points.");
        await db
          .update(pointClaims)
          .set({
            label: text(data.label, "Label", { min: 1, max: 200 }),
            note: text(data.note, "Note", { max: 1000 }),
            points: status === "approved" ? points : null,
            status,
            reviewedAt: status === "pending" ? null : new Date(),
            reviewedBy: status === "pending" ? null : "staff",
          })
          .where(eq(pointClaims.id, id));
        return NextResponse.json({ ok: true, message: "Claim saved." });
      }
    }

    if (table === "solves") {
      if (op === "create") {
        const guestId = uuid(data.guestId, "Guest");
        const challengeId = text(data.challengeId, "Challenge", { min: 1, max: 100 });
        if (!challengeIds.has(challengeId)) throw new InputError("Pick a challenge from the list.");
        await db.insert(ctfSolves).values({ guestId, challengeId }).onConflictDoNothing();
        return NextResponse.json({ ok: true, message: "Solve recorded." });
      }
      if (op === "delete") {
        await db.delete(ctfSolves).where(eq(ctfSolves.id, uuid(body?.id, "Solve")));
        return NextResponse.json({ ok: true, message: "Solve removed." });
      }
    }
  } catch (error) {
    if (error instanceof InputError) return NextResponse.json({ error: error.message }, { status: 400 });
    // Postgres unique_violation: today that can only be a guest email already in use.
    if ((error as { cause?: { code?: string } })?.cause?.code === "23505" || (error as { code?: string })?.code === "23505") {
      return NextResponse.json({ error: "Another guest already uses that email." }, { status: 409 });
    }
    return adminDatabaseError(`database editor ${op} ${table}`, error);
  }

  return NextResponse.json({ error: "Unknown table or operation." }, { status: 400 });
}
