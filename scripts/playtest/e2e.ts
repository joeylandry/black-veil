/* eslint-disable @typescript-eslint/no-explicit-any -- the browser objects come from playwright-core, loaded at run time */
/**
 * The end-to-end playthrough. It plays whole nights against the REAL app (a production build on a real
 * Postgres), with a test clock that walks through the evening: nothing is opened by hand.
 *
 *   - 24 guests are created and given their character by name, as on the night
 *   - at 8:00 p.m. every card opens by itself (no admin login)
 *   - guests do their objectives, claim host-approved ones with Bartend Joe's word, race their groups,
 *     the Butler sells the vial, the House closes at 9:00, the book closes at 10:30
 *   - the host grades (the only time /admin is used), applies "Claude's" verdicts, and publishes
 *   - every guest's published total is compared with the engine's own scoring of the same night
 *
 * Some guests are chosen to stay home, and some play badly, using the same simulated players as
 * info-sim.ts. Screenshots of phones and the staff page are taken along the way.
 *
 *   BASE=http://localhost:3100 DATABASE_URL=... npx tsx scripts/playtest/e2e.ts [runs] [outDir]
 *
 * Needs: the app running with the test clock preload (see docs/game/README.md), playwright-core,
 * and Chromium (CHROME env var).
 */
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import postgres from "postgres";
import { characterById, characters, questions, survivorIds } from "@/data/game";
import { glassCode, markers } from "@/data/game/props";
import { autoGrade } from "@/lib/game/grading";
import { computeStandings } from "@/lib/game/scoring";
import { round2 } from "@/lib/game/text";
import type { Submission, Truth } from "@/lib/game/types";
import { runNight } from "./info-sim";

const BASE = process.env.BASE ?? "http://localhost:3100";
const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://postgres:pw@localhost:5432/blackveil";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "test-secret-123";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "adminpw";
const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const PLAYWRIGHT = process.env.PLAYWRIGHT_CORE ?? "playwright-core";
const CLOCK_FILE = "/tmp/bvclock/offset";

const runs = Number(process.argv[2] ?? 10);
const outDir = process.argv[3] ?? "/tmp/black-veil-playtest";

const sql = postgres(DATABASE_URL, { max: 4, onnotice: () => undefined });

// ---------------------------------------------------------------- the clock, the session, the calls
const at = (time: string) => new Date(`2026-10-23T${time}-04:00`).getTime();
/** Moves the app's clock, then waits long enough for it to notice (it re-reads the offset every 25 ms). */
async function setClock(time: string) {
  writeFileSync(CLOCK_FILE, String(at(time) - Date.now()));
  await new Promise((resolve) => setTimeout(resolve, 80));
}
function tokenFor(guestId: string) {
  const payload = Buffer.from(JSON.stringify({ guestId, exp: Date.now() + 1000 * 60 * 60 * 24 * 90 })).toString("base64url");
  return `${payload}.${createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url")}`;
}
async function call(guestId: string | null, method: string, path: string, body?: unknown, admin = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (guestId) headers.Cookie = `black-veil-session=${tokenFor(guestId)}`;
  if (admin) headers.Authorization = `Bearer ${ADMIN_SECRET}`;
  const response = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: response.status, json };
}

// ---------------------------------------------------------------- the database
async function resetDatabase() {
  await sql.unsafe(`DO $$ DECLARE t text; BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '\\_\\_%' AND tablename NOT LIKE 'drizzle%' LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(t) || ' RESTART IDENTITY CASCADE'; END LOOP; END $$;`);
}
async function createGuests(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const character of characters) {
    const email = `${character.id}@playtest.example`;
    const [row] = await sql`insert into guests (email, full_name) values (${email}, ${character.realNames[0]}) returning id`;
    await sql`insert into rsvps (full_name, email, attending, dress_acknowledged, attendance_status, recorded_at) values (${character.realNames[0]}, ${email}, 'yes', true, 'confirmed', now())`;
    ids.set(character.id, row.id);
  }
  return ids;
}

// ---------------------------------------------------------------- screenshots
type Shot = { file: string; caption: string };
async function openBrowser() {
  const require = createRequire(`${process.cwd()}/`);
  const { chromium } = require(PLAYWRIGHT);
  return chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const browser = await openBrowser();
  const summary: string[] = [];
  const allShots: Record<string, Shot[]> = {};
  let failures = 0;

  for (let run = 1; run <= runs; run += 1) {
    const label = `run${String(run).padStart(2, "0")}`;
    const dir = `${outDir}/${label}`;
    mkdirSync(dir, { recursive: true });
    const shots: Shot[] = [];
    allShots[label] = shots;
    const full = run === 1; // the first night is photographed step by step; the rest get the key moments
    const problems: string[] = [];
    const check = (ok: boolean, message: string) => {
      if (!ok) {
        problems.push(message);
        console.log(`  ✗ ${label}: ${message}`);
      }
    };

    // the night's plan: who stays home, who plays how, what each guest types
    const absences = [0, 0, 1, 2, 2, 3, 3, 4, 5, 5][(run - 1) % 10];
    const talks = [12, 16, 10, 14, 18, 12, 10, 15, 11, 9][(run - 1) % 10];
    // night 7: the Butler stays home, so the host has to hand the vial to the first survivor by hand afterwards
    const butlerAbsent = run === 7;
    const night = runNight({ seed: 7000 + run * 101, absent: absences, talks, secretShare: 0.3, earn: 0.85, butlerAbsent });
    const presentIds = new Set(night.present);

    await resetDatabase();
    const guestIds = await createGuests();
    const idOf = (slug: string) => guestIds.get(slug)!;

    // one browser context per photographed guest
    const contexts = new Map<string, any>();
    async function phone(slug: string) {
      if (!contexts.has(slug)) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
        await context.addCookies([{ name: "black-veil-session", value: tokenFor(idOf(slug)), url: BASE }]);
        contexts.set(slug, context);
      }
      const page = await contexts.get(slug).newPage();
      return page;
    }
    async function staffPage() {
      const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
      await context.addInitScript((secret: string) => sessionStorage.setItem("black-veil-admin-secret", secret), ADMIN_SECRET);
      const page = await context.newPage();
      return { page, context };
    }
    let n = 0;
    async function snap(page: any, name: string, caption: string, fullPage = true) {
      n += 1;
      const file = `${dir}/${String(n).padStart(2, "0")}-${name}.png`;
      await page.screenshot({ path: file, fullPage });
      shots.push({ file, caption });
    }
    /** A phone screen is 844 px tall: shoot the game card section by section, the way a guest scrolls it. */
    async function snapPhone(page: any, name: string, caption: string, maxParts = 4) {
      const box = await page.locator(".game-app").first().boundingBox().catch(() => null);
      const top = box ? box.y : 0;
      const height = box ? box.height : 844;
      const parts = Math.max(1, Math.min(maxParts, Math.ceil(height / 700)));
      for (let part = 0; part < parts; part += 1) {
        await page.evaluate((y: number) => window.scrollTo(0, y), Math.max(0, top - 150 + part * 700));
        await page.waitForTimeout(120);
        await snap(page, `${name}-${String.fromCharCode(97 + part)}`, parts > 1 ? `${caption} (screen ${part + 1} of ${parts})` : caption, false);
      }
    }
    async function snapEl(locator: any, name: string, caption: string) {
      await locator.scrollIntoViewIfNeeded();
      n += 1;
      const file = `${dir}/${String(n).padStart(2, "0")}-${name}.png`;
      await locator.screenshot({ path: file });
      shots.push({ file, caption });
    }
    /** Every objective on the private tab, one picture each: this is how each guest's own ways to answer look. */
    async function snapObjectives(page: any, slug: string, who: string) {
      const cards = page.locator("li.game-errand");
      const count = await cards.count();
      for (let index = 0; index < count; index += 1) {
        const card = cards.nth(index);
        const title = (await card.locator("h4").first().innerText()).trim();
        await snapEl(card, `${slug}-objective-${index + 1}`, `${who}'s objective ${index + 1}: "${title}".`);
      }
      const race = page.locator(".game-panel", { hasText: "Act fast or lose this point" }).first();
      await snapEl(race, `${slug}-race`, `${who}'s group race: act fast or lose the point.`);
    }
    const openTab = async (page: any, tab: string) => {
      await page.getByRole("tab", { name: tab }).click();
      await page.waitForTimeout(150);
    };
    async function openGame(slug: string) {
      const page = await phone(slug);
      await page.goto(`${BASE}/game`, { waitUntil: "networkidle" });
      await page.waitForSelector(".game-app, .game-soon", { timeout: 15000 });
      return page;
    }

    // ------------------------------------------------ 19:50: sealed
    await setClock("19:50:00");
    const sealed = await call(idOf("anika"), "GET", "/api/game/card");
    check(sealed.json?.status === "sealed", `before eight the card should be sealed, got ${sealed.json?.status}`);
    check(!JSON.stringify(sealed.json).match(/Mahns|objective|secret/i), "the sealed card leaked something");
    const sealedSubmit = await call(idOf("anika"), "POST", "/api/game/submit", { kind: "objective", itemId: "anika-find", answer: "A8NKR" });
    check(sealedSubmit.status !== 200, "an answer was accepted before the game opened");
    if (full) {
      const page = await openGame("anika");
      await snap(page, "anika-sealed-1950", "7:50 p.m. Anika opens the game page: nothing yet, and no need to refresh.");
      const staff = await staffPage();
      await staff.page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
      await staff.page.waitForSelector(".staff-cast", { timeout: 15000 });
      await snap(staff.page, "admin-before-doors", "7:50 p.m. The staff page before the doors: the host does not have to press anything.");
      await staff.context.close();
      await page.close();
    }

    // ------------------------------------------------ 20:00: everything opens by itself
    await setClock("20:00:10");
    const opened = await Promise.all(characters.map((c) => call(idOf(c.id), "GET", "/api/game/card")));
    opened.forEach((response, index) => {
      const c = characters[index];
      check(response.json?.status === "ok", `${c.id}: card status ${response.json?.status} at eight`);
      const card = response.json?.card;
      check(card?.private?.objectives?.length === 5, `${c.id}: ${card?.private?.objectives?.length} objectives`);
      check(Boolean(card?.private?.race?.text), `${c.id}: no race text`);
      check(response.json?.directory?.length === 24, `${c.id}: directory has ${response.json?.directory?.length}`);
      check(response.json?.directory?.every((row: any) => !("circle" in row)), `${c.id}: the directory names groups`);
      const text = JSON.stringify(response.json);
      for (const word of characters.flatMap((x) => x.objectives.filter((o) => o.check.kind === "approval").map((o) => (o.check as { word: string }).word))) {
        check(!new RegExp(`\\b${word}\\b`, "i").test(text), `${c.id}: approval word "${word}" reached the phone`);
      }
      if (!c.survivor) check(!/"survivor":\s*\{/.test(text), `${c.id}: a non-survivor got a survivor card`);
      if (c.survivor) check(response.json?.card?.private?.survivor?.markerNo === c.survivor.markerNo, `${c.id}: wrong marker on the card`);
    });
    if (full) {
      const staff = await staffPage();
      await staff.page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
      await staff.page.waitForSelector(".staff-cast", { timeout: 15000 });
      await snap(staff.page, "admin-at-eight", "8:00 p.m. The game opened by itself. The staff page shows it, and lists the approval words for Bartend Joe.");
      await staff.page.locator("summary", { hasText: "Approval words" }).click().catch(() => undefined);
      await snap(staff.page, "admin-approval-words", "The approval words Bartend Joe gives out (read-only).", false);
      await staff.context.close();

      // a non-survivor, a survivor, the Butler and the Sheriff, tab by tab
      const anika = await openGame("anika");
      await snapPhone(anika, "anika-public", "8:00 p.m. Anika's phone: the public tab opened by itself.");
      await openTab(anika, "Background");
      await snapPhone(anika, "anika-background", "Anika's background: history, who she knows, what to wear.");
      await openTab(anika, "Private");
      await snapPhone(anika, "anika-private", "Anika's private tab, top of the page.", 1);
      await snapObjectives(anika, "anika", "Anika (rich heir)");
      await snapEl(anika.locator(".game-panel", { hasText: "In your pockets" }).first(), "anika-pockets", "Anika's pockets: $3,000 (30 bills of $100) and the props she carries.");
      await snapEl(anika.locator(".game-panel", { hasText: "What you know, and what you are hiding" }).first(), "anika-knows", "What Anika knows and is hiding; each line says whether it is hers to trade.");
      await openTab(anika, "Answers");
      await snapPhone(anika, "anika-answers", "Anika's answers tab: the three mysteries and four survivor guesses.");
      await anika.close();

      const mihir = await openGame("mihir");
      await openTab(mihir, "Private");
      await snapPhone(mihir, "mihir-private", "A survivor's private tab (Mihir): who he really is, his tell and how the night works for him.", 2);
      await snapObjectives(mihir, "mihir", "Mihir (survivor)");
      await mihir.close();
      const rebecca = await openGame("rebecca");
      await openTab(rebecca, "Private");
      await snapPhone(rebecca, "rebecca-private", "The Butler's private tab: her rules and the House panel.", 2);
      await snapObjectives(rebecca, "rebecca", "Rebecca (the Butler)");
      await rebecca.close();
      const theodor = await openGame("theodor");
      await openTab(theodor, "Private");
      await snapPhone(theodor, "theodor-private", "The Sheriff's private tab: his office.", 1);
      await snapObjectives(theodor, "theodor", "Theodor (the Sheriff)");
      for (const slug of ["josh", "erika", "tim"]) {
        const page = await openGame(slug);
        await openTab(page, "Private");
        await snapObjectives(page, slug, characterById.get(slug)!.name.split(" ")[0]);
        await page.close();
      }
      await theodor.close();
    }

    // ------------------------------------------------ the evening: who does what, in order
    let raceRefusals = 0;
    const closedOut: string[] = [];
    const extra: Submission[] = []; // things typed through the real UI, which the plan did not include
    const byGuest = new Map<string, Submission[]>();
    for (const submission of night.submissions) byGuest.set(submission.guest, [...(byGuest.get(submission.guest) ?? []), submission]);
    const post = async (submission: Submission) => {
      const response = await call(idOf(submission.guest), "POST", "/api/game/submit", { kind: submission.kind, itemId: submission.itemId, answer: submission.answer });
      // a race entry after the group's point is won is refused by design; the grader would have ignored it anyway
      const lockedOut = submission.itemId === "race" && /already won/.test(response.json?.error ?? "");
      if (lockedOut) {
        raceRefusals += 1;
        closedOut.push(submission.guest);
      }
      else if (response.status !== 200) check(false, `${submission.guest} ${submission.kind}/${submission.itemId} refused: ${response.status} ${JSON.stringify(response.json)}`);
    };
    const isApproval = (s: Submission) => s.kind === "objective" && characterById.get(s.guest)?.objectives.find((o) => o.id === s.itemId)?.check.kind === "approval";
    const ordered = [...night.submissions].sort((a, b) => a.at - b.at);
    const early = ordered.filter((s) => s.kind === "objective" && !isApproval(s));
    const approvals = ordered.filter(isApproval);
    const late = ordered.filter((s) => s.kind !== "objective");

    // 20:10 objectives and races (in the order they happened)
    await setClock("20:10:00");
    for (const submission of early) await post(submission);

    // a few guests photographed mid-game: claim flow and the race box
    if (full) {
      await setClock("20:35:00");
      if (closedOut[0]) {
        const late = await openGame(closedOut[0]);
        await openTab(late, "Private");
        await snapEl(late.locator(".game-panel", { hasText: "Act fast or lose this point" }).first(), `${closedOut[0]}-race-closed`, `${characterById.get(closedOut[0])!.name.split(" ")[0]} was a little late: someone in their group already won the race point, so the box is closed.`);
        await late.close();
      }
      const silas = await openGame("silas");
      await openTab(silas, "Private");
      await silas.getByRole("button", { name: "Claim this point" }).first().scrollIntoViewIfNeeded();
      await snapEl(silas.locator("li.game-errand", { hasText: "The spotlight" }), "silas-before-claim", "8:35 p.m. Silas finished his spotlight. His spotlight objective offers Claim this point.");
      await silas.getByRole("button", { name: "Claim this point" }).first().click();
      await silas.waitForTimeout(200);
      const word = (characterById.get("silas")!.objectives.find((o) => o.check.kind === "approval")!.check as { word: string }).word;
      const box = silas.getByLabel("The approval word Bartend Joe gave you").first();
      await snapEl(silas.locator("li.game-errand", { hasText: "The spotlight" }), "silas-claimed", "He tapped Claim; a box asks for the approval word Bartend Joe gives at the bar.");
      await box.fill(word);
      extra.push({ guest: "silas", kind: "objective", itemId: characterById.get("silas")!.objectives.find((o) => o.check.kind === "approval")!.id, answer: word, proof: "", at: Date.now() });
      await box.locator("xpath=ancestor::form").getByRole("button", { name: /Save answer|Update answer/ }).click();
      await silas.waitForTimeout(600);
      await snapEl(silas.locator("li.game-errand", { hasText: "The spotlight" }), "silas-word-saved", "After Bartend Joe confirmed it, Silas types the word: received. The phone never says whether it is right.");
      await silas.close();
    }

    // 20:40 the Butler sells the vial to the first marker (the order the survivors arrive)
    await setClock("20:40:00");
    const butlerId = idOf("rebecca");
    // the buyer reaches the Butler first, then the others arrive in turn
    const arrivals = night.events.filter((e) => e.kind === "vial-attempt").map((e) => e.guest);
    const livingSurvivors = [night.killer, ...arrivals.filter((id) => id !== night.killer)];
    let firstSale: string | null = null;
    for (const survivor of butlerAbsent ? [] : livingSurvivors) {
      const marker = markers.find((m) => m.no === characterById.get(survivor)!.survivor!.markerNo)!;
      const reply = await call(butlerId, "POST", "/api/game/butler", { code: marker.code });
      if (!firstSale && reply.json?.status === "sold") firstSale = survivor;
      check(reply.status === 200, `the Butler's panel failed for ${survivor}: ${reply.status}`);
      if (full && survivor === livingSurvivors[0]) {
        const page = await openGame("rebecca");
        await openTab(page, "Private");
        await snapEl(page.locator(".game-panel", { hasText: "The House panel" }).first(), "rebecca-house-panel", "8:40 p.m. The House panel on the Butler's phone, ready for a marker code.");
        await page.close();
      }
    }
    if (!butlerAbsent) check(firstSale === night.killer, `the vial went to ${firstSale}, expected ${night.killer}`);
    // the buyer pours it in
    const pour = await call(idOf(night.killer), "POST", "/api/game/dose", { code: glassCode });
    check(pour.status === 200, "the dose call failed");

    // 20:50 the claims (Bartend Joe's words) arrive through the evening
    await setClock("20:50:00");
    for (const submission of approvals) await post(submission);

    // 21:00:10 the House closes by itself
    await setClock("21:00:10");
    if (!butlerAbsent) {
      const closedSale = await call(butlerId, "POST", "/api/game/butler", { code: markers[0].code });
      check(closedSale.json?.status === "closed", `the House should be closed at nine, said ${JSON.stringify(closedSale.json)}`);
    }
    if (full) {
      const page = await openGame("rebecca");
      await openTab(page, "Private");
      await page.getByPlaceholder("Marker code").fill(markers[0].code);
      await page.getByRole("button", { name: "Offer" }).click();
      await page.waitForSelector(".game-reply", { timeout: 5000 }).catch(() => undefined);
      await snapEl(page.locator(".game-panel", { hasText: "The House panel" }).first(), "rebecca-house-closed", "9:00 p.m. The House closed by itself. The Butler's panel says so; nothing else can be sold.");
      await page.close();
    }

    // 22:00 the final answers
    await setClock("22:00:00");
    for (const submission of late) await post(submission);
    if (full) {
      const mid = ordered.find((s) => s.kind === "mystery" && s.guest !== "rebecca" && !characterById.get(s.guest)?.survivor)?.guest ?? "anika";
      const page = await openGame(mid);
      await openTab(page, "Answers");
      await snapPhone(page, `${mid}-answers-filled`, `10:00 p.m. ${characterById.get(mid)!.name.split(" ")[0]}'s final answers, saved. Only the last answer to each question counts.`);
      await snapEl(page.locator(".game-panel", { hasText: "Your bills" }).first(), `${mid}-your-bills`, "10:00 p.m. The new box at the bottom of the Answers tab: count your bills and type the total. The quarter of the room that ends best off earns a point.");
      await page.close();
      const survivorPage = await openGame(night.killer);
      await openTab(survivorPage, "Answers");
      await snapPhone(survivorPage, `${night.killer}-answers-killer`, "The killer's answers tab: they answer the two replacement questions instead of who and how.");
      await survivorPage.close();
    }

    // 22:30:10 the book closes by itself
    await setClock("22:30:10");
    const closedBook = await call(idOf("anika"), "POST", "/api/game/submit", { kind: "mystery", itemId: "old-1", answer: "changed my mind" });
    check(closedBook.status !== 200, "an answer was accepted after the book closed");
    if (full) {
      const page = await openGame("anika");
      await openTab(page, "Answers");
      await snapEl(page.locator(".game-question").first(), "anika-book-closed", "10:30 p.m. The book closes by itself: the box is locked and says so.");
      await page.close();
    }

    // ------------------------------------------------ the host grades: the only time /admin is used
    if (butlerAbsent) {
      const noKiller = await call(null, "POST", "/api/admin/game", { action: "grade" }, true);
      check(noKiller.json?.killer === null, "with no sale the server should have no killer yet");
      const refused = await call(null, "POST", "/api/admin/game", { action: "publish" }, true);
      check(refused.status === 409, "publishing without a killer should be refused");
      const assigned = await call(null, "POST", "/api/admin/game", { action: "assign-vial", slug: night.killer }, true);
      check(assigned.status === 200, `assign-vial failed: ${JSON.stringify(assigned.json)}`);
    }
    const graded = await call(null, "POST", "/api/admin/game", { action: "grade" }, true);
    check(graded.status === 200, `grading failed: ${graded.status} ${JSON.stringify(graded.json)}`);
    check(graded.json?.killer === night.killer, `the server found the killer ${graded.json?.killer}, expected ${night.killer}`);
    const packet = await call(null, "GET", "/api/admin/game/packet", undefined, true);
    const verdicts = (packet.json?.items ?? []).map((item: any) => ({ key: item.key, verdict: item.auto.verdict, points: item.auto.points, rationale: "Accepted the automatic grade." }));
    const applied = await call(null, "POST", "/api/admin/game", { action: "verdicts", verdicts }, true);
    check(applied.status === 200 && (applied.json?.errors ?? []).length === 0, `verdicts failed: ${JSON.stringify(applied.json)}`);
    const published = await call(null, "POST", "/api/admin/game", { action: "publish" }, true);
    check(published.status === 200, `publish failed: ${JSON.stringify(published.json)}`);

    // the same night, scored in-process by the engine: the totals must agree to the hundredth
    const activeGuests = new Set<string>(night.submissions.map((s) => s.guest));
    for (const event of butlerAbsent ? [{ kind: "vial-sold" as const, guest: night.killer, by: null, at: 1 }] : night.events) {
      activeGuests.add(event.guest);
      if (event.kind === "vial-sold" && event.by) activeGuests.add(event.by);
    }
    const truth: Truth = { killer: night.killer, present: [...activeGuests], seed: "black-veil-1926" };
    const events = butlerAbsent
      ? ([{ kind: "vial-attempt", guest: night.killer, at: 1, sold: true }, { kind: "vial-sold", guest: night.killer, by: null, at: 1 }] as typeof night.events)
      : night.events;
    const allSubmissions = [...night.submissions, ...extra];
    const expectedItems = autoGrade({ submissions: allSubmissions, events, truth });
    const expected = computeStandings(expectedItems, allSubmissions, truth);
    const expectedByGuest = new Map(expected.standings.map((row) => [row.guest, row]));

    const results = await Promise.all([...activeGuests].map(async (slug) => ({ slug, response: await call(idOf(slug), "GET", "/api/game/results") })));
    let mismatches = 0;
    for (const { slug, response } of results) {
      const you = response.json?.results?.you;
      const want = expectedByGuest.get(slug);
      if (!you || !want) {
        check(false, `${slug}: no published results`);
        continue;
      }
      if (Math.abs(you.total - want.total) > 0.011) {
        mismatches += 1;
        check(false, `${slug}: server total ${you.total}, engine total ${want.total}`);
      }
    }
    const absentResults = await call(idOf([...presentIds].length ? characters.find((c) => !presentIds.has(c.id))?.id ?? "anika" : "anika"), "GET", "/api/game/results");
    void absentResults;

    // results screens
    const winnerSlug = expected.winner!;
    if (full || run <= 3) {
      const winnerPage = await openGame(winnerSlug);
      await openTab(winnerPage, "Results");
      await snapPhone(winnerPage, `${winnerSlug}-results`, `Results: ${characterById.get(winnerSlug)!.name} won with ${expectedByGuest.get(winnerSlug)!.total}. The page explains where every point came from.`);
      await winnerPage.close();
    }
    if (full) {
      for (const slug of ["mihir", "anika", "tim"].filter((s) => activeGuests.has(s))) {
        const page = await openGame(slug);
        await openTab(page, "Results");
        await snapPhone(page, `${slug}-results`, `${characterById.get(slug)!.name.split(" ")[0]}'s results: objectives, survivors named, mysteries, group race.`);
        await page.close();
      }
    }
    if (full || run <= 3) {
      const staff = await staffPage();
      await staff.page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
      await staff.page.waitForSelector(".staff-cast", { timeout: 15000 });
      await snap(staff.page, "admin-after", "After grading and publishing: the staff page.", false);
      await staff.context.close();
    }

    // survivors honestly unaware: nobody but a survivor ever received a survivor card
    const survivorLeaks = results.filter(({ slug, response }) => !characterById.get(slug)!.survivor && JSON.stringify(response.json).includes("realStory")).length;
    check(survivorLeaks === 0, "a non-survivor's results carried a survivor card");

    const winner = expected.standings[0];
    const line = `| ${run} | ${night.absent.length} | ${activeGuests.size} | ${characterById.get(night.killer)!.name.split(" ")[0]} | ${characterById.get(winnerSlug)!.name.split(" ")[0]} (${round2(winner.total)}) | ${expected.standings.at(-1)!.total} | ${mismatches} | ${problems.length ? problems.length + " problems" : "clean"}${butlerAbsent ? " (Butler stayed home; host assigned the vial)" : ""} |`;
    summary.push(line);
    console.log(line);
    console.log(`  run ${run}: ${raceRefusals} late race entries were refused because their group's point was already won`);
    failures += problems.length;
    for (const context of contexts.values()) await context.close();
    writeFileSync(`${dir}/problems.txt`, problems.join("\n"));
  }

  writeFileSync(`${outDir}/summary.md`, ["| Run | Stayed home | Played | Killer | Winner | Lowest | Total mismatches | Result |", "|---|---|---|---|---|---|---|---|", ...summary].join("\n"));
  writeFileSync(`${outDir}/shots.json`, JSON.stringify(allShots, null, 2));
  await browser.close();
  await sql.end();
  console.log(failures ? `\n${failures} PROBLEMS` : "\nALL RUNS CLEAN");
  void questions;
  void survivorIds;
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
