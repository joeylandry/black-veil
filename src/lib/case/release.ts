import { siteConfig } from "@/config/site";

const weekMs = 7 * 24 * 60 * 60 * 1000;

export type RunSchedule = {
  /** The moment Week 1 unseals for every location in the run. */
  week1At: Date;
  /** Staff override from /admin: weeks up to this number are open regardless of date. */
  releasedThrough: number;
};

/** When week `week` unseals for a run: Week 1's moment plus a week per week. */
export function weekOpensAt(schedule: Pick<RunSchedule, "week1At">, week: number) {
  return new Date(schedule.week1At.getTime() + (week - 1) * weekMs);
}

/**
 * How many weeks are open for a run right now (0–10). Every location in a run shares one
 * schedule, so nobody gets a week early. Staff can only open weeks early, never close one.
 */
export function weeksReleased(schedule: RunSchedule, now: Date = new Date()) {
  let byDate = 0;
  for (let week = 1; week <= siteConfig.weeks; week += 1) {
    if (now.getTime() >= weekOpensAt(schedule, week).getTime()) byDate = week;
  }
  const override = Math.max(0, Math.min(siteConfig.weeks, Math.floor(schedule.releasedThrough || 0)));
  return Math.max(byDate, override);
}

export function isWeekReleased(schedule: RunSchedule, week: number, now: Date = new Date()) {
  return week >= 1 && week <= weeksReleased(schedule, now);
}
