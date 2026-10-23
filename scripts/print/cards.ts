/**
 * Print-ready PDFs for the party: character cards, envelope sheets, survivor kit, house invitations, door cards.
 * SPOILERS: survivor-kit.pdf contains the solution (host only).
 *
 *   npx tsx scripts/print/cards.ts            (SITE_URL=https://... to print the web address on the cards)
 *
 * Writes docs/print/game/*.html and *.pdf, then re-opens each HTML in headless Chromium to check that no page
 * overflows (the fit script shrinks text a little if needed and reports it).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { characters, buildCard, facts, survivors, survivorRules, type CardView } from "@/data/game";
import { brief1924, rulesCard } from "@/data/game/story";

const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const OUT = resolve(process.cwd(), "docs/print/game");
const CSS = readFileSync(resolve(process.cwd(), "scripts/print/cards.css"), "utf8");
/** The web address guests type answers at. event.ts has none, so set SITE_URL; otherwise the cards say "your phone". */
const SITE = (process.env.SITE_URL ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const sorted = [...characters].sort(byName);
const survivorIds = new Set(survivors.map((s) => s.id));

const FIT = `
<script>
function fitAll(){document.querySelectorAll('.fit').forEach(function(el){
  var s=parseFloat(el.dataset.max||'1'),min=parseFloat(el.dataset.min||'0.78');
  el.style.setProperty('--s',s);
  while((el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)&&s>min){s-=0.01;el.style.setProperty('--s',s.toFixed(2));}
  el.dataset.scale=s.toFixed(2);
  if(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)el.dataset.overflow='1';
});}
fitAll();window.addEventListener('load',fitAll);
</script>`;

function doc(title: string, comment: string, pages: string[]): string {
  return `<!doctype html>\n<!-- ${comment} -->\n<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><meta name="viewport" content="width=device-width">\n<style>${CSS}</style></head><body>\n${pages.join("\n")}\n${FIT}\n</body></html>`;
}

const banner = (sub = "") => `<div class="banner">THE BLACK VEIL${sub ? `<small>${esc(sub)}</small>` : ""}</div>`;
const typeLine = () => `Type your answers on your phone${SITE ? ` at <b>${esc(SITE)}</b>` : ""} whenever you like. Only your last answer counts.`;
const tagText = { free: "Yours to share", trade: "Trade it, don't give it away", paid: "Costs a bill: pay at the bar", secret: "Never say it aloud" } as const;
const lines = (xs: { text: string; share: keyof typeof tagText }[]) => xs.map((l) => `<div class="line"><span class="tag ${l.share}">${tagText[l.share]}</span>${esc(l.text)}</div>`).join("");
const errandHtml = (o: CardView["private"]["objectives"][number], n: number) => {
  return `<div class="errand"><div class="t"><span class="lab">Objective ${n}</span>${esc(o.title)}</div><div>${esc(o.text)}</div><div class="a"><span>Type: <em>${esc(o.ask)}</em></span><b>${o.points} ${o.points === 1 ? "POINT" : "POINTS"}</b></div></div>`;
};
const summaryHtml = () =>
  `<div class="summary">${brief1924
    .filter((b) => b.heading !== "A word to the survivors")
    .map((b) => `<h4>${esc(b.heading)}</h4>${b.bullets.map((t) => `<p>${esc(t)}</p>`).join("")}`)
    .join("")}</div>`;

/** Objectives 1 and 2 ride on the card; 3 to 5 are sealed in the black envelope. Numbered by their place on the card. */
const numbered = (objectives: CardView["private"]["objectives"]) => objectives.map((o, index) => ({ o, n: index + 1 }));

// ------------------------------------------------------------------ 1. character cards
function cardPages(): string[] {
  const pages: string[] = [];
  for (const c of sorted) {
    const k = buildCard(c.id)!;
    const p = k.private;
    pages.push(`<div class="page"><div class="sheet">${banner("Manchester, N.H. · All Hallows' Eve, 1926")}<div class="fit" data-max="1.1" style="--base:11.5pt">
      <div class="name">${esc(k.name)}</div><div class="occ">${esc(k.occupation)}</div><div class="rule"></div>
      <h2>What the town knows</h2>${summaryHtml()}
      <h2>Your public face</h2><p>${esc(k.publicBio)}</p>
      <h2>Background</h2><p>${esc(k.background.history)}</p>
      <ul>${k.background.people.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </div></div></div>`);
    const errands = numbered(p.objectives).filter(({ n }) => n <= 2);
    pages.push(`<div class="page"><div class="sheet">${banner(`${k.name} · Private`)}<div class="fit" style="--base:11.5pt">
      <h2>Private</h2>${lines(p.secrets)}
      <h2>What you know</h2><div class="${p.knows.length > 6 ? "cols2" : ""}">${lines(p.knows)}</div>
      ${p.habit ? `<p style="margin-top:.4em"><span class="lab">Your habit</span> &nbsp;${esc(p.habit)}</p>` : ""}
      <div class="cash"><span class="t">You start with</span><span class="amt">$${p.startingCash.toLocaleString("en-US")}</span><span class="t">in House bills (${p.startingCash / 100} × $100)</span></div>
      <h2>Your objectives</h2>${errands.map(({ o, n }) => errandHtml(o, n)).join("")}
      <div class="box">Objectives 3 to 5 are in your black envelope</div>
      <div class="flapbox">If you are one of the five, your private page already knows. Everyone else's has the same sealed flap with nothing behind it.</div>
      <div class="type">${typeLine()}</div>
    </div></div></div>`);
  }
  return pages;
}

// ------------------------------------------------------------------ 2. envelope sheets
function envelopePages(): string[] {
  return sorted.map((c) => {
    const k = buildCard(c.id)!;
    const p = k.private;
    const errands = numbered(p.objectives).filter(({ n }) => n >= 3);
    return `<div class="page"><div class="sheet">${banner(k.name)}<div class="fit" style="--base:12pt">
      <div class="name" style="font-size:2.1em">Your black envelope</div><div class="occ">Objectives 3 to 5</div><div class="rule"></div>
      ${errands.map(({ o, n }) => errandHtml(o, n)).join("")}
      <h2>Act fast or lose this point</h2><p><b>The first to complete this task gets the point.</b> ${esc(p.race.text)}</p>${p.race.slips.map((slip) => `<p><b>${esc(slip)}</b></p>`).join("")}
      ${p.role ? `<h2>${esc(p.role.title)}</h2><ol class="rules">${p.role.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>` : ""}
      ${p.carries.length ? `<div class="box" style="margin-top:.7em">You will be handed at the door: ${p.carries.map(esc).join(", ")}</div>` : ""}
      <div class="flapbox">What is in this envelope is for you alone. Keep a straight face, and enjoy the night.</div>
      <div class="type">${typeLine()}</div>
    </div></div></div>`;
  });
}

// ------------------------------------------------------------------ 3. survivor kit
const survivorList = [...survivors].sort((a, b) => a.survivor!.markerNo - b.survivor!.markerNo);

function invitationText(name: string): string {
  return `<p class="to">${esc(name)},</p>
<p>That is the name you have worn since 1925, and I am one of very few who know what it covers.</p>
<p>The old man will be in the room tonight. You know the one I mean. I will not write his name where a letter can be lost.</p>
<p>Every one of you was meant to be dead, and you are not. Do not waste the evening being surprised.</p>
<p>Why it must be you is yours to remember. You have told yourself a great many stories since. Sit quietly with the true one.</p>
<p>You will not be told who else was sent for. The House keeps one bottle, and it is sold once. Be quick, and be quiet.</p>
<p>Doors at eight.</p>
<p class="end">The veil lifts</p>`;
}

function kitPages(): string[] {
  const pages: string[] = [];
  pages.push(`<div class="page"><div class="sheet">${banner("Host copy")}<div class="fit" style="--base:12pt">
    <div class="hostmark">HOST COPY: do not hand out</div>
    <div class="name" style="font-size:2em">The five who got away</div><div class="rule"></div>
    <table><tr><th>Marker</th><th>Code</th><th>Guest card (cover name)</th><th>Real identity</th><th>The tell</th></tr>
    ${survivorList.map((s) => `<tr><td><b>No. ${s.survivor!.markerNo}</b></td><td class="mono"><b>${esc(s.survivor!.markerCode)}</b></td><td><b>${esc(s.name)}</b></td><td>${esc(s.survivor!.veilName)}, ${esc(s.survivor!.veilTitle)}</td><td>${esc(s.survivor!.tell)}</td></tr>`).join("")}
    </table>
    <h2 style="margin-top:1.1em">How to use the pages that follow</h2>
    <ul>
    <li>Each survivor has three pages: <b>The Flap</b> (their secret page), then a cut sheet with <b>Cassie's unsigned invitation</b>, the <b>marker</b> and an <b>address label</b>.</li>
    <li>Cut along the dotted lines. The strip across the top of every page names the guest and marker number, so the pieces can be sorted into five piles.</li>
    <li>The marker is honoured once, at the bar, by its owner. Its code is in the table above; the Butler types it.</li>
    <li>Print this page on its own and keep it. Do not leave it on the printer.</li>
    </ul>
  </div></div></div>`);
  for (const s of survivorList) {
    const v = s.survivor!;
    const tag = `<div class="strip"><span>SURVIVOR KIT · ${esc(s.name)} · Marker No. ${v.markerNo}</span><span>HOST ONLY until cut</span></div>`;
    const rules = survivorRules(v.markerNo);
    pages.push(`<div class="page">${tag}<div class="sheet tight flap" style="top:.32in"><div class="banner slim">THE BLACK VEIL</div><div class="fit" data-max="1.1" data-min="0.86" style="--base:11.5pt">
      <div class="flaphead"><div class="big">You are one who got away</div><div class="vn">${esc(v.veilName)}</div><div class="vt">${esc(v.veilTitle)}</div><span class="markerline">MARKER No. ${v.markerNo}</span></div>
      <div class="rule" style="margin:.4em 1.2in .5em"></div>
      <h2>Who you were</h2><p>${esc(v.realStory)}</p>
      <h2>How you got away</h2><p>${esc(v.escape)}</p>
      <h2>Your tell</h2><p>${esc(v.tell)} <b>Do it at least three times before the nightcap.</b></p>
      <h2>What leaks through</h2><p>${esc(v.skillLeak)}</p>
      <h2>The rules for you</h2><ol class="rules">${rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
    </div></div></div>`);
    pages.push(`<div class="page">${tag}
      <div class="cutarea hand" style="left:.5in;top:.55in;width:7.5in;height:6.55in"><div class="fit" data-max="1.2" style="--base:14pt;padding:0;flex:1;justify-content:center">${invitationText(s.name)}</div></div>
      <div class="cutarea marker" style="left:.5in;top:7.6in;width:4.1in;height:2.5in"><div class="k">THE BLACK VEIL</div><div class="no">MARKER No. ${v.markerNo}</div><div class="code">${esc(v.markerCode)}</div><div class="l">Honoured once, at the bar, by its owner.</div></div>
      <div class="cutarea label" style="left:5.0in;top:7.6in;width:3.0in;height:1.1in">${esc(s.name)}</div>
      <div style="position:absolute;left:5.0in;top:8.8in;width:3in;font:8pt 'Liberation Sans',Arial,sans-serif;color:#666">Address label for the unsigned envelope. Cut along the dotted lines.</div>
    </div>`);
  }
  return pages;
}

// ------------------------------------------------------------------ 4. house invitations
function privateWord(id: string): string | null {
  const holder = facts.find((f) => f.id === "succession")?.holders.find((h) => h.guest === id);
  if (!holder) return null;
  const m = holder.line.match(/House:\s*(.+?\.)(?:\s|$)/);
  if (!m) throw new Error(`cannot trim succession line for ${id}`);
  return m[1].charAt(0).toUpperCase() + m[1].slice(1);
}

function invitationCard(name: string, top: string, id: string): string {
  const word = privateWord(id);
  return `<div class="inv" style="top:${top}"><div class="req">THE HOUSE REQUESTS</div>
    <div class="to">${esc(name)}</div>
    <div class="body">the pleasure of your company at the Black Veil, on the twenty-third of October, nineteen twenty-six. Doors at eight o'clock. A mask is welcome, never required. Discretion is expected.</div>
    ${word ? `<div class="word"><b>A private word:</b>${esc(word)}</div>` : ""}
    <div class="sig">The House</div></div>`;
}

function invitationPages(): string[] {
  const guests = sorted.filter((c) => !survivorIds.has(c.id));
  const pages: string[] = [];
  for (let i = 0; i < guests.length; i += 2) {
    const pair = guests.slice(i, i + 2);
    pages.push(`<div class="page">${invitationCard(pair[0].name, ".3in", pair[0].id)}<div class="cutline" style="top:5.5in"></div>${pair[1] ? invitationCard(pair[1].name, "5.9in", pair[1].id) : ""}</div>`);
  }
  return pages;
}

// ------------------------------------------------------------------ 5. door cards
const briefBody = () => brief1924.map((b) => `<h3>${esc(b.heading)}</h3>${b.bullets.map((t) => `<p>${esc(t)}</p>`).join("")}`).join("");
const rulesBody = () => `<ol>${rulesCard.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>`;
const rulesTitle = "The rules of the night";
const briefTitle = "What the town knows";

function doorPages(): string[] {
  const poster = (title: string, body: string) =>
    `<div class="page poster"><div class="sheet">${banner()}<div class="fit" data-max="1.55" data-min="0.9" style="--base:11.5pt"><div class="name" style="font-size:2.3em">${esc(title)}</div><div class="rule"></div>${body}</div></div></div>`;
  const half = (title: string, body: string, top: string, cls = "") =>
    `<div class="half ${cls}" style="top:${top}"><div class="sheet">${banner()}<div class="fit" data-max="1.3" data-min="0.88" style="--base:11.5pt"><div class="name" style="font-size:1.5em;margin-bottom:.1em">${esc(title)}</div>${body}</div></div></div>`;
  const two = (title: string, body: string, cls = "") =>
    `<div class="page poster">${half(title, body, ".2in", cls)}<div class="cutline" style="top:5.5in"></div>${half(title, body, "5.8in", cls)}</div>`;
  return [poster(briefTitle, briefBody()), poster(rulesTitle, rulesBody()), two(briefTitle, briefBody()), two(rulesTitle, rulesBody(), "two")];
}

// ------------------------------------------------------------------ build
const outputs: { file: string; title: string; comment: string; pages: string[] }[] = [
  { file: "character-cards", title: "Character cards", comment: "PRINT DOUBLE-SIDED, flip on the long edge: page 1 is the front of card 1, page 2 its back, and so on (24 cards, 48 pages).", pages: cardPages() },
  { file: "envelope-sheets", title: "Envelope sheets", comment: "One page per character, single-sided, alphabetical like the cards.", pages: envelopePages() },
  { file: "survivor-kit", title: "Survivor kit (HOST ONLY)", comment: "HOST ONLY. Spoilers. Single-sided; cut along dotted lines.", pages: kitPages() },
  { file: "house-invitations", title: "House invitations", comment: "Two per page, single-sided, on cream card stock if you have it. Cut along the dotted line.", pages: invitationPages() },
  { file: "door-cards", title: "Door cards", comment: "Pages 1-2 posters; pages 3-4 half-page copies for tables (cut along the dotted line).", pages: doorPages() },
];

mkdirSync(OUT, { recursive: true });
let failed = false;
for (const o of outputs) {
  const html = resolve(OUT, `${o.file}.html`);
  const pdf = resolve(OUT, `${o.file}.pdf`);
  writeFileSync(html, doc(o.title, o.comment, o.pages));
  const flags = ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer"];
  const r = spawnSync(CHROME, [...flags, "--virtual-time-budget=3000", `--print-to-pdf=${pdf}`, `file://${html}`], { encoding: "utf8" });
  if (r.status !== 0) { console.error(`render failed for ${o.file}\n${r.stderr}`); failed = true; continue; }
  const dom = spawnSync(CHROME, [...flags, "--virtual-time-budget=3000", "--dump-dom", `file://${html}`], { encoding: "utf8", maxBuffer: 64 << 20 }).stdout;
  const scales = [...dom.matchAll(/class="fit"[^>]*?data-scale="([\d.]+)"([^>]*)>/g)].map((m) => ({ s: Number(m[1]), over: /data-overflow/.test(m[0]) }));
  const over = scales.filter((x) => x.over).length;
  const min = scales.length ? Math.min(...scales.map((x) => x.s)) : 1;
  const pageCount = (dom.match(/class="page/g) ?? []).length;
  const pdfPages = (readFileSync(pdf).toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  console.log(`${o.file}: ${pageCount} pages (pdf ${pdfPages}), smallest text scale ${min}${over ? `, OVERFLOW on ${over}` : ""}`);
  if (over || pageCount !== pdfPages) failed = true;
}
if (failed) process.exitCode = 1;
