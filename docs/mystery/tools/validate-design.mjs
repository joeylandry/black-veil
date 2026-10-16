// Design validator for the proposed Black Veil mystery (docs only, no app imports).
//   node docs/mystery/tools/validate-design.mjs
// 1) Relationship network: degree, cross-circle ties, thread variety, cut-vertices, absence robustness.
// 2) Scoring: one-winner determinism and a *illustrative* culprit-fairness calibration.
import { createHash } from "node:crypto";

// --- 1. NETWORK -------------------------------------------------------------------------------
// Circles are the existing factions from src/lib/demo/cast.ts (kept as-is).
const circle = {
  adam: "River", andrew: "River", angelos: "River", diwakar: "River", emmanuel: "River", erika: "River",
  kyle: "River", luke: "River", mihir: "River", molly: "River", shadi: "River", timothy: "River",
  aidan: "Elm", anika: "Elm+Mill", jackh: "Elm", rhea: "Elm", robert: "Elm", siddarth: "Elm", tiffany: "Elm", emre: "Elm",
  aimee: "Orchestra", jackm: "Orchestra", silas: "Orchestra", victor: "Orchestra",
  ananya: "Press", leon: "Press", theodor: "Press",
  anthony: "Law", eric: "Law", krrish: "House", rebecca: "House",
  ivan: "Mill", arjun: "MillWork", joshua: "MillWork",
};
// Threads: $ money/debt, B bootleg/bottle, W wire/info, L law/corruption, H heart/forbidden, X blackmail, 24 = 1924 witness
const E = `
anika-molly|B|still in the Mahns cellar, Anika takes a cut
anika-shadi|$|crested spoon Shadi wants to sell back
anika-eric|L|one of the Four; Mill money to the Bench
anika-theodor|W|one of the Four; press kept quiet
anika-mihir|$|one of the Four; Mihir holds Mahns markers
anika-robert|H|courtship; dawn-ride alibi
anika-ivan|$|Mahns holds Ivan's factory note
anika-rhea|$|unpaid emporium account
anika-jackh|$|Packard purchases
anika-aidan|$|owes the doctor
anika-ananya|W|bribed for a copy of a wire
eric-theodor|L|one of the Four
eric-mihir|L|one of the Four; fixes
eric-timothy|L|Timothy's books are due at court
eric-anthony|L|dismissals paid through counsel
eric-erika|L|Erika evades the Judge
eric-aidan|X|unfiled 1924 death certificate
eric-emre|L|Sheriff needs the Judge's countersign
eric-adam|L|gun registry
eric-ananya|W|Ananya reads the Judge's private wires
theodor-ananya|W|unsigned wires paid in coin
theodor-leon|W|press v. radio; coded message
theodor-mihir|X|gambling debt held over the editor
theodor-joshua|W|wants the half-burned ledger pages
theodor-jackm|24|the timeline he wants kept quiet
mihir-diwakar|$|fight book
mihir-robert|X|fixed 1923 game
mihir-arjun|$|1925 championship bribe
mihir-luke|$|shell game settles debts
mihir-angelos|$|rival bets
mihir-timothy|$|gambling debt
kyle-molly|B|ferries her crates
kyle-aimee|24|lantern signal at 11:46
kyle-siddarth|24|river and air escape
kyle-andrew|B|liquor shipments
kyle-timothy|B|gin
kyle-luke|$|payment drop
kyle-krrish|B|club bar supply
kyle-rebecca|24|cellar door to the river
kyle-adam|B|guns on the boats
molly-krrish|B|wants her whiskey on the bar
molly-andrew|B|sold him a case
molly-timothy|B|rival still
molly-aidan|B|medicinal prescriptions
krrish-rebecca|F|House Staff
krrish-timothy|B|waters his gin
krrish-jackm|24|staff and orchestra
krrish-andrew|B|poaching the bartender
rebecca-aimee|24|kitchen and the staged blood
rebecca-tiffany|24|rose window over the kitchen
rebecca-rhea|$|kitchen account
rebecca-jackm|F|supper and band
andrew-timothy|$|gin debt
andrew-angelos|$|coffee-house deed
andrew-luke|$|back-room games
angelos-luke|$|hustle partners
angelos-diwakar|$|fight bets
angelos-emmanuel|$|rival hustlers
angelos-robert|$|boules wager
emmanuel-anika|H|courting an heiress
emmanuel-ivan|$|sold him stock
emmanuel-luke|$|shell partner
emmanuel-shadi|$|fence
emmanuel-rhea|$|account fraud
emmanuel-jackh|$|car con
adam-aimee|24|rifle and revolvers
adam-erika|L|sold her a pistol
adam-shadi|$|resold guns
aidan-rhea|$|poison and prescriptions
aidan-emre|24|time of death and the clock
aidan-silas|W|police gossip
aidan-ivan|$|patients in debt
aimee-jackm|F|orchestra
aimee-victor|F|orchestra
aimee-arjun|$|marksman v. slugger bet
anthony-emre|L|counsel and Sheriff
anthony-erika|L|defended her
anthony-timothy|L|counsel for the books
anthony-mihir|$|paid defenses
anthony-joshua|L|trespass cases
anthony-leon|W|libel threat
arjun-diwakar|$|sporting circle
arjun-robert|$|sporting circle
arjun-joshua|F|mill workers
arjun-ivan|F|mill families and workers
diwakar-robert|$|sporting circle
diwakar-silas|W|predicted fight
emre-joshua|L|deputy
emre-tiffany|W|clock tower and window
emre-rhea|W|shop clocks
emre-leon|W|time signal
erika-shadi|$|satchel buyer
erika-siddarth|24|flew her out
erika-joshua|W|soot and roofs
erika-kyle|24|river getaway
ivan-kyle|B|gum wrappers carry River messages
ivan-luke|B|gum wrappers carry River messages
ivan-leon|W|radio sponsor
ivan-robert|$|gum endorsement
jackh-emre|W|motorcar sales book
jackh-siddarth|F|cars v. planes
jackh-rhea|$|accounts
jackh-tiffany|$|lamp commission
jackh-kyle|B|rum cars
jackm-ananya|W|orchestra parcel
jackm-victor|F|orchestra
jackm-silas|F|orchestra
joshua-tiffany|W|roof and window
joshua-shadi|$|sells ledger pages
leon-ananya|W|wire to radio
leon-silas|W|spiritualist hour
leon-victor|W|gramophone on air
luke-diwakar|$|payment drop
molly-rebecca|B|kitchen spirits
rhea-tiffany|$|lamp stock
rhea-victor|$|gramophone stock
robert-ivan|$|sponsor
shadi-tiffany|$|stained glass fence
shadi-victor|$|gramophone fence
shadi-timothy|X|stolen crate
siddarth-ananya|W|wires and flights
siddarth-leon|W|weather radio
silas-victor|F|orchestra
silas-emre|W|police gossip
silas-aimee|F|orchestra
tiffany-victor|F|window and band
tiffany-jackh|$|commission
adam-anika|$|pearl-handled pistol resold to the Mahns family
adam-emre|L|gun permits
andrew-anthony|L|defended after the coffee-house raid
andrew-emre|L|raid on the back room
andrew-rhea|$|coffee-urn account
angelos-arjun|$|bets on the Textiles club
angelos-silas|W|odds read from a palm
angelos-krrish|B|bar tab settled in bootleg
angelos-leon|W|bowls scores on the radio
luke-ananya|W|coded payment wires
luke-robert|$|fairground wager
luke-victor|$|fair gramophone
jackh-erika|24|sold the 1924 getaway car; she rode in it
jackh-mihir|$|car financing
molly-eric|L|pays the court to look away
molly-mihir|$|book on her still
ananya-mihir|$|coded betting wires
ananya-kyle|B|river shipment wires
ananya-emre|L|police wires
leon-mihir|$|race results on air
leon-eric|L|bench interviews on air
timothy-krrish|B|bar
`.trim().split("\n").map((line) => line.split("|")).map(([pair, type, note]) => ({ a: pair.split("-")[0], b: pair.split("-")[1], type, note }));

const ids = Object.keys(circle);
const adj = new Map(ids.map((id) => [id, new Set()]));
const typesOf = new Map(ids.map((id) => [id, new Set()]));
const unknown = [];
for (const { a, b, type } of E) {
  if (!adj.has(a) || !adj.has(b)) { unknown.push(`${a}-${b}`); continue; }
  adj.get(a).add(b); adj.get(b).add(a); typesOf.get(a).add(type); typesOf.get(b).add(type);
}

function reachable(removed) {
  const alive = ids.filter((id) => !removed.has(id));
  if (!alive.length) return { alive, largest: 0 };
  const seen = new Set(); let largest = 0;
  for (const start of alive) {
    if (seen.has(start)) continue;
    const stack = [start]; seen.add(start); let n = 0;
    while (stack.length) { const x = stack.pop(); n++; for (const y of adj.get(x)) if (!removed.has(y) && !seen.has(y)) { seen.add(y); stack.push(y); } }
    largest = Math.max(largest, n);
  }
  return { alive, largest };
}

console.log("== NETWORK ==");
console.log(`nodes ${ids.length}  edges ${E.length}  unknown-ids ${unknown.length ? unknown.join(",") : "none"}`);
const deg = ids.map((id) => [id, adj.get(id).size]).sort((a, b) => a[1] - b[1]);
console.log(`degree min ${deg[0][1]} (${deg[0][0]})  median ${deg[Math.floor(deg.length / 2)][1]}  max ${deg.at(-1)[1]} (${deg.at(-1)[0]})`);
const lowDeg = deg.filter(([, d]) => d < 5).map(([id, d]) => `${id}:${d}`);
console.log(`characters with fewer than 5 ties: ${lowDeg.join(", ") || "none"}`);
const cross = ids.map((id) => [id, [...adj.get(id)].filter((o) => circle[o].split("+")[0] !== circle[id].split("+")[0]).length]);
console.log(`characters with fewer than 3 cross-circle ties: ${cross.filter(([, c]) => c < 3).map(([id, c]) => `${id}:${c}`).join(", ") || "none"}`);
const thin = ids.filter((id) => typesOf.get(id).size < 2);
console.log(`characters touching fewer than 2 relationship threads: ${thin.join(", ") || "none"}`);
const base = reachable(new Set());
console.log(`connected: ${base.largest === ids.length}`);
const cuts = ids.filter((id) => reachable(new Set([id])).largest < ids.length - 1);
console.log(`cut-vertices (one absence splits the web): ${cuts.join(", ") || "none"}`);

let seed = 20261023; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
function absenceTrial(missing) {
  let worst = 1, isolated = 0;
  for (let t = 0; t < 4000; t++) {
    const pool = [...ids]; const gone = new Set();
    while (gone.size < missing) gone.add(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    const { alive, largest } = reachable(gone);
    worst = Math.min(worst, largest / alive.length);
    if (alive.some((id) => [...adj.get(id)].every((o) => gone.has(o)))) isolated++;
  }
  return { worst, isolated };
}
for (const m of [5, 8]) {
  const r = absenceTrial(m);
  console.log(`absences ${m} of ${ids.length} (4000 random draws): worst connected share ${(r.worst * 100).toFixed(0)}%, draws that fully isolate someone ${r.isolated}`);
}
// Per-character: typical live ties left when 8 are absent
{
  let min = 99; for (let t = 0; t < 4000; t++) { const gone = new Set(); while (gone.size < 8) gone.add(ids[Math.floor(rnd() * ids.length)]); for (const id of ids) if (!gone.has(id)) min = Math.min(min, [...adj.get(id)].filter((o) => !gone.has(o)).length); }
  console.log(`fewest live ties any present character is left with when 8 are absent: ${min}`);
}

// --- 2. SCORING -------------------------------------------------------------------------------
console.log("\n== SCORING ==");
// Deterministic tie-break chain, last link is a hash of a sealed seed so it can never tie.
function rank(rows, seedText) {
  const h = (id) => createHash("sha256").update(id + seedText).digest("hex");
  return [...rows].sort((x, y) =>
    y.total - x.total || y.reckoning - x.reckoning || y.objectives - x.objectives || y.web - x.web || x.penalties - y.penalties || h(x.id).localeCompare(h(y.id)));
}
let ties = 0;
for (let g = 0; g < 20000; g++) {
  const rows = Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, total: 100 + Math.floor(rnd() * 6) * 5, reckoning: Math.floor(rnd() * 3) * 10, objectives: Math.floor(rnd() * 3) * 10, web: Math.floor(rnd() * 3) * 3, penalties: Math.floor(rnd() * 2) * 5 }));
  const top = rank(rows, "seed" + g);
  if (top[0].total === top[1]?.total && top[0].reckoning === top[1].reckoning && top[0].objectives === top[1].objectives && top[0].web === top[1].web && top[0].penalties === top[1].penalties) ties++;
  if (rank(rows, "seed" + g)[0].id !== top[0].id) throw new Error("non-deterministic");
}
console.log(`20000 games with heavy artificial ties: exactly one winner each time = true; games that needed the hash link ${ties}`);

// Illustrative calibration. Assumptions, not data. Three dossier shapes, built so that "par" is similar.
// Reckoning is capped at 30 (culprit 12, other five questions 18) so that solving cannot swamp everything else.
const RECKONING = { culprit: Number(process.env.RC ?? 12), other: Number(process.env.RO ?? 18) }; // victim 2, method 4, motive 4, 1924 truth 4, the Four 4 (1 each)
const shapes = {
  operator:  { obj: Number(process.env.OP ?? 65), web: 24, case: 6,  recSolve: 0.5 },
  detective: { obj: 36, web: 15, case: 14, recSolve: 1.0 },
  hybrid:    { obj: 48, web: 18, case: 10, recSolve: 0.75 },
};
function game({ players = 30, solveBase, escape, decay, sheriffAccuracy }) {
  const names = Object.keys(shapes);
  const rows = [];
  for (let i = 0; i < players; i++) {
    const s = i === 0 ? shapes.hybrid : shapes[names[Math.floor(rnd() * 3)]];
    const e = 0.45 + 0.55 * rnd(); // engagement
    const done = (cap, p) => cap * Math.min(1, Math.max(0, p * e + (rnd() - 0.5) * 0.25));
    const arrival = rnd() < 0.9 ? 10 : 0;
    const solvedCulprit = i !== 0 && rnd() < solveBase * s.recSolve * (0.5 + e);
    const reck = i === 0 ? 0 : (solvedCulprit ? RECKONING.culprit : 0) + RECKONING.other * (solvedCulprit ? 0.6 : 0.25) * Math.min(1, rnd() * 1.4);
    rows.push({ id: `p${i}`, culprit: i === 0, solved: solvedCulprit, base: arrival + done(s.obj, 1.0) + done(s.web, 0.95) + done(s.case, 1.0), reck });
  }
  const K = rows.filter((r) => r.solved).length;
  const caught = rnd() < sheriffAccuracy(K);
  for (const r of rows) {
    r.total = r.base + r.reck;
    if (r.culprit) { r.total += caught ? 0 : Math.max(0, escape - decay * K); r.out = caught; }
  }
  const eligible = rows.filter((r) => !r.out).sort((a, b) => b.total - a.total);
  const w = eligible[0];
  return { culpritWon: w.culprit, winnerSolved: w.solved, K };
}
console.log("culprit win share / winners who never named the culprit / mean correct accusers  (30 players, 3000 games each)");
for (const solveBase of [0.12, 0.25, 0.4]) {
  for (const [escape, decay] of [[35, 2], [40, 2], [45, 2]]) {
    let cw = 0, nonSolve = 0, k = 0, n = 3000;
    for (let g = 0; g < n; g++) {
      const r = game({ solveBase, escape, decay, sheriffAccuracy: (K) => Math.min(0.85, 0.1 + 0.03 * K) });
      cw += r.culpritWon; nonSolve += !r.winnerSolved && !r.culpritWon; k += r.K;
    }
    console.log(`solve~${solveBase.toFixed(2)}  escape ${escape} -${decay}/accuser: culprit wins ${(100 * cw / n).toFixed(0)}%  non-solver wins ${(100 * nonSolve / n).toFixed(0)}%  avg accusers ${(k / n).toFixed(1)}`);
  }
}
