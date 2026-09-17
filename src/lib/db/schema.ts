import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
