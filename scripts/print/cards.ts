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
  ["free", "SAY FREELY: anyone may be told", "free"],
  ["trade", "TRADE IT: tell it only if they tell you a clue in return", "trade"],
  ["paid", "COSTS $100: tell it only after they drop a $100 bill in the House Tin at the bar", "paid"],
  ["secret", "KEEP CLOSE: do not tell unless you choose to", "secret"],
] as const;
const summaryHtml = () =>
  `<div class="summary">${brief1924
    .filter((b) => b.heading !== "A word to the survivors")
    .map((b) => `<h4>${esc(b.heading)}</h4>${b.bullets.map((t) => `<p>${esc(t)}</p>`).join("")}`)
    .join("")}</div>`;
function guestCardPages(): string[] {
  const pages: string[] = [];
  for (const c of sorted) {
    const k = buildCard(c.id)!;
    const p = k.private;
    const clues = [...p.secrets, ...p.knows];
    const entrusted = clues.filter((line) => /^About /.test(line.text));
    const groups: { label: string; chip: string; lines: typeof clues }[] = clueGroups.map(([tag, label, chip]) => ({ label: label as string, chip: chip as string, lines: clues.filter((line) => line.share === tag && !/^About /.test(line.text)) }));
    groups.push({ label: "ENTRUSTED SECRET: another guest's small secret that you hold for them", chip: "secret", lines: entrusted });
    const shown = groups.filter((group) => group.lines.length);
    const errands = p.objectives
      .map((o, index) => `<div class="errand"><div class="t"><span class="lab">${index + 1}. ${typeOfRendered(o)}</span>${esc(o.title)}</div><div>${esc(o.text)}${o.withNames.length ? ` <i>Seek out: ${esc(o.withNames.join(", "))}.</i>` : ""} <span class="ty">Type: <em>${esc(o.ask)}</em></span></div></div>`)
      .join("");
    const v = c.survivor;
    const raceHtml = `<h2>Act fast or lose this point: ${esc(p.race.title)}</h2><p><b>The first to complete this task gets the point.</b> ${esc(p.race.text)}${p.race.slips.length ? ` <b>You carry for others:</b> ${esc(p.race.slips.join(" "))}` : ""}</p>`;
    const secretHtml = v
      ? `<h2>Your secret: you are one who got away (${esc(v.veilName)}, ${esc(v.veilTitle)})</h2>
      <p><b>Who you were:</b> ${esc(v.realStory)} <b>How you got away:</b> ${esc(v.escape)} <b>Your tell:</b> ${esc(v.tell)} <b>Do it at least three times before the nightcap.</b> <b>What leaks through:</b> ${esc(v.skillLeak)}</p>
      <p><b>Your rules:</b> ${survivorRules(v.markerNo).map((r, i) => `${i + 1}. ${esc(r)}`).join(" ")}</p>
      <div class="gcmarker"><span class="gccut">&#9986; cut out</span><div class="mk">THE BLACK VEIL &nbsp;·&nbsp; MARKER No. ${v.markerNo}</div><div class="mc">${esc(v.markerCode)}</div><div class="ml">Hand it to the Butler at the bar to buy the vial. Honoured once, by its owner.</div></div>`
      : "";
    // FRONT: who you are, what the whole town knows, your race and (for the five survivors) your secret
    pages.push(`<div class="page"><div class="sheet">${banner("Manchester, N.H. · All Hallows' Eve, 1926")}<div class="fit" data-max="1.12" data-min="0.7" style="--base:10.8pt">
      <div class="name">${esc(k.name)}</div><div class="occ">${esc(k.occupation)}</div><div class="rule" style="margin:.25em 1.2in .4em"></div>
      <div class="cash"><span class="t">You start with</span><span class="amt">$${p.startingCash.toLocaleString("en-US")}</span><span class="t">${p.startingCash / 100} House bills of $100</span></div>
      ${p.carries.length ? `<div class="box">You carry: ${esc(p.carries.join(", "))}. Keep ${p.carries.length > 1 ? "them" : "it"} on you all night.</div>` : ""}
      <h2>What the town knows</h2>${summaryHtml()}
      <h2>Your public face</h2><p>${esc(k.publicBio)}</p>
      <h2>Your background</h2><p>${esc(k.background.history)}</p>
      <ul>${k.background.people.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      ${p.habit ? `<p><span class="lab">Your habit</span> &nbsp;${esc(p.habit)}</p>` : ""}
      ${p.role ? `<h2>${esc(p.role.title)}</h2><p>${esc(p.role.rules.join(" "))}</p>` : ""}
      ${raceHtml}
      ${secretHtml}
      <div class="flapbox">Turn over: your five objectives and everything you know.</div>
    </div></div></div>`);
    // BACK: the private page
    pages.push(`<div class="page"><div class="sheet">${banner(`${k.name} · Private`)}<div class="fit" data-max="1.12" data-min="0.7" style="--base:11pt">
      <h2>Your five objectives (1 point each)</h2>${errands}
      <h2>What you know: tell, trade or sell as marked</h2>
      <div class="cols2">${shown.map((group) => `<div class="cgroup"><div class="cglabel"><span class="tag ${group.chip}">${esc(group.label)}</span></div>${group.lines.map((line) => `<div class="line">${esc(line.text)}</div>`).join("")}</div>`).join("")}</div>
      <div class="type">Type your answers on your phone${SITE ? ` at <b>${esc(SITE)}</b>` : ""}. Bartend Joe gives the word for a HOST TASK once he has seen it done. At the end, count your bills and type the total.</div>
    </div></div></div>`);
  }
  return pages;
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
  { file: "guest-cards", title: "Guest cards", comment: "PRINT DOUBLE-SIDED, flip on the long edge: page 1 is the front of guest 1, page 2 its back, and so on (24 guests, 48 pages).", pages: guestCardPages() },
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
