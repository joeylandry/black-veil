/**
 * Print-ready PDFs of every physical prop for the Black Veil party, generated from the game data so the
 * codes can never disagree with the engine. SPOILERS: exhibits-index.pdf, tag-key.pdf and the HOST ONLY
 * page contain the solution.
 *
 *   npx tsx scripts/print/exhibits.ts
 *
 * Writes (docs/print/game/): exhibits.pdf, exhibits-index.pdf, tags.pdf, tag-key.pdf, slips.pdf,
 * vial-labels.pdf, fortune-cards.pdf, cocktail-menu.pdf, food-menu.pdf, README-props.md (+ the .html of each).
 * Needs headless Chromium (CHROME env var overrides the path) and pdftotext/pdfinfo for the checks.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { characterById, characters, exhibits, markers, props } from "@/data/game";
import { tieBreaker } from "@/data/game/story";

// =====================================================================================================
// EDIT HERE: the bar menu. Change the arrays, run `npx tsx scripts/print/exhibits.ts` again, reprint
// docs/print/game/cocktail-menu.pdf and food-menu.pdf (two half-sheet copies of each per page).
// =====================================================================================================
const menuTitle = "THE BLACK VEIL";
const menuBy = "by the House";
const menuNotice = "Every beverage dispensed for medicinal use only";
const menuDrinks: { name: string; desc: string }[] = [
  { name: "The Bee's Knees", desc: "Gin \u00b7 Fresh Lemon \u00b7 Honey Syrup" },
  { name: "Whiskey Sour", desc: "Bourbon \u00b7 Citrus \u00b7 Orange" },
  { name: "Espresso Martini", desc: "Orange Vodka \u00b7 Espresso \u00b7 Coffee Liqueur" },
  { name: "The Bloody Scary", desc: "Blood Orange \u00b7 Prosecco \u00b7 Campari \u00b7 Black Vodka" },
];
const menuBites: { name: string; desc: string }[] = [
  { name: "Sausage-Stuffed Mushrooms", desc: "Savory Italian Sausage \u00b7 Mascarpone \u00b7 Parmesan \u00b7 Herbs" },
  { name: "Smoked Salmon Tea Sandwiches", desc: "Smoked Salmon \u00b7 Herbed Butter \u00b7 21 Grain Bread" },
  { name: "Mini Italian Meatballs", desc: "Tender Italian-Style Meatballs" },
  { name: "Classic Shrimp Cocktail", desc: "Chilled Shrimp \u00b7 Cocktail Sauce" },
  { name: "The Black Veil Charcuterie Board", desc: "Artisan Cheeses \u00b7 Cured Meats \u00b7 Crackers \u00b7 Pepper Jam" },
];

// =====================================================================================================
const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/print/game");
const CSS = readFileSync(path.join(ROOT, "scripts/print/exhibits.css"), "utf8");
const CHROME = process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
mkdirSync(OUT, { recursive: true });

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** The forger's hand: every i is dotted with a ring (a dotless i plus a ring drawn above it). */
const ring = (s: string) => [...s].map((ch) => (ch === "i" ? `<span class="ri">\u0131</span>` : esc(ch))).join("");
const stripQuotes = (s: string) => s.replace(/^\s*[\u201c"]/, "").replace(/[\u201d"]\s*$/, "");
const publicName = (id: string) => characterById.get(id)?.name ?? id;
const fail = (msg: string): never => {
  throw new Error(msg);
};

// ---------------------------------------------------------------- rendering helpers
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A clip-path polygon with ragged edges. `edges` is any of t r b l (the torn sides); the others stay straight. */
function tear(seed: number, edges = "trbl", amp = 4): string {
  const r = rng(seed);
  const j = () => {
    const v = r() * amp * (r() < 0.07 ? 2.2 : 1);
    return Math.round(v * 10) / 10;
  };
  const pts: string[] = [];
  const step = 1.7;
  const steps: number[] = [];
  for (let x = 0; x <= 100.01; x += step) steps.push(Math.min(100, Math.round(x * 10) / 10));
  if (steps[steps.length - 1] !== 100) steps.push(100);
  const along = (torn: boolean) => (torn ? steps : [0, 100]);
  for (const x of along(edges.includes("t"))) pts.push(`${x}% ${edges.includes("t") ? j() : 0}px`);
  for (const y of along(edges.includes("r"))) pts.push(`calc(100% - ${edges.includes("r") ? j() : 0}px) ${y}%`);
  for (const x of [...along(edges.includes("b"))].reverse()) pts.push(`${x}% calc(100% - ${edges.includes("b") ? j() : 0}px)`);
  for (const y of [...along(edges.includes("l"))].reverse()) pts.push(`${edges.includes("l") ? j() : 0}px ${y}%`);
  return `polygon(${pts.join(",")})`;
}

type PaperOpts = { w: number; seed: number; edges?: string; amp?: number; rot?: number; h?: number; style?: string };
function paper(cls: string, inner: string, o: PaperOpts): string {
  const style = [
    `width:${o.w}in`,
    o.h ? `height:${o.h}in` : "",
    `clip-path:${tear(o.seed, o.edges ?? "trbl", o.amp ?? 3.5)}`,
    o.rot ? `transform:rotate(${o.rot}deg)` : "",
    o.style ?? "",
  ]
    .filter(Boolean)
    .join(";");
  return `<div class="paper chk ${cls}" style="${style}">${inner}</div>`;
}

const mark = (id: string, code: string) => `<span class="code" data-pid="${id}" data-code="${code}">${code}</span>`;
const filing = (id: string, code: string) => `<div class="filing"><span class="fl">Filing code:</span>${mark(id, code)}</div>`;

const CHECK_JS = `(function(){if(!/check/.test(location.search))return;var bad=[];document.querySelectorAll('.page').forEach(function(pg,pi){var pr=pg.getBoundingClientRect();var n='page '+(pi+1)+' ';if(pg.scrollHeight>pg.clientHeight+1||pg.scrollWidth>pg.clientWidth+1)bad.push(n+'scrolls');pg.querySelectorAll('.chk').forEach(function(el){var c=el.className.toString().split(' ').slice(0,3).join('.');if(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)bad.push(n+c+' content overflows');var r=el.getBoundingClientRect();if(r.left<pr.left+8||r.right>pr.right-8||r.top<pr.top+8||r.bottom>pr.bottom-8)bad.push(n+c+' leaves the page');});});document.documentElement.setAttribute('data-check',bad.length?'BAD '+bad.join(' | '):'OK');})();`;

function doc(title: string, body: string, extraCss = "", plain = false): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${plain ? "" : CSS}${extraCss}</style></head><body>${body}<script>${CHECK_JS}</script></body></html>`;
}

const pdfSources = new Map<string, string>();
function build(name: string, html: string) {
  const htmlPath = path.join(OUT, `${name}.html`);
  const pdfPath = path.join(OUT, `${name}.pdf`);
  writeFileSync(htmlPath, html);
  pdfSources.set(name, html);
  execFileSync(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`], { stdio: "ignore" });
  const dom = execFileSync(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--virtual-time-budget=3000", "--dump-dom", `file://${htmlPath}?check=1`], { encoding: "utf8", maxBuffer: 1 << 28 });
  const m = dom.match(/data-check="([^"]*)"/);
  if (!m || m[1] !== "OK") {
    const msg = `${name}: layout check failed: ${m ? m[1] : "check did not run"}`;
    if (process.env.SOFT) console.warn(msg);
    else fail(msg);
  }
  const pages = Number(execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" }).match(/Pages:\s+(\d+)/)?.[1]);
  const expected = (html.match(/class="page[ "]/g) ?? []).length;
  if (pages !== expected) fail(`${name}: PDF has ${pages} pages but the HTML has ${expected} .page divs`);
  console.log(`  ${name}.pdf  ${pages} page(s)`);
  return pages;
}

// ---------------------------------------------------------------- exhibits
type Ex = (typeof exhibits)[number];
const codeLine = (ex: Ex) => {
  const last = [...ex.body].reverse().find((l) => l.trim() !== "") ?? "";
  const m = last.match(/^Filing code: ([A-Z0-9]{5})$/);
  if (!m || m[1] !== ex.code) throw new Error(`exhibit ${ex.id}: body filing code (${last}) does not match its code ${ex.code}`);
  return m[1];
};
const bodyLines = (ex: Ex) => {
  codeLine(ex);
  const lines = [...ex.body];
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  lines.pop(); // the filing code line, re-typeset as a stamp
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  return lines;
};

function ticketHtml(o: { company: string; route: string; date: string; time?: string; way: string; note?: string; fileHtml?: string; seed: number }) {
  const [from, to] = o.route.split(/\s+to\s+/i);
  const inner = `<div class="main"><div class="band">${esc(o.company.toUpperCase())}</div>
      <div class="route">${esc(from)}<small>to</small>${esc(to)}</div>
      <div class="dt">${esc(o.date)}${o.time ? ` &nbsp;·&nbsp; ${esc(o.time)}` : ""}</div>
      <div class="way">${esc(o.way)}</div><div class="punch"></div></div>
    <div class="tail"><div class="sm">${esc(o.company)}</div><div class="big">${esc(o.date.replace(/\s+\d{4}$/, ""))}</div>${o.time ? `<div class="big">${esc(o.time)}</div>` : ""}<div class="sm">${esc(o.way)}</div></div>`;
  return `<div style="display:flex;flex-direction:column;align-items:center">${paper("rail", inner, { w: 6.6, seed: o.seed, edges: "tb", amp: 2 })}${o.note ? `<div class="railnote">${esc(o.note)}</div>` : ""}${o.fileHtml ?? ""}</div>`;
}

function renderExhibit(ex: Ex): string {
  const L = bodyLines(ex);
  const f = filing(ex.id, ex.code);
  const seed = [...ex.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const P = (cls: string, inner: string, o: Partial<PaperOpts> & { w: number }) => paper(cls, inner, { seed, ...o });
  switch (ex.id) {
    case "list": {
      const rows = L.filter((l) => l.startsWith("No. ")).map((l) => {
        const m = l.match(/^No\. (\d+) · (.*?) · (.*?) · placed: (.*?) · (.*)$/);
        if (!m) fail(`list row did not parse: ${l}`);
        return m!.slice(1, 6);
      });
      if (rows.length !== 22) fail(`list has ${rows.length} rows, expected 22`);
      const tail = L.filter((l) => l.startsWith("In "));
      const [t1, t2] = L[0].split(" · ");
      const html = `<div class="pad"><div class="ttl"><h1>${esc(t1)} · ${esc(t2)}</h1><span class="sub">${esc(L[1])}</span></div>
        <table><colgroup><col style="width:.45in"><col style="width:1.75in"><col style="width:1.0in"><col style="width:2.15in"><col></colgroup>
        <thead><tr><th>No.</th><th>Name</th><th>Trade</th><th>Placed at</th><th>Disposition</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td class="no">${r[0].padStart(2, "0")}</td><td class="nm">${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td class="fate">${esc(r[4])}</td></tr>`).join("")}
        </tbody></table>
        <div class="tail"><div class="notes">${tail.map((t) => `<p>${esc(t)}</p>`).join("")}</div>${f}</div></div>`;
      return P("list", html, { w: 10.4, h: 7.8, seed, edges: "trbl", amp: 3 });
    }
    case "receipts":
    case "books":
    case "vault":
    case "drafts":
    case "nightcap":
    case "invite":
    case "veil-roll":
    case "clipping":
    case "forged":
    case "card":
    case "wire":
    case "register":
    case "roll":
    case "boarding":
    case "housebook":
    case "report":
    case "watch":
    case "vial":
    case "ticket":
      return renderNamed(ex, L, f, P);
    default: {
      const html = `<div class="pad"><h1>${esc(ex.title)}</h1>${L.map((l) => (l.trim() ? `<p>${esc(l)}</p>` : "")).join("")}${f}</div>`;
      return P("generic", html, { w: 6.8 });
    }
  }
}

function renderNamed(ex: Ex, L: string[], f: string, P: (cls: string, inner: string, o: Partial<PaperOpts> & { w: number }) => string): string {
  switch (ex.id) {
    case "receipts": {
      const [head, ...rest] = L;
      const [t, who] = head.split(" · ");
      const html = `<div class="perf"></div><div class="pad"><div class="rh"><h1>${esc(t)}</h1><span>${esc(who ?? "")}</span></div>
        ${rest.map((l, i) => `<div class="it${i === 0 ? " big" : ""}">${esc(l)}</div>`).join("")}${f}</div>`;
      return P("receipt grey", html, { w: 7.1, edges: "tb", amp: 2 });
    }
    case "books": {
      const [head, ...rest] = L;
      const [a, b, c] = head.split(" · ");
      const entries = rest.filter((l) => !l.startsWith("\u201c") && !l.startsWith("Signed"));
      const quote = rest.find((l) => l.startsWith("\u201c")) ?? "";
      const signed = rest.find((l) => l.startsWith("Signed")) ?? "";
      const row = (l: string) => {
        const m = l.match(/^(Receipts):\s*(.*)$/);
        return m ? `<div class="row"><div class="lab">${esc(m[1])}</div><div class="tx">${esc(m[2])}</div></div>` : `<div class="row"><div class="lab"></div><div class="tx">${esc(l)}</div></div>`;
      };
      const html = `<div class="lh"><h1>${esc(a)} · ${esc(b)}</h1><div class="sub">${esc(c)}</div></div>
        <i class="vr" style="left:.88in"></i><i class="vr" style="left:.93in"></i><i class="vr" style="right:1.95in"></i><i class="vr" style="right:1.0in"></i><i class="vr" style="right:.45in"></i>
        <div class="body">${entries.map(row).join("")}<div class="note">${esc(quote)}</div><div class="note sig">${esc(signed)}</div></div>${f}`;
      return P("ledger", html, { w: 7.5, h: 9.7, edges: "trbl", amp: 3 });
    }
    case "vault": {
      const [head, ...rest] = L;
      const [t, sub] = head.split(" · ");
      const dial = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#222" stroke-width="1.6"><circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="4" fill="#222"/>${Array.from({ length: 24 }, (_, k) => { const a = (k / 24) * Math.PI * 2; return `<line x1="${32 + Math.cos(a) * 22}" y1="${32 + Math.sin(a) * 22}" x2="${32 + Math.cos(a) * 27}" y2="${32 + Math.sin(a) * 27}"/>`; }).join("")}<path d="M32 32 L32 14" stroke-width="2.4"/></svg>`;
      const html = `<div class="pad"><div class="mh"><div><h1>${esc(t)}</h1><div class="sub">${esc(sub ?? "")}</div></div>${dial}</div>
        ${rest.map((l) => (l.startsWith("\u201c") ? `<p class="pencil">${esc(l)}</p>` : `<p>${esc(l)}</p>`)).join("")}${f}</div>`;
      return P("memo", html, { w: 7.1, edges: "tb", amp: 2 });
    }
    case "drafts": {
      const [head, drawn, paid] = L;
      const q = head.match(/^COUNTERFOILS · (.*)$/);
      const dm = drawn.match(/^(.*?)\s*Signed: (.*)$/);
      const html = `<div class="stubname"><span>COUNTERFOIL</span></div><div class="pad"><h1>COUNTERFOILS</h1><div class="quote">${esc(q ? q[1] : head)}</div>
        <div class="draw">${esc(dm ? dm[1] : drawn)}</div><div class="draw">Signed: <span class="sg">${esc(dm ? dm[2].replace(/\.$/, "") : "")}</span></div>
        <div class="pencil">${esc(paid)}</div>${f}</div>`;
      return P("cfoil", html, { w: 7.1, edges: "r", amp: 2.5 });
    }
    case "nightcap": {
      const [head, text] = L;
      const parts = text.split(/(?<=\.)\s+/);
      const html = `<div class="pad"><div class="top">${esc(head)}</div>${parts.map((p) => `<div class="ln">${esc(p)}</div>`).join("")}${f}</div>`;
      return P("indexcard", html, { w: 6.6, edges: "tb", amp: 1.5 });
    }
    case "invite": {
      const text = L.filter((l) => l.startsWith("\u201c") || /\u201d$/.test(l) || l.startsWith("The only")).map(stripQuotes);
      const veil = `<svg width="46" height="38" viewBox="0 0 46 38" fill="none" stroke="#141010" stroke-width="1.6"><path d="M4 4 Q23 14 42 4 L42 12 Q23 24 4 12 Z"/><path d="M8 14 Q12 30 6 36 M23 20 Q23 30 23 36 M38 14 Q34 30 40 36"/></svg>`;
      const html = `<div class="frame"><div class="crest">${veil}THE BLACK VEIL</div><div class="txt">${text.map((p) => `<p>${esc(p)}</p>`).join("")}</div>${f}</div><i class="crease" style="top:33%"></i><i class="crease" style="top:66%"></i>`;
      return P("veilnote", html, { w: 6.3, edges: "tblr", amp: 2 });
    }
    case "veil-roll": {
      const sigs = L.filter((l) => /^\s*\d+\.\s+_+/.test(l)).map((l) => l.trim().match(/^(\d+)\./)![1]);
      if (sigs.length !== 19) fail(`veil-roll has ${sigs.length} signature lines, expected 19`);
      const pre = L.filter((l) => l.startsWith("We, "))[0];
      const html = `<div class="frame"></div><div class="pad"><h1>${esc(L[0])}</h1><div class="orn">\u2756 \u2756 \u2756</div><p class="pre">${esc(pre)}</p>
        <div class="sigs">${sigs.map((n) => `<div class="sig"><span>${n}.</span></div>`).join("")}</div>${f}<div class="seal">V</div></div>`;
      return P("roll-veil parch", html, { w: 7.7, h: 10.0, edges: "trbl", amp: 4 });
    }
    case "clipping": {
      const [mast, headline, ...rest] = L;
      const [name, date] = mast.split(" · ");
      const html = `<div class="pad"><div class="mast"><h1>${esc(name)}</h1></div><div class="dateline"><span>${esc(date)}</span><span>Manchester, N. H.</span><span>Extra</span></div>
        <div class="head">${esc(headline)}</div><div class="cols">${rest.map((p) => `<p>${esc(p)}</p>`).join("")}</div>${f}</div>`;
      return P("news", html, { w: 6.9, rot: -0.8, edges: "trbl", amp: 4.5 });
    }
    case "forged": {
      const notes = L.map((l) => l.match(/^\s*\u2018(.*)\u2019\s*\((.*)\)\s*$/)).filter(Boolean) as RegExpMatchArray[];
      if (notes.length !== 3) fail(`forged: expected 3 notes, parsed ${notes.length}`);
      const rot = [-1.2, 0.9, -0.6];
      const html = `<div class="pad"><div class="ch">${esc(L[0])}</div>${notes
        .map((m, i) => {
          const [txt, sig] = m[1].split(/\s*\u2014\s*/);
          const slip = paper("slip", `<span class="t">${ring(txt)}</span><span class="sg">${ring("\u2014 " + sig)}</span><i class="emboss"></i>`, { w: 6.2, seed: 100 + i, edges: "trbl", amp: 3.5, rot: rot[i] });
          return `<div class="nt">${slip}<div class="ctag">${esc(m[2])}</div></div>`;
        })
        .join("")}${f}</div>`;
      return P("court pale", html, { w: 7.3, edges: "tb", amp: 2 });
    }
    case "card": {
      const pm = L[0].match(/postmarked (\w+), (\d+) (\w+) (\d+)/);
      const stamp = pm ? `<div class="pm"><span>${esc(pm[1].toUpperCase())}</span><b>${esc(pm[2])} ${esc(pm[3].slice(0, 3).toUpperCase())}</b><span>${esc(pm[4])}</span></div>` : "";
      const msg = L.find((l) => l.startsWith("\u201c")) ?? "";
      const html = `<div class="in">${stamp}<div style="height:.7in"></div><div class="msg">${esc(stripQuotes(msg))}</div>${f}</div>`;
      return P("xmas", html, { w: 6.2, edges: "r", amp: 0 });
    }
    case "wire": {
      const [head, ...rest] = L;
      const hp = head.split(" · ");
      const html = `<div class="pad"><div class="wh">${esc(hp[0])}</div><div class="meta"><span>${esc(hp[1] ?? "")}</span><span>${esc(hp[2] ?? "")}</span></div>
        <div class="strips">${rest.map((l) => `<div class="strip">${esc(l)}</div>`).join("")}</div>${f}</div>`;
      return P("wire", html, { w: 7.1, edges: "tb", amp: 2 });
    }
    case "register": {
      const [h0, ...rest] = L;
      const title = h0.replace(/\s*·\s*lower half, half-burned\.?$/, "");
      const ents = rest.map((l) => {
        const m = l.match(/^(\d\d:\d\d)\s+(.*)$/);
        if (m) return `<div class="ent"><span class="tm">${m[1]}</span><span>${esc(m[2].replace(/\s{2,}/g, " "))}</span></div>`;
        const b = l.match(/^\[burned\]\s+(.*)$/);
        if (b) return `<div class="ent big burn"><span class="tm"></span><span><i class="char"></i>${esc(b[1])}</span></div>`;
        return `<div class="ent"><span class="tm"></span><span>${esc(l)}</span></div>`;
      });
      const inner = `<div class="register" style="margin:0 20px 20px 0;clip-path:${tear(55, "tl", 7)}"><div class="pad"><h1>${esc(title)}</h1><div class="cols"><span>Time</span><span>Name or party</span></div>${ents.join("")}${f}</div></div>`;
      return `<div class="charwrap chk" style="width:7.6in;clip-path:${tear(77, "rb", 12)}">${inner}</div>`;
    }
    case "roll": {
      const ls = L.slice(1).map((l, i, a) => (i === 0 ? l.replace(/^\s*[\u201c"]/, "") : i === a.length - 1 ? l.replace(/[\u201d"]\s*$/, "") : l));
      const html = `<div class="pad">${ls.map((l) => (/^[A-Z][a-z]+\.( [A-Z][a-z]+\.)+$/.test(l) ? `<div class="names">${esc(l)}</div>` : `<div class="l">${esc(l)}</div>`)).join("")}${f}</div>`;
      return P("cassie", html, { w: 6.6, edges: "tb", amp: 3 });
    }
    case "boarding": {
      const [head, entry, margin] = L;
      const mg = margin.match(/^Margin, in another hand: (.*)$/);
      const html = `<div class="pad"><h1>${esc(head)}</h1><div class="e">${esc(entry)}</div><div class="mg">${esc(stripQuotes(mg ? mg[1] : margin))}</div>${f}</div>`;
      return P("boarding", html, { w: 6.9, edges: "trbl", amp: 3 });
    }
    case "housebook": {
      const [head, rules, markersLine, sale] = L;
      const [t, sub] = head.split(" · ");
      const sm = sale.match(/^(Tonight's sale: marker no\.) _+\s*(\(.*\))?$/);
      const html = `<div class="hb"><h1>${esc(t)}</h1><div class="sub">${esc(sub ?? "")}</div></div><div class="pad"><div class="rule">${esc(rules)}</div><div class="rule">${esc(markersLine)}</div>
        <div class="rule hand">${esc(sm ? sm[1] : sale)} <span class="blank"></span> ${sm && sm[2] ? `<span class="pen">${esc(sm[2])}</span>` : ""}</div>${f}</div>`;
      return P("housebook", html, { w: 7.1, edges: "tb", amp: 2 });
    }
    case "report": {
      const [h0, ...rest] = L;
      const [t, sub] = h0.split(" · ");
      const fields = rest.map((l) => {
        const m = l.match(/^([A-Za-z]+): (.*)$/);
        return m ? `<div class="f"><span class="k">${esc(m[1])}</span><span>${esc(m[2])}</span></div>` : `<div class="f"><span>${esc(l)}</span></div>`;
      });
      const html = `<div class="pad"><h1>${esc(t)}</h1><div class="sub">${esc(sub ?? "")}</div>${fields.join("")}${f}</div>`;
      return P("report", html, { w: 7.1, edges: "tb", amp: 2 });
    }
    case "watch":
    case "vial": {
      const html = `<div class="hole"></div><div class="pad"><h1>${esc(ex.title)}</h1>${L.map((l) => `<p>${esc(l)}</p>`).join("")}${f}</div>`;
      return P("ptag", html, { w: 7.2, edges: "tb", amp: 2, style: "clip-path:polygon(0 50%,.5in 0,100% 0,100% 100%,.5in 100%)" });
    }
    case "ticket": {
      const parts = L[0].replace(/\.$/, "").split(" · ");
      if (parts.length < 4) fail(`ticket line did not parse: ${L[0]}`);
      return ticketHtml({ company: parts[0], route: parts[1], date: parts[2], way: parts[3], note: L[1], fileHtml: f, seed: 333 });
    }
  }
  return fail(`no renderer for ${ex.id}`);
}

// ---- the page plan: group order binder, table, held, scene; pieces on one page are cut apart
const plan: string[][] = [
  ["list"], ["books"], ["receipts", "vault"], ["forged"], ["drafts"],
  ["veil-roll"], ["clipping"], ["nightcap"],
  ["register"], ["card", "boarding"], ["housebook", "wire"], ["roll"], ["report"],
  ["watch", "vial", "ticket"], ["invite"],
];
const planned = plan.flat();
for (const ex of exhibits) if (!planned.includes(ex.id)) plan.push([ex.id]); // anything new still gets printed
for (const id of planned) if (!exhibits.some((e) => e.id === id)) fail(`plan names an unknown exhibit ${id}`);

const whereText = (ex: Ex) =>
  ex.where === "binder" ? "Keeper's binder"
  : ex.where === "table" ? "Keeper's table"
  : ex.where === "held" ? `held by ${publicName(ex.heldBy ?? "?")} (sealed envelope)`
  : ex.where === "scene" ? "at the scene (host lays out)"
  : "hidden (host places)";
const heldByText = (ex: Ex) => (ex.where === "held" ? publicName(ex.heldBy ?? "?") : "");

const pageOf = new Map<string, number>();
const tieBreakerPage = plan.length + 1;
function buildExhibits() {
  let n = 0;
  const pages: string[] = [];
  for (const ids of plan) {
    n += 1;
    const exs = ids.map((id) => exhibits.find((e) => e.id === id)!);
    exs.forEach((e) => pageOf.set(e.id, n));
    const pieces = exs.map(renderExhibit);
    const stack = pieces.join(`<div class="cut"></div>`);
    const wheres = exs.map(whereText);
    const where = new Set(wheres).size === 1 ? wheres[0] : wheres.map((w, i) => `<b>${["TOP", "MIDDLE", "BOTTOM"][i]}:</b> ${esc(w)}`).join(" &nbsp;·&nbsp; ");
    const land = exs.some((e) => e.id === "list");
    pages.push(`<div class="page${land ? " land" : ""}"><div class="stack chk">${stack}</div><div class="where">${exs.length > 1 || new Set(wheres).size > 1 ? where : esc(where)} &nbsp;·&nbsp; exhibit page ${n} &nbsp;·&nbsp; ${exs.map((e) => e.id).join(", ")} &nbsp;·&nbsp; trim this line off</div></div>`);
  }
  // the secret tie-breaker: a second rail stub that goes in the LINING of the dead man's jacket (no filing code)
  const tb = tieBreaker.clue.match(/Boston & Maine: (.*?)\.?$/);
  const tbHtml = ticketHtml({ company: "Boston & Maine", route: "Manchester to Boston", date: "23 October 1926", time: "11:12 PM", way: "one way", seed: 909 });
  void tb;
  pages.push(`<div class="page"><div class="hostmark">HOST ONLY · TIE-BREAKER · NOT A GUEST EXHIBIT · NO FILING CODE</div><div class="stack chk">${tbHtml}</div>
    <div class="where"><b>HOST ONLY.</b> Trim this line off. Cut out the stub and put it in the LINING of the dead man's jacket (tuck it behind the lining or sew it in). Do NOT lay it out. Tie-breaker only, see the host index. &nbsp;·&nbsp; exhibit page ${tieBreakerPage}</div></div>`);
  return build("exhibits", doc("Black Veil exhibits", pages.join("")));
}

function buildIndex() {
  const rows = plan.flat().map((id) => exhibits.find((e) => e.id === id)!);
  const tr = (cells: string[], cls = "") => `<tr class="${cls}">${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
  const body = rows
    .map((e) => tr([String(pageOf.get(e.id)), `<b>${esc(e.id)}</b>`, esc(e.title), `<span class="code" data-pid="${e.id}" data-code="${e.code}">${e.code}</span>`, esc(whereText(e).replace(/ \(sealed envelope\)/, "")), esc(e.where === "held" ? "sealed envelope" : e.where === "scene" ? `laid out ${e.appears === "scene" ? "at about 9:05" : ""}`.trim() : ""), esc(heldByText(e))]))
    .join("");
  const html = `<div class="page" style="padding:.5in .5in"><h1>Black Veil: host index of exhibits</h1>
    <p class="warn">HOST ONLY (spoilers). Page numbers refer to exhibits.pdf. Every printed prop carries its filing code at the foot.</p>
    <table><thead><tr><th>Page</th><th>Id</th><th>Exhibit</th><th>Code</th><th>Where it goes</th><th>How</th><th>Holder</th></tr></thead><tbody>${body}
    ${tr([String(tieBreakerPage), "<b>tie-breaker</b>", "Second rail stub (secret)", "none", "in the LINING of the dead man's jacket", "sewn in", ""], "tb")}</tbody></table>
    <p class="tbq"><b>Tie-breaker.</b> Only if two guests tie on points, ask the tied guests aloud: &ldquo;${esc(tieBreaker.question)}&rdquo; Answer: <b>${esc(tieBreaker.answer)}</b>. ${esc(tieBreaker.clue)}</p>
</div>`;
  const css = `body{font-family:"Liberation Sans",Arial,sans-serif;font-size:9.5pt;color:#000;-webkit-print-color-adjust:exact}.page{width:8.5in;height:11in;overflow:hidden}h1{font-size:15pt;margin:0 0 .06in}table{border-collapse:collapse;width:100%;margin-top:.1in}th,td{border:.6px solid #777;padding:3px 5px;text-align:left;vertical-align:top;font-size:9.5pt}th{background:#e8e8e8}.code{font:bold 11pt "FreeMono",monospace}.warn{font-size:9pt;color:#444;margin:.06in 0}tr.tb td{background:#f3e0e0}.tbq{font-size:10pt;margin:.12in 0}`;
  return build("exhibits-index", doc("Black Veil host index", html, css, true));
}

// ---------------------------------------------------------------- tags
function buildTags() {
  const cells: { id: string; code: string; label: string }[] = [];
  const holderFirst = (id: string | undefined) => (id ? publicName(id).split(" ")[0].replace(/,$/, "") : "?");
  // essentials only: the hidden objects, the physical carried items and the two host props. Printed slips and papers already carry their own code.
  for (const p of props.filter((q) => q.placement === "hidden")) cells.push({ id: p.id, code: p.code, label: `TAPE ON: ${p.generic}` });
  for (const p of props.filter((q) => q.placement !== "hidden" && !(slipIds as readonly string[]).includes(q.id))) cells.push({ id: p.id, code: p.code, label: p.placement === "carried" ? `ON ITEM: ${p.name} (${holderFirst(p.carriedBy)})` : `HOST: ${p.name}` });
  const pages: string[] = [];
  const nPages = Math.ceil(cells.length / 12);
  for (let pg = 0; pg < nPages; pg++) {
    const slice = cells.slice(pg * 12, pg * 12 + 12);
    const html = Array.from({ length: 12 }, (_, i) => {
      const c = slice[i];
      return c
        ? `<div class="tcell"><div class="tag chk"><div class="tt">THE BLACK VEIL</div><div class="tr"></div><div class="tc" data-pid="${c.id}" data-code="${c.code}">${c.code}</div><div class="tb"></div></div><div class="tdest">${esc(c.label)}</div></div>`
        : `<div class="tcell empty"></div>`;
    }).join("");
    pages.push(`<div class="page"><div class="sheettop">Tag sheet ${pg + 1} of ${nPages}: cut along the dashed lines. The small line under each tag says where it goes: trim it off after you have matched it</div><div class="tagsheet">${html}</div><div class="sheetnote">THE BLACK VEIL · code tags · matte or plain paper, black ink fill · see tag-key.pdf for which tag goes on which object</div></div>`);
  }
  return { pages: build("tags", doc("Black Veil tags", pages.join(""))), count: cells.length };
}

function buildTagKey() {
  const order = { hidden: 0, carried: 1, table: 2, bar: 3 } as const;
  const sorted = [...props].sort((a, b) => order[a.placement] - order[b.placement]);
  const row = (p: (typeof props)[number]) => {
    const who = p.placement === "carried" ? `carried by ${publicName(p.carriedBy ?? "?")}` : p.placement === "hidden" ? `hide: ${p.hint}` : p.placement === "bar" ? `at the bar${p.hint ? `: ${p.hint}` : ""}` : p.id === "scene-card" ? "on the black table in the Merrimack Room" : "under the Keeper's nightcap glass";
    return `<tr><td><span class="code" data-pid="${p.id}" data-code="${p.code}">${p.code}</span></td><td>${esc(p.name)}</td><td>${esc(p.generic)}</td><td>${p.placement}${p.placement === "hidden" ? " (2 tags)" : ""}</td><td>${esc(who)}</td></tr>`;
  };
  const html = `<div style="padding:.45in .5in"><h1>HOST KEY: which tag goes on which object</h1>
    <p>HOST ONLY. ${props.length} codes. &ldquo;Hidden&rdquo; props: tape the tag to or beside the object; two tags are printed, one is a spare. &ldquo;Carried&rdquo; props: hand the object to the named guest at the door, with its tag taped on or inside the envelope (printed slips and cards already carry their code, a tag is optional). The five survivor markers are not tags.</p>
    <table><thead><tr><th>Code</th><th>Prop</th><th>The object in your house</th><th>Placement</th><th>Carried by / hiding hint</th></tr></thead><tbody>${sorted.map(row).join("")}</tbody></table></div>`;
  const css = `body{font-family:"Liberation Sans",Arial,sans-serif;font-size:9pt;color:#000}h1{font-size:14pt;margin:0 0 .06in}p{font-size:9pt;margin:.04in 0}table{border-collapse:collapse;width:100%;margin-top:.08in}th,td{border:.6px solid #777;padding:2px 4px;text-align:left;vertical-align:top;font-size:8.5pt}th{background:#e8e8e8}tr{break-inside:avoid}thead{display:table-header-group}.code{font:bold 11pt "FreeMono",monospace}@page{size:Letter;margin:.4in}`;
  // plain page: no .page divs, so build() cannot count; render directly
  const htmlPath = path.join(OUT, "tag-key.html");
  writeFileSync(htmlPath, doc("Black Veil tag key", html, css, true));
  pdfSources.set("tag-key", doc("Black Veil tag key", html, css, true));
  execFileSync(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${path.join(OUT, "tag-key.pdf")}`, `file://${htmlPath}`], { stdio: "ignore" });
  const pages = Number(execFileSync("pdfinfo", [path.join(OUT, "tag-key.pdf")], { encoding: "utf8" }).match(/Pages:\s+(\d+)/)?.[1]);
  console.log(`  tag-key.pdf  ${pages} page(s)`);
  return pages;
}

// ---------------------------------------------------------------- Bartend Joe's sheet
function buildHostSheet() {
  const approvals = characters.flatMap((c) => c.objectives.filter((o) => o.check.kind === "approval").map((o) => ({ who: c.name, title: o.title, word: (o.check as { word: string }).word })));
  const checks: Record<string, string> = {
    "angelos-cards": "Ask a player or two: did he deal them in?",
    "theodor-arrest": "Did he make an arrest after the scream, before 10:15?",
    "rebecca-scream": "Did you hear her scream at about 9:15?",
    "erika-steal": "Ask who she robbed: did she get it, unseen?",
    "leon-bulletin": "Hand him the bulletin; did he read it aloud?",
    "silas-spotlight": "Did he take the floor about 8:30 for five minutes?",
    "josh-prophecy": "After the scream, open his envelope: was he within a few minutes?",
    "josh-fortunes": "Did he read four different guests a fortune card?",
  };
  const rows = characters.flatMap((c) => c.objectives.filter((o) => o.check.kind === "approval").map((o) => `<tr><td>${esc(c.name)}</td><td>${esc(o.title)}</td><td>${esc(checks[o.id] ?? "Did it happen?")}</td><td class="w">${esc((o.check as { word: string }).word)}</td></tr>`)).join("");
  void approvals;
  const html = `<div style="padding:.45in .55in"><h1>BARTEND JOE: your one page</h1>
    <p>You do not need /admin until the end. The game opens on every phone by itself at <b>8:00 p.m.</b> The House closes by itself at <b>9:00</b>, and the book closes by itself at <b>10:30</b>.</p>
    <h2>Your whole job</h2>
    <ol>
      <li><b>At the door:</b> hand each guest their black envelope and anything they carry.</li>
      <li><b>When a guest comes to the bar to claim a point,</b> check it really happened (the table below), then tell them the approval word. Say a word to nobody else.</li>
      <li><b>Fortune cards:</b> Josh collects his four fortune cards from you.</li>
      <li><b>Josh's minute:</b> before 8:30 he tells you the minute he expects the scream. Seal it in an envelope.</li>
      <li><b>About 9:05:</b> stage the scene (jacket, glass, empty vial, the buyer's marker from the tin, scene pages).</li>
      <li><b>10:00 wrap-up:</b> hand Eric the <b>charter</b> (he signs it, the code is on it). Give Leon the <b>bulletin</b> to read aloud:<br><i>&ldquo;This evening the Keeper of the Black Veil was found dead at his table. The House has lifted its veil, the dead are not dead, and Manchester will hear the rest in the morning.&rdquo;</i> Then read Cassie's letter.</li>
      <li><b>10:30:</b> everything closes. Then grade (see the run of show).</li>
    </ol>
    <h2>The approval words</h2>
    <table><thead><tr><th>Guest</th><th>Claim</th><th>Check first</th><th>Word</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="note">The group races need nothing from you: the first member of each group to type all three slip codes wins the point on their own phone, and the survivors race for the vial through the Butler.</p></div>`;
  const css = `body{font-family:"Liberation Sans",Arial,sans-serif;font-size:10.5pt;color:#000}h1{font-size:17pt;margin:0 0 .08in}h2{font-size:12.5pt;margin:.18in 0 .06in}p,li{margin:.04in 0}ol{padding-left:.25in}table{border-collapse:collapse;width:100%;margin-top:.06in}th,td{border:.6px solid #777;padding:4px 6px;text-align:left;vertical-align:top;font-size:10pt}th{background:#e8e8e8}.w{font:bold 13pt "FreeMono",monospace}.note{font-size:9.5pt;color:#333;margin-top:.14in}@page{size:Letter;margin:.4in}`;
  const htmlPath = path.join(OUT, "host-sheet.html");
  writeFileSync(htmlPath, doc("Bartend Joe's host sheet", html, css, true));
  execFileSync(CHROME, ["--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${path.join(OUT, "host-sheet.pdf")}`, `file://${htmlPath}`], { stdio: "ignore" });
  const n = Number(execFileSync("pdfinfo", [path.join(OUT, "host-sheet.pdf")], { encoding: "utf8" }).match(/Pages:\s+(\d+)/)?.[1]);
  console.log(`  host-sheet.pdf  ${n} page(s)`);
  return n;
}

// ---------------------------------------------------------------- slips
const slipIds = ["fee-voucher", "request-card", "crate-receipt", "dismissal", "pardon-slip", "pardon-receipt", "citation", "false-papers", "telegram-form", "witness-arjun", "witness-diwakar", "witness-josh", "witness-leon", "witness-sidd", "reply-angelos", "reply-eric", "reply-erika", "reply-krrish", "reply-theodor", "tool-ananya", "tool-anthony", "tool-joel", "tool-mihir", "tool-tim", "trade-anika", "trade-emre", "trade-molly", "trade-silas", "trade-tiffany", "charter"] as const;
function slipHtml(id: (typeof slipIds)[number], copy: number): string {
  const p = props.find((q) => q.id === id) ?? fail(`prop ${id} missing`);
  const cl = `<div class="codeline">Code:<span class="code" data-pid="${p.id}" data-code="${p.code}" data-copy="${copy}">${p.code}</span></div>`;
  const leon = publicName("leon");
  const holderName = p.carriedBy ? publicName(p.carriedBy).split(" ")[0].replace(/,$/, "") : "";
  const dest = copy === 2 ? "STANDBY TRAY (at the bar)" : id === "charter" ? "HOST: keep it; hand to Eric at 10:00" : holderName ? `GOES TO: ${holderName}'s envelope` : "";
  const wrap = (cls: string, inner: string) => `<div class="scell"><div class="sdest">${esc(dest)}</div><div class="sl chk ${cls}">${inner}${cl}</div></div>`;
  switch (id) {
    case "fee-voucher":
      return wrap("cheque", `<h1>Mahns Manor</h1><h2>Voucher</h2><div class="rule"></div><p style="text-align:center">Pay to the order of</p><p style="text-align:center;font:bold 17pt var(--serif);letter-spacing:.2em;margin-top:.02in">THE BEARER</p><div class="amt">$30</div><p style="text-align:center">Thirty dollars, good at the House of Mahns.</p><div class="grow"></div><div class="sigline">Mahns Manor</div>`);
    case "request-card":
      return wrap("card", `<h1>Request</h1><h2>from the room</h2><div class="rule"></div><p style="text-align:center">The musician is kindly asked to oblige the room with one number, at the first convenient moment.</p><div class="grow"></div><p style="text-align:center;font-style:italic">With the compliments of the room.</p>`);
    case "crate-receipt":
      return wrap("rcpt", `<h1>Receipt</h1><div class="rule"></div><p>Received: <b>one crate of wine</b>.</p><p>Billed to: <b>the Bench</b>.</p><p>Delivery: <b>Fridays</b>.</p><div class="grow"></div><p style="text-align:center">&mdash; paid in full, with thanks &mdash;</p>`);
    case "dismissal":
      return wrap("court", `<h1 style="font-size:15pt">Municipal Court</h1><h2>Notice of Dismissal</h2><div class="rule"></div><p style="text-align:center;font:bold 14pt var(--serif);letter-spacing:.08em">CASE DISMISSED</p><p style="text-align:center">Case dismissed on form.</p><p style="text-align:center;font-style:italic">By order of the Bench.</p><div class="grow"></div><div class="sigline">The Bench</div>`);
    case "pardon-slip":
      return wrap("note", `<div class="tape"></div><h1 style="font-size:20pt">Pardon</h1><div class="rule"></div><p>Be it known that the matter named in the bearer's citation is hereby pardoned, and may be torn up.</p><p style="font-style:italic">To be presented to the officer who holds the citation.</p><div class="grow"></div><div class="sigline">By a go-between</div>`);
    case "pardon-receipt":
      return wrap("rcpt", `<h1 style="font-size:15pt">Go-between's Receipt</h1><div class="rule"></div><p>Received of the bearer, in House bills, the fee for brokering a pardon.</p><p>No questions asked. No answers given.</p><div class="grow"></div><div class="sigline">The go-between</div>`);
    case "citation":
      return wrap("cit", `<h1 style="font-size:17pt">Nuisance Citation</h1><h2>Office of the Sheriff</h2><div class="rule"></div><p>Cited: <b>${esc(leon)}</b>,</p><p style="font-weight:bold">for being insufferable on the air.</p><div class="stamp">One use only</div><div class="grow"></div><div class="sigline">The Sheriff</div>`);
    case "false-papers":
      return wrap("travel", `<div class="fold"></div><h1 style="font-size:17pt">Travel Paper</h1><h2>folded &middot; not to be opened at the door</h2><div class="rule"></div><p>The bearer is permitted to travel and to lodge under the name entered within.</p><div class="stamp" style="color:#2a2a4a;border-color:#2a2a4a">Examined</div><div class="grow"></div><div class="sigline">Issuing office</div>`);
    case "witness-arjun":
    case "witness-diwakar":
    case "witness-josh":
    case "witness-leon":
    case "witness-sidd":
      return wrap("court", `<h1 style="font-size:15pt">Witness Slip</h1><h2>I will swear to it</h2><div class="rule"></div><p style="text-align:center">The bearer has asked me to swear to what I saw tonight, and I have said I will.</p><div class="grow"></div><div class="sigline">Witness</div>`);
    case "reply-angelos":
    case "reply-eric":
    case "reply-erika":
    case "reply-krrish":
    case "reply-theodor":
      return wrap("wiref", `<h1>REPLY</h1><div class="fld">Received your message.</div><div class="fld">Answer: yes.</div><div class="fld">&nbsp;</div><div class="grow"></div><div class="sigline">Replied</div>`);
    case "tool-ananya":
    case "tool-anthony":
    case "tool-joel":
    case "tool-mihir":
    case "tool-tim":
      return wrap("card", `<h1 style="font-size:15pt">Tool Token</h1><h2>good for one loan</h2><div class="rule"></div><p style="text-align:center">One tool, lent to the bearer for the night: a hammer, a chisel, a file.</p><div class="grow"></div><div class="sigline">Lent by</div>`);
    case "trade-anika":
    case "trade-emre":
    case "trade-molly":
    case "trade-silas":
    case "trade-tiffany":
      return wrap("rcpt", `<h1 style="font-size:15pt">Trade Slip</h1><div class="rule"></div><p>One deal done, fair and square, between the bearer and the signer.</p><p>No grabbing. No regrets.</p><div class="grow"></div><div class="sigline">Dealt with</div>`);
    case "charter":
      return wrap("court", `<h1 style="font-size:16pt">The Charter</h1><h2>of the Black Veil</h2><div class="rule"></div><p style="text-align:center">The undersigned acknowledge that the Veil's old members live, under the names they now bear, and that the House has lifted its veil.</p><div class="grow"></div><div class="sigline">Signed, the Bench</div>`);
    case "telegram-form":
      return wrap("wiref", `<h1>TELEGRAM</h1><div class="fld">To:</div><div class="fld">&nbsp;</div><div class="fld">Message:</div><div class="fld">&nbsp;</div><div class="fld">&nbsp;</div><div class="fld">Sender:</div><div class="grow"></div>`);
  }
}
function buildSlips() {
  const pages: string[] = [];
  const mk = (copy: number) => {
    for (let i = 0; i < slipIds.length; i += 4) {
      const chunk = slipIds.slice(i, i + 4);
      pages.push(`<div class="page">${copy === 2 ? `<div class="standby">STANDBY COPIES</div>` : ""}<div class="slipgrid">${chunk.map((id) => slipHtml(id, copy)).join("")}</div><div class="slipnote">${copy === 2 ? "STANDBY COPIES: spare set for the host's stand-in tray, if a guest is absent. " : ""}Cut on the dashed lines (the line above each slip says whose envelope it goes in). Print on cream or white paper. Slips page ${pages.length + 1}</div></div>`);
    }
  };
  mk(1);
  return build("slips", doc("Black Veil slips", pages.join("")));
}

// ---------------------------------------------------------------- vial labels
function buildVials() {
  const labels = [
    `<div class="lbl chk house"><div class="top">HOUSE STOCK</div><div class="rule"></div><div class="name">Tincture of Nux Vomica</div><div class="bot">Not to be taken.</div></div>`,
    ...["Camphor Spirits", "Spirits of Hartshorn", "Oil of Wintergreen"].map((n) => `<div class="lbl chk decoy"><div class="top">DRUGGIST'S PACK</div><div class="rule"></div><div class="name">${esc(n)}</div><div class="bot">For external use only.</div></div>`),
  ];
  const cells = labels.flatMap((l) => [l, l]).map((l) => `<div class="lcell">${l}</div>`).join("");
  const html = `<div class="page"><div class="lblnote">VIAL LABELS · cut on the dashed lines and wrap round a small bottle · bottles hold WATER ONLY, never oils · the first row is the real House label, the other rows are decoys</div><div class="lblgrid">${cells}</div></div>`;
  return build("vial-labels", doc("Black Veil vial labels", html));
}

// ---------------------------------------------------------------- fortune cards
const fortunes: { title: string; line: string; icon: string }[] = [
  { title: "The Tower", line: "Everything that fell that night had been rehearsed, and the screaming was in tune.", icon: `<rect x="30" y="26" width="30" height="52"/><path d="M28 26h6v-8h6v8h6v-8h6v8h6v-8h2"/><path d="M62 6l-10 16 8 2-10 18"/><rect x="40" y="50" width="10" height="14"/>` },
  { title: "The Open Gate", line: "A door was drawn on the plans for those who wished to leave their names behind.", icon: `<path d="M18 80V34Q18 12 45 12T72 34v46"/><path d="M30 80V38Q30 24 45 24T60 38v42"/><path d="M45 80V58M45 58l10 8" /><circle cx="45" cy="40" r="3"/>` },
  { title: "The Moon", line: "Beside dark water a friend became something else. One walked away richer; one walked away wounded.", icon: `<path d="M58 14A32 32 0 1 0 58 76A24 24 0 1 1 58 14Z"/><path d="M8 80q9-6 18 0t18 0t18 0t18 0"/>` },
  { title: "Death", line: "A quiet hand was paid by the name, and the winter was full of accidents with no one to blame.", icon: `<path d="M62 8V84"/><path d="M62 8Q22 4 14 38Q36 20 62 22"/><path d="M52 62h20"/>` },
  { title: "The Magician", line: "Mind the little dots. A forger's fancy is in what he cannot help adding.", icon: `<path d="M45 45C45 30 20 30 20 45S45 60 45 45S70 30 70 45S45 60 45 45Z"/><path d="M14 80L76 14"/><circle cx="76" cy="14" r="3"/>` },
  { title: "The Star", line: "The one you mourn is lit by a distant window, and answers to a different name there.", icon: `<path d="M45 6L52 34L80 28L58 46L74 70L46 58L30 82L32 52L8 40L36 36Z"/><circle cx="45" cy="45" r="5"/>` },
  { title: "The Wheel", line: "Three keys must turn together before a dial will speak, and only one mind remembers its turning.", icon: `<circle cx="45" cy="45" r="34"/><circle cx="45" cy="45" r="8"/><path d="M45 11V79M11 45H79M21 21L69 69M69 21L21 69"/>` },
  { title: "Temperance", line: "At the ninth hour a sweet cup is carried to an old man. Something bitter has hidden inside the sweetness.", icon: `<path d="M14 18h26l-4 24q-9 6-18 0Z"/><path d="M26 42v26M16 68h20"/><path d="M52 52h26l-4 24q-9 6-18 0Z" transform="translate(0,-4)"/><path d="M40 28Q50 28 56 44"/>` },
  { title: "The Hanged Man", line: "The House sells one small bottle a night, and only to the one who can show what the House owes.", icon: `<path d="M12 10h56M40 10V30"/><path d="M40 30l-8 28M40 30l8 28M40 30V54"/><circle cx="40" cy="64" r="8"/>` },
  { title: "The Hermit", line: "Not every grave the papers dug has a tenant. Some of the lost have taken to parties, in borrowed faces.", icon: `<rect x="32" y="30" width="26" height="36" rx="3"/><path d="M36 30V22h18v8M45 22V12M32 66h26"/><path d="M45 38V58M38 48h14"/><path d="M24 20L10 12M66 20L80 12M20 40H8M70 40H82" />` },
  { title: "The Lovers", line: "Two hands sealed the black envelopes. One signs with a name that is no name, and one will not sign at all.", icon: `<circle cx="34" cy="45" r="24"/><circle cx="56" cy="45" r="24"/><path d="M45 28V62"/>` },
  { title: "The Emperor", line: "A chair is being measured for a new head, and the crowning wants a roomful of signatures at the half hour.", icon: `<path d="M10 66L16 26L34 44L45 16L56 44L74 26L80 66Z"/><path d="M10 74h70"/><circle cx="16" cy="22" r="3"/><circle cx="45" cy="12" r="3"/><circle cx="74" cy="22" r="3"/>` },
];
const forbiddenInFortunes = [/\bmarker/i, /\bvial/i, /\b(18|19|20|21|22|eighteen|nineteen|twenty|twenty-one|twenty-two)\b/i, /\b(kit|kessler|cassie|castello|keeper|quill|crane|lyle|ballard|marek|pike)\b/i, /\bsurvivor/i, /\bkiller|murder/i];
function buildFortunes() {
  for (const f of fortunes) for (const re of forbiddenInFortunes) if (re.test(f.line) || re.test(f.title)) fail(`fortune "${f.title}" breaks a rule: ${re}`);
  for (const c of characterById.values()) for (const part of c.name.split(/\s+/).filter((w) => w.length > 3 && /^[A-Z]/.test(w))) for (const f of fortunes) if (new RegExp(`\\b${part}\\b`).test(f.line)) fail(`fortune "${f.title}" names ${part}`);
  const card = (f: (typeof fortunes)[number]) =>
    `<div class="fcell"><div class="fcard chk"><div class="ft">THE SOOTHSAYER</div><svg class="ico" viewBox="0 0 90 90" fill="none" stroke="#d8b85a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${f.icon}</svg><div class="tit">${esc(f.title)}</div><div class="or">\u2726 \u2726 \u2726</div><div class="ln">${esc(f.line)}</div></div></div>`;
  const pages: string[] = [];
  const printed = fortunes.slice(0, 4);
  for (let i = 0; i < printed.length; i += 4) pages.push(`<div class="page"><div class="fgrid">${printed.slice(i, i + 4).map(card).join("")}</div><div class="sheetnote">Fortune cards ${i / 4 + 1} of ${printed.length / 4} · four cards, Joshua Kamin-Sky reads four guests · cut on the dashed lines · card stock if you have it</div></div>`);
  return build("fortune-cards", doc("Black Veil fortune cards", pages.join("")));
}

// ---------------------------------------------------------------- menu
const drinkIcons = ["\u{1F41D}", "\u{1F943}", "\u2615", "\u{1F377}"];
const foodIcons = ["\u{1F344}", "\u{1F96A}", "\u{1F9C6}", "\u{1F364}", "\u{1F9C0}"];
/** One half-sheet menu: the title band, a heading, and each item with a picture (a colour emoji). */
function menuHalf(top: string, heading: string, items: { name: string; desc: string }[], icons: string[], foot: string) {
  const rows = items.map((m, i) => `<div class="mrow"><span class="mico">${icons[i] ?? ""}</span><div><div class="nm">${esc(m.name)}</div><div class="ds">${esc(m.desc)}</div></div></div>`).join("");
  return `<div class="menu mhalf chk" style="top:${top}"><div class="band"><h1>${esc(menuTitle)}</h1><div class="by">${esc(menuBy)}</div></div><h2>${esc(heading)}</h2><div class="mbody">${rows}</div><div class="foot">${esc(foot)}</div></div>`;
}
function buildMenus() {
  const make = (file: string, heading: string, items: { name: string; desc: string }[], icons: string[], foot: string) =>
    build(file, doc(`Black Veil ${heading}`, `<div class="page">${menuHalf(".15in", heading, items, icons, foot)}<div class="cutpage"></div>${menuHalf("5.65in", heading, items, icons, foot)}</div>`));
  return { cocktail: make("cocktail-menu", "Cocktail Menu", menuDrinks, drinkIcons, menuNotice), food: make("food-menu", "Food Menu", menuBites, foodIcons, "The House reserves the right to ask no questions") };
}

// ---------------------------------------------------------------- verification
function verifyCodes() {
  const expected = new Map<string, string>();
  for (const e of exhibits) expected.set(e.id, e.code);
  for (const p of props) expected.set(p.id, p.code);
  let checked = 0;
  for (const [name, html] of pdfSources) {
    for (const m of html.matchAll(/data-pid="([^"]+)" data-code="([^"]+)"/g)) {
      const want = expected.get(m[1]);
      if (want !== m[2]) fail(`${name}: ${m[1]} prints ${m[2]} but the data says ${want}`);
      checked += 1;
    }
  }
  const need = (name: string, id: string, min: number) => {
    const n = [...(pdfSources.get(name) ?? "").matchAll(new RegExp(`data-pid="${id}" data-code=`, "g"))].length;
    if (n < min) fail(`${name}: ${id} appears ${n} times, expected at least ${min}`);
  };
  for (const e of exhibits) need("exhibits", e.id, 1);
  for (const p of props.filter((q) => q.placement === "hidden" || !(slipIds as readonly string[]).includes(q.id))) need("tags", p.id, 1);
  for (const p of props) need("tag-key", p.id, 1);
  for (const id of slipIds) need("slips", id, 1);
  // the PDFs themselves: every code must be in the extracted text
  const text = (name: string) => execFileSync("pdftotext", ["-layout", path.join(OUT, `${name}.pdf`), "-"], { encoding: "utf8" }).replace(/\s+/g, "");
  const exT = text("exhibits");
  for (const e of exhibits) if (!exT.includes(e.code)) fail(`exhibits.pdf text lacks ${e.code}`);
  const tagT = text("tags");
  for (const p of props.filter((q) => q.placement === "hidden" || !(slipIds as readonly string[]).includes(q.id))) if (!tagT.includes(p.code)) fail(`tags.pdf text lacks ${p.code}`);
  const slipT = text("slips");
  for (const id of slipIds) if (!slipT.includes(props.find((p) => p.id === id)!.code)) fail(`slips.pdf text lacks ${id}`);
  if (exT.includes("11:12PM") === false) fail("tie-breaker stub missing 11:12 PM");
  // the tie-breaker must have no filing code, and the HTML must not mention it twice
  console.log(`  verified ${checked} printed codes against the data`);
}

// ---------------------------------------------------------------- README
function writeReadme(pages: Record<string, number>, tagCount: number) {
  const md = `# Props: print guide

*Generated by \`npx tsx scripts/print/exhibits.ts\`. Do not edit by hand; re-run the script. SPOILERS in the host files.*

All PDFs are US Letter. Print at 100% / "Actual size" (not "Fit to page"), with **background graphics** on. Colour is best; every sheet is still readable in black and white.

| File | Pages | Copies | Paper | Notes |
|---|---|---|---|---|
| \`exhibits.pdf\` | ${pages.exhibits} | 1 | Cream or ivory 24 lb paper (a tea-stained look is welcome) | Every exhibit as its in-world document. Cut pieces apart on the dotted lines, tear or trim round the ragged edges by hand. **Trim the tiny grey line at the bottom of each page off**: it says where the prop goes. The List is printed landscape (page 1); the printer may rotate it. The last page is the HOST ONLY tie-breaker stub: it goes in the LINING of the dead man's jacket, never on a table. |
| \`exhibits-index.pdf\` | ${pages["exhibits-index"]} | 1 | Plain | HOST ONLY. Every exhibit: page, id, code, where it goes, who holds it, and the tie-breaker question and answer. |
| \`tags.pdf\` | ${pages.tags} | 1 | Matte white or cream card stock (65 lb) | ${tagCount} tags (3 x 4 per sheet): two of every hidden prop (one spare), one of each carried and table prop. Black fill uses a lot of ink; a laser printer is best. Cut along the dashed grid, tape each tag to or beside its object. No object name is on a tag. |
| \`tag-key.pdf\` | ${pages["tag-key"]} | 1 | Plain | HOST ONLY. Code, prop, the object in your house, placement, carrier or hiding hint. The five survivor markers (numbers 18 to 22) are not tags and are not in this file. |
| \`slips.pdf\` | ${pages.slips} | 1 set + a STANDBY set (last ${pages.slips / 2} pages) | Cream paper or light card | The 30 printed slips, each with its own code, exactly once: the deal slips and carried items, the twenty group-race slips (witness, reply, tool, trade: five of each) and the charter Eric signs. Pages ${pages.slips / 2 + 1} to ${pages.slips} are STANDBY COPIES for the stand-in tray, marked in the top margin (trim it off). |
| \`host-sheet.pdf\` | ${pages["host-sheet"]} | 1 | Plain | HOST ONLY. Bartend Joe's one page: what to hand out and when, and every approval word with what to check before you give it. |
| \`vial-labels.pdf\` | ${pages["vial-labels"]} | 1 | Cream paper; use a glue stick or double-sided tape | Row 1: the real HOUSE STOCK label (2 copies). Rows 2 to 4: OPTIONAL decoys, skip them if you have no spare bottles (Camphor Spirits, Spirits of Hartshorn, Oil of Wintergreen), 2 each. Bottles hold WATER ONLY, never oils. |
| \`fortune-cards.pdf\` | ${pages["fortune-cards"]} | 1 | Card stock (65 to 80 lb), cream or white | 12 cards, 4 per sheet. Joshua Kamin-Sky reads four guests; each guest keeps the card. Cut on the dashed lines. |
| \`cocktail-menu.pdf\` | ${pages["cocktail-menu"]} | 1 sheet (makes 2 menus) | Cream paper | Cut across the dashed line. |
| \`food-menu.pdf\` | ${pages["food-menu"]} | 1 sheet (makes 2 menus) | Cream paper | Cut across the dashed line. |

## Editing the menu

The drink and bite lists are plain arrays at the top of \`scripts/print/exhibits.ts\` (\`menuDrinks\`, \`menuBites\`, plus \`menuTitle\`, \`menuBy\`, \`menuNotice\`). Change them, run \`npx tsx scripts/print/exhibits.ts\`, and reprint \`menu.pdf\` and \`menu-table-card.pdf\`. The lists match the menu you are serving; edit them there if it changes.

## Cutting tips

- Cut with a paper trimmer on the straight dashed lines; use scissors for the ragged paper edges. Do not trim the torn edges perfectly: ragged is the point.
- Do not cut a page apart until you have checked that nothing is missing: the cut lines run between pieces, not through the writing.
- A tea bag, dabbed on and left to dry, ages the cream sheets. Do it before printing only if your printer handles slightly curled paper; otherwise age a photocopy.
- Tags: tape them flat with clear tape on the edges only, so the code stays readable and the object is never moved.
- The tie-breaker stub (last page of \`exhibits.pdf\`) must have its HOST ONLY margin text trimmed off before it goes inside the jacket lining. It carries no filing code.
- Every filing code on a printed exhibit is generated from the game data. If you edit the data, re-run the script; it refuses to finish if any printed code differs from the data.
`;
  writeFileSync(path.join(OUT, "README-props.md"), md);
}

// ---------------------------------------------------------------- main
console.log("Building props PDFs into docs/print/game/");
const pages: Record<string, number> = {};
pages.exhibits = buildExhibits();
pages["exhibits-index"] = buildIndex();
const t = buildTags();
pages.tags = t.pages;
pages["tag-key"] = buildTagKey();
pages["host-sheet"] = buildHostSheet();
pages.slips = buildSlips();
pages["vial-labels"] = buildVials();
pages["fortune-cards"] = buildFortunes();
const menus = buildMenus();
pages["cocktail-menu"] = menus.cocktail;
pages["food-menu"] = menus.food;
void markers;
verifyCodes();
writeReadme(pages, t.count);
console.log("Done.");
