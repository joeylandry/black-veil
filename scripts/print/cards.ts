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
import { characters, buildCard, survivors, survivorRules, type CardView } from "@/data/game";
import { brief1924, rulesCard } from "@/data/game/story";

const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const OUT = resolve(process.cwd(), "docs/print/game");
const CSS = readFileSync(resolve(process.cwd(), "scripts/print/cards.css"), "utf8");
/** The web address guests type answers at. event.ts has none, so set SITE_URL; otherwise the cards say "your phone". */
const SITE = (process.env.SITE_URL ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const sorted = [...characters].sort(byName);

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

// ------------------------------------------------------------------ 1. guest cards: everything on one side of one sheet
const typeOfRendered = (o: CardView["private"]["objectives"][number]): string => {
  if (o.approval) return "HOST TASK";
  if (o.automatic) return "KEEP A SECRET";
  if (o.kind === "money") return "MONEY";
  if (o.kind === "find") return "FIND";
  if (o.kind === "swap") return "SWAP";
  if (o.id.endsWith("-secret")) return "LEARN A SECRET";
  if (o.house) return "VIAL";
  if (o.kind === "role") return "DEAL";
  return "LEARN A STORY";
};
const clueGroups = [
  ["free", "SAY FREELY"],
  ["trade", "TRADE IT (a line for a line)"],
  ["paid", "COSTS $100 AT THE BAR (drop a bill in the House Tin first)"],
  ["secret", "KEEP CLOSE"],
] as const;
function guestCardPages(): string[] {
  return sorted.map((c) => {
    const k = buildCard(c.id)!;
    const p = k.private;
    const clues = [...p.secrets, ...p.knows];
    const entrusted = clues.filter((line) => /^About /.test(line.text));
    const groups: { label: string; lines: typeof clues }[] = clueGroups.map(([tag, label]) => ({ label: label as string, lines: clues.filter((line) => line.share === tag && !/^About /.test(line.text)) }));
    groups.push({ label: "ENTRUSTED SECRETS (another guest's small secret, held for them)", lines: entrusted });
    const shown = groups.filter((group) => group.lines.length);
    const objectives = p.objectives
      .map((o, index) => `<li><b>${index + 1}. ${typeOfRendered(o)}.</b> ${esc(o.text)}${o.withNames.length ? ` <i>Seek out: ${esc(o.withNames.join(", "))}.</i>` : ""} <span class="gcask">Type: ${esc(o.ask)}.</span></li>`)
      .join("");
    return `<div class="page gcpage"><div class="gcbox"><div class="fit" data-max="1" data-min="0.7" style="--base:10.6pt">
      <div class="gchead"><span class="gcname">${esc(k.name)}</span><span class="gcocc">${esc(k.occupation)}</span></div>
      <div class="gcstrip"><b>BILLS:</b> ${p.startingCash / 100} ($${p.startingCash.toLocaleString("en-US")}) &nbsp;·&nbsp; <b>CARRIES:</b> ${p.carries.length ? esc(p.carries.join(", ")) + " (keep on you)" : "nothing"} &nbsp;·&nbsp; <b>ANSWERS:</b> on your phone${SITE ? ` at ${esc(SITE)}` : ""}, closes 10:30</div>
      <h3>WHO YOU ARE</h3>
      <p><b>The room sees:</b> ${esc(k.publicBio)} <b>You:</b> ${esc(k.background.history)} <b>You know:</b> ${esc(k.background.people.join(" "))}${p.habit ? ` <b>Habit:</b> ${esc(p.habit)}` : ""}</p>
      ${p.role ? `<p><b>${esc(p.role.title)}:</b> ${esc(p.role.rules.join(" "))}</p>` : ""}
      <h3>YOUR FIVE OBJECTIVES (1 point each)</h3>
      <ol class="gcobj">${objectives}</ol>
      <h3>YOUR RACE: ${esc(p.race.title)} (+1 to the first to finish)</h3>
      <p>${esc(p.race.text)}${p.race.slips.length ? ` <b>You carry for others:</b> ${esc(p.race.slips.join(" "))}` : ""}</p>
      ${c.survivor ? `<h3>YOUR SECRET: YOU ARE ONE WHO GOT AWAY (${esc(c.survivor.veilName)}, ${esc(c.survivor.veilTitle)})</h3>
      <p><b>Who you were:</b> ${esc(c.survivor.realStory)} <b>How you got away:</b> ${esc(c.survivor.escape)} <b>Your tell:</b> ${esc(c.survivor.tell)} <b>Do it at least three times before the nightcap.</b> <b>What leaks through:</b> ${esc(c.survivor.skillLeak)}</p>
      <p><b>Your rules:</b> ${survivorRules(c.survivor.markerNo).map((r, i) => `${i + 1}. ${esc(r)}`).join(" ")}</p>` : ""}
      <h3>WHAT YOU KNOW (tell, trade or sell as marked)</h3>
      <div class="gcclues">${shown.map((group) => `<div class="gcgroup"><div class="gclabel">${esc(group.label)}</div>${group.lines.map((line) => `<div class="gcline">${esc(line.text)}</div>`).join("")}</div>`).join("")}</div>
      ${c.survivor ? `<div class="gcmarker"><span class="gccut">&#9986; cut out</span><div class="mk">THE BLACK VEIL &nbsp;·&nbsp; MARKER No. ${c.survivor.markerNo}</div><div class="mc">${esc(c.survivor.markerCode)}</div><div class="ml">Hand it to the Butler at the bar to buy the vial. Honoured once, by its owner.</div></div>` : ""}
      <p class="gcfoot">The town's story is on the door poster and your phone. Bartend Joe gives the word for any HOST TASK once he has seen it done. At the end, count your bills and type the total.</p>
    </div></div></div>`;
  });
}

// ------------------------------------------------------------------ 3. survivor kit
const survivorList = [...survivors].sort((a, b) => a.survivor!.markerNo - b.survivor!.markerNo);

function kitPages(): string[] {
  const pages: string[] = [];
  pages.push(`<div class="page"><div class="sheet">${banner("Host copy")}<div class="fit" style="--base:12pt">
    <div class="hostmark">HOST COPY: do not hand out</div>
    <div class="name" style="font-size:2em">The five who got away</div><div class="rule"></div>
    <table><tr><th>Marker</th><th>Code</th><th>Guest card (cover name)</th><th>Real identity</th><th>The tell</th></tr>
    ${survivorList.map((s) => `<tr><td><b>No. ${s.survivor!.markerNo}</b></td><td class="mono"><b>${esc(s.survivor!.markerCode)}</b></td><td><b>${esc(s.name)}</b></td><td>${esc(s.survivor!.veilName)}, ${esc(s.survivor!.veilTitle)}</td><td>${esc(s.survivor!.tell)}</td></tr>`).join("")}
    </table>
    <h2 style="margin-top:1.1em">How it works</h2>
    <ul>
    <li>Each survivor gets <b>one sheet</b>: their guest card, which also holds their secret page and, at the bottom, their marker to cut out.</li>
    <li>The marker is honoured once, at the bar, by its owner. Its code is in the table above; the Butler types it.</li>
    <li>Print this page on its own and keep it. Do not leave it on the printer.</li>
    </ul>
  </div></div></div>`);
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
  void two;
  return [poster(briefTitle, briefBody()), poster(rulesTitle, rulesBody())];
}

// ------------------------------------------------------------------ build
const outputs: { file: string; title: string; comment: string; pages: string[] }[] = [
  { file: "guest-cards", title: "Guest cards", comment: "One sheet per guest, single-sided, alphabetical (24 pages). Everything the guest needs is on it.", pages: guestCardPages() },
  { file: "survivor-kit", title: "Survivor kit (HOST ONLY)", comment: "HOST ONLY. Spoilers. One page: the markers and who holds them.", pages: kitPages() },
  { file: "door-cards", title: "Door cards", comment: "Page 1: the brief poster. Page 2: the rules poster. One of each, at the door.", pages: doorPages() },
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
