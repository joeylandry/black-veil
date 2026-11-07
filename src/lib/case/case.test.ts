import { test } from "node:test";
import assert from "node:assert/strict";
import { answerMatches, makeAccessCode, normalizeAccessCode, normalizeAnswer } from "./text";
import { isWeekReleased, weekOpensAt, weeksReleased } from "./release";
import { dealIntoTeams, teamStandings } from "./scoring";
import { exhibits } from "@/data/case/exhibits";
import { sprints } from "@/data/case/sprints";
import { findingAnswers } from "@/data/case/answers";
import { siteConfig } from "@/config/site";
import { benchLabs } from "@/data/bench";

test("answers ignore case, punctuation, accents and a leading article", () => {
  assert.equal(normalizeAnswer("Montréal, Que."), "montrealque");
  assert.ok(answerMatches("11.47", findingAnswers[1]));
  assert.ok(answerMatches("the counting room", findingAnswers[4]));
  assert.ok(answerMatches("Counting Room", findingAnswers[4]));
  assert.ok(answerMatches("montréal", findingAnswers[6]));
  assert.ok(!answerMatches("", findingAnswers[1]));
  assert.ok(!answerMatches("the", findingAnswers[4]));
  assert.ok(!answerMatches("Boston", findingAnswers[6]));
});

test("access codes avoid look-alike characters", () => {
  for (let i = 0; i < 200; i += 1) {
    const code = makeAccessCode();
    assert.match(code, /^[A-HJKMNP-Z2-9]{6}$/);
  }
  assert.equal(normalizeAccessCode(" ab-c 12 "), "ABC12");
});

test("weeks open on schedule, and staff can only open early", () => {
  const week1At = new Date("2027-01-11T14:00:00Z");
  const schedule = { week1At, releasedThrough: 0 };
  assert.equal(weeksReleased(schedule, new Date("2027-01-11T13:59:59Z")), 0);
  assert.equal(weeksReleased(schedule, week1At), 1);
  assert.equal(weekOpensAt(schedule, 3).toISOString(), "2027-01-25T14:00:00.000Z");
  assert.equal(weeksReleased(schedule, new Date("2027-01-25T14:00:00Z")), 3);
  assert.equal(weeksReleased(schedule, new Date("2030-01-01T00:00:00Z")), siteConfig.weeks);
  assert.equal(weeksReleased({ week1At, releasedThrough: 5 }, new Date("2026-01-01T00:00:00Z")), 5);
  assert.equal(weeksReleased({ week1At, releasedThrough: 99 }, new Date("2026-01-01T00:00:00Z")), siteConfig.weeks);
  assert.equal(weeksReleased({ week1At, releasedThrough: 1 }, new Date("2027-01-25T14:00:00Z")), 3);
  assert.ok(!isWeekReleased(schedule, 0, new Date("2030-01-01T00:00:00Z")));
});

test("team score is the rounded member average plus awards, ties share a rank", () => {
  const teams = [
    { id: "a", name: "Atlantic", locationId: "l", locationName: "Room" },
    { id: "b", name: "Bedford", locationId: "l", locationName: "Room" },
    { id: "c", name: "Congress", locationId: "l", locationName: "Room" },
  ];
  const members = [
    { id: "1", teamId: "a", points: 30 },
    { id: "2", teamId: "a", points: 10 },
    { id: "3", teamId: "b", points: 20 },
    { id: "4", teamId: null, points: 99 },
  ];
  const rows = teamStandings(teams, members, [{ teamId: "c", points: 20 }]);
  assert.deepEqual(
    rows.map((row) => [row.name, row.score, row.rank]),
    [
      ["Atlantic", 20, 1],
      ["Bedford", 20, 1],
      ["Congress", 20, 1],
    ],
  );
  assert.equal(rows.find((row) => row.name === "Atlantic")?.average, 20);
  assert.equal(rows.find((row) => row.name === "Congress")?.members, 0);
});

test("dealing keeps team sizes within one of each other", () => {
  const members = Array.from({ length: 60 }, (_, i) => ({ id: String(i), teamId: i < 5 ? "t1" : null }));
  const teamIds = ["t1", "t2", "t3", "t4", "t5", "t6"];
  const deal = dealIntoTeams(members, teamIds);
  assert.equal(deal.size, 55);
  const sizes = teamIds.map((id) => members.filter((m) => (deal.get(m.id) ?? m.teamId) === id).length);
  assert.deepEqual(sizes, [10, 10, 10, 10, 10, 10]);
});

test("the case file is complete and consistent", () => {
  assert.equal(exhibits.length, siteConfig.weeks);
  assert.equal(sprints.length, siteConfig.weeks);
  for (let week = 1; week <= siteConfig.weeks; week += 1) {
    const exhibit = exhibits.find((item) => item.week === week);
    const sprint = sprints.find((item) => item.week === week);
    assert.ok(exhibit, `exhibit for week ${week}`);
    assert.ok(sprint, `sprint for week ${week}`);
    assert.equal(sprint.exhibitSlug, exhibit.slug, `week ${week} sprint points at its exhibit`);
    assert.ok(findingAnswers[week]?.length, `answers for week ${week}`);
    if (sprint.simulation.labId) {
      assert.ok(benchLabs.some((lab) => lab.id === sprint.simulation.labId), `week ${week} lab exists`);
    }
  }
  assert.equal(new Set(exhibits.map((item) => item.slug)).size, exhibits.length, "slugs are unique");
});

test("every finding's first accepted answer appears in its exhibit's visible text", () => {
  for (const exhibit of exhibits) {
    const visible = JSON.stringify(exhibit.blocks).replace(/\{\{x:\d+\}\}/g, " ");
    const answers = findingAnswers[exhibit.week];
    const found = answers.some((answer) => normalizeAnswer(visible).includes(normalizeAnswer(answer)));
    assert.ok(found, `week ${exhibit.week}: an accepted answer is readable in the exhibit`);
  }
});
