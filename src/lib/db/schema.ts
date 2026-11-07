import { boolean, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

/**
 * A run is one cohort of the program: four locations of about sixty people each, all on
 * the same ten-week schedule. Week 1 unseals at week1At; every week after that seven days
 * later, for every location at once.
 */
export const runs = pgTable("runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  week1At: timestamp("week1_at", { withTimezone: true }).notNull(),
  /** Staff override: weeks up to this number are open regardless of the date. 0 = follow the calendar. */
  releasedThrough: integer("released_through").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One room of one run. People join a location with its access code. */
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  accessCode: text("access_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** A group of people in one location who work the file together and share a score. */
export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationId: uuid("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("teams_location_name_unique").on(table.locationId, table.name)],
);

/** A person on the file, keyed by email. Joining with an access code creates the row and signs the device in. */
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  locationId: uuid("location_id").references(() => locations.id, { onDelete: "set null" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One-time sign-in tokens. Only the sha256 of the emailed token is stored. */
export const magicLinks = pgTable("magic_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Points a member has earned, one row per thing solved: `finding-03` for a week's
 * finding, `sim-03` for a week's simulation, `extra-…` for Easter eggs. Written only by the
 * server after it has checked the work, so this table is the score.
 */
export const solves = pgTable(
  "solves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    points: integer("points").notNull(),
    solvedAt: timestamp("solved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("solves_member_key_unique").on(table.memberId, table.key)],
);

/** Every answer submitted to a finding, right or wrong. Wrong ones count toward the attempt limit. */
export const attempts = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  answer: text("answer").notNull(),
  correct: boolean("correct").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Points staff give a whole team: the in-room game, a deliberation round, a good catch. */
export const awards = pgTable("awards", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
