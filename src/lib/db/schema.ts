import { boolean, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const rsvps = pgTable("rsvps", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  attending: text("attending", { enum: ["yes", "no"] }).notNull(),
  note: text("note").notNull().default(""),
  dressAcknowledged: boolean("dress_acknowledged").notNull().default(false),
  attendanceStatus: text("attendance_status", {
    enum: ["invited", "confirmed", "declined", "waitlisted"],
  }),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * A guest's identity, keyed by the email they RSVP'd or signed in with. Created on
 * first RSVP save; magic-link sign-in resolves back to this row so progress and a
 * character (once assigned) follow the guest across devices, not just one browser.
 */
export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  characterId: uuid("character_id").references(() => characters.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One-time passwordless sign-in tokens. Only tokenHash (sha256 of the emailed token)
 * is stored, never the raw token, so a database read alone can't be used to sign in.
 */
export const magicLinks = pgTable("magic_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id").notNull().references(() => guests.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Public + private character content. Only the public fields are ever sent to a client. */
export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterName: text("character_name").notNull(),
  occupation: text("occupation").notNull(),
  publicBiography: text("public_biography").notNull(),
  factions: jsonb("factions").$type<string[]>().notNull().default([]),
  privateBiography: text("private_biography").notNull().default(""),
  secrets: jsonb("secrets").$type<string[]>().notNull().default([]),
  objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
  murderer: boolean("murderer").notNull().default(false),
  victim: boolean("victim").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One row per guest per solved challenge. Flags are checked server-side against
 * src/data/ctf.ts (never sent to the client) before a row is written here, so this
 * table is itself the tamper-resistant record of what a guest actually solved.
 */
export const ctfSolves = pgTable(
  "ctf_solves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    guestId: uuid("guest_id").notNull().references(() => guests.id),
    challengeId: text("challenge_id").notNull(),
    solvedAt: timestamp("solved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("ctf_solves_guest_challenge_unique").on(table.guestId, table.challengeId)],
);

/**
 * A guest's claim to points for something staff must verify in person during the
 * event (an in-character objective, a physical task) rather than an auto-checked
 * flag. Stays "pending" until a staff member approves or rejects it from /admin.
 */
export const pointClaims = pgTable("point_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id").notNull().references(() => guests.id),
  label: text("label").notNull(),
  note: text("note").notNull().default(""),
  points: integer("points"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
});
