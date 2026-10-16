// Design validator for the proposed Black Veil mystery (docs only, no app imports).
//   node docs/mystery/tools/validate-design.mjs
// 1) Relationship network of the 20 confirmed guests: degree, cross-circle ties, thread variety,
//    cut-vertices, absence robustness.
// 2) Scoring: one-winner determinism and an *illustrative* culprit-fairness calibration.
import { createHash } from "node:crypto";

// --- 1. NETWORK -------------------------------------------------------------------------------
// The 20 confirmed attendees (Oct 16 guest list) plus Silas (the scat singer) Rhea and Emre (confirmed Oct 16). Circles: River Trade, Elm Street, Wire (press/telegraph),
// Law, West Side (the boarding house), Mill (mill families and workers).
const circle = {
  adam: "River", molly: "River", luke: "River", angelos: "River", diwakar: "River", erika: "River", mihir: "River",
  emre: "Elm", rhea: "Elm", anika: "Elm", jackh: "Elm", tiffany: "Elm", sidd: "Elm", joel: "Elm",
  ananya: "Wire", leon: "Wire",
  eric: "Law", anthony: "Law", theodor: "Law",
  rebecca: "WestSide",
  silas: "Orchestra",
  josh: "Mill", arjun: "Mill",
};
// Threads: $ money/debt, B bottle/bootleg, W wire/information, L law/corruption, H heart/forbidden, 24 = 1924 witness
const E = `
anika-molly|B|still in the Mahns cellar, rent owed
anika-jackh|$|crested spoon traded in for a motorcar
anika-eric|L|on the 1924 landing; Mill money to the Bench
anika-mihir|$|on the 1924 landing
anika-anthony|L|on the 1924 landing
anika-joel|H|the rich match she needs; he holds her mortgage
anika-rebecca|$|bought a tip about who was staying at the boarding house
anika-tiffany|$|commissions
anika-ananya|W|bribed for a copy of a wire
eric-mihir|L|on the 1924 landing; fixes
eric-anthony|L|on the 1924 landing; counsel before his bench
eric-theodor|L|countersigns the Sheriff's warrant
eric-erika|L|Erika evades the Judge
eric-molly|L|pays the court to look away
eric-leon|L|bench interviews on air
eric-adam|L|gun registry
mihir-anthony|$|on the 1924 landing; retainers
mihir-joel|$|business rivals
mihir-diwakar|$|fight book
mihir-arjun|$|1925 championship bribe
mihir-angelos|$|bets
mihir-leon|$|race results on air
mihir-ananya|$|coded betting wires
mihir-luke|$|shell-game payoffs
anthony-luke|F|half-brothers
anthony-theodor|L|counsel and Sheriff
anthony-erika|L|defended her
anthony-leon|W|libel threat
anthony-josh|L|trespass cases
luke-molly|$|fair money
luke-angelos|$|hustle partners
luke-ananya|W|coded payment wires
luke-diwakar|$|payment drop
luke-adam|B|blank cartridges
luke-jackh|$|carnival trailers and motorcars
molly-rebecca|W|papers to the boarding house
molly-leon|W|newsie and radio
molly-theodor|W|the Sheriff buys the paper
molly-angelos|$|bets
rebecca-erika|24|hid her at the boarding house
rebecca-josh|W|West Side neighbors
rebecca-sidd|24|knew who flew out
rebecca-leon|W|Cassie's coded message
rebecca-theodor|L|the Sheriff eyes her boarding house
rebecca-diwakar|24|a boarder
erika-adam|L|sold her a pistol
erika-jackh|24|the 1924 getaway car
erika-diwakar|24|the back door she left by
erika-theodor|L|wanted
erika-sidd|24|flew her out
josh-arjun|F|mill workers
josh-tiffany|W|roofs and windows
josh-theodor|L|reports what the flue held
josh-ananya|W|Yiddish telegrams
josh-adam|$|chimneys at the shop
adam-anika|$|resold the pearl-handled pistol
adam-theodor|L|permits
adam-diwakar|$|gun for the fighter
angelos-diwakar|$|fight bets
angelos-jackh|$|car wager
angelos-tiffany|$|lamp wager
angelos-arjun|$|bets
angelos-leon|W|boules scores on the radio
diwakar-arjun|$|sporting circle
diwakar-joel|$|fight purse sponsor
arjun-joel|$|team sponsor
arjun-leon|W|sports on air
jackh-joel|$|cars and oil
jackh-sidd|F|cars v. planes
jackh-theodor|W|sales book
jackh-tiffany|$|lamp commission
jackh-mihir|$|financing
sidd-joel|$|aviation fuel
sidd-ananya|W|flight wires
sidd-leon|W|weather on air
tiffany-theodor|W|the Sheriff's office windows
tiffany-leon|$|broker for Leon's pardon
tiffany-joel|$|commission
tiffany-ananya|W|telegram lamp
silas-leon|W|his scat riff is Cassie's coded message
silas-diwakar|24|the band and the door
silas-rebecca|24|musicians board at her house
silas-luke|$|carnival gigs
silas-mihir|$|club bookings
silas-angelos|$|bets on the band
silas-ananya|W|gig telegrams
silas-anika|$|played the Mahns Manor parties
rhea-anika|$|unpaid account; sold her the monogrammed flask pair
rhea-eric|L|sold the twin flask Anika gave him
rhea-tiffany|$|lamp stock
rhea-jackh|$|store accounts
rhea-joel|$|a new account (and an offer for the store)
rhea-rebecca|$|linens for the boarding house
rhea-molly|$|buys advertising in the paper
rhea-leon|W|store ads on air
rhea-silas|$|dresses the band
rhea-theodor|L|the Sheriff's uniform
emre-theodor|L|keeps the Sheriff's watch and the town clock
emre-rhea|$|store clocks
emre-jackh|W|clocks in the motorcars
emre-tiffany|W|the clock-tower window
emre-leon|W|the time signal on air
emre-silas|W|the band's timing
emre-anika|$|the Mahns Manor grandfather clock
emre-eric|L|the courthouse clock
emre-rebecca|$|boarding-house clocks
ananya-leon|W|wire to radio
ananya-theodor|W|police wires
ananya-eric|W|the Judge's private wires
leon-theodor|L|the feud over the radio
leon-joel|W|sponsor on air
joel-anika|$|the mortgage
theodor-joel|L|permits for the oil depot
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
console.log(`characters with fewer than 5 ties: ${deg.filter(([, d]) => d < 5).map(([id, d]) => `${id}:${d}`).join(", ") || "none"}`);
const cross = ids.map((id) => [id, [...adj.get(id)].filter((o) => circle[o] !== circle[id]).length]);
console.log(`characters with fewer than 3 cross-circle ties: ${cross.filter(([, c]) => c < 3).map(([id, c]) => `${id}:${c}`).join(", ") || "none"}`);
console.log(`characters touching fewer than 2 relationship threads: ${ids.filter((id) => typesOf.get(id).size < 2).join(", ") || "none"}`);
console.log(`connected: ${reachable(new Set()).largest === ids.length}`);
console.log(`cut-vertices (one absence splits the web): ${ids.filter((id) => reachable(new Set([id])).largest < ids.length - 1).join(", ") || "none"}`);

let seed = 20261023; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
for (const m of [3, 5]) {
  let worst = 1, isolated = 0, minLive = 99;
  for (let t = 0; t < 4000; t++) {
    const gone = new Set(); while (gone.size < m) gone.add(ids[Math.floor(rnd() * ids.length)]);
    const { alive, largest } = reachable(gone);
    worst = Math.min(worst, largest / alive.length);
    for (const id of alive) { const live = [...adj.get(id)].filter((o) => !gone.has(o)).length; minLive = Math.min(minLive, live); if (!live) isolated++; }
  }
  console.log(`absences ${m} of ${ids.length} (4000 random draws): worst connected share ${(worst * 100).toFixed(0)}%, isolated-person events ${isolated}, fewest live ties left to anyone ${minLive}`);
}

// --- 2. SCORING -------------------------------------------------------------------------------
console.log("\n== SCORING ==");
// Deterministic tie-break chain, last link is a hash of a sealed seed so it can never tie.
function rank(rows, seedText) {
  const h = (id) => createHash("sha256").update(id + seedText).digest("hex");
  return [...rows].sort((x, y) =>
    y.total - x.total || x.guessErr - y.guessErr || y.reckoning - x.reckoning || y.objectives - x.objectives || y.web - x.web || x.penalties - y.penalties || h(x.id).localeCompare(h(y.id)));
}
let ties = 0;
for (let g = 0; g < 20000; g++) {
  const rows = Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, total: 100 + Math.floor(rnd() * 6) * 5, reckoning: Math.floor(rnd() * 3) * 10, objectives: Math.floor(rnd() * 3) * 10, web: Math.floor(rnd() * 3) * 3, penalties: Math.floor(rnd() * 2) * 5, guessErr: Math.floor(rnd() * 12) }));
  const top = rank(rows, "seed" + g);
  if (top[0].total === top[1]?.total && top[0].guessErr === top[1].guessErr && top[0].reckoning === top[1].reckoning && top[0].objectives === top[1].objectives && top[0].web === top[1].web && top[0].penalties === top[1].penalties) ties++;
  if (rank(rows, "seed" + g)[0].id !== top[0].id) throw new Error("non-deterministic");
}
console.log(`20000 games with heavy artificial ties: exactly one winner each time = true; games that needed the hash link ${ties}`);

// Illustrative calibration. Assumptions, not data. Three dossier shapes, built so that "par" is similar.
// Reckoning is capped at 30 (culprit 14, the other four questions 16) so that solving cannot swamp everything else.
const RECKONING = { culprit: Number(process.env.RC ?? 14), other: Number(process.env.RO ?? 16) }; // victim 2, method 4, motive 5, 1924 truth 5
const shapes = {
  operator:  { obj: Number(process.env.OP ?? 65), web: 18, case: 4, hunt: 8,  recSolve: 0.5 },
  detective: { obj: 36, web: 12, case: 8, hunt: 14, recSolve: 1.0 },
  hybrid:    { obj: 48, web: 14, case: 6, hunt: 11, recSolve: 0.75 },
};
function game({ players = 23, solveBase, escape, decay, sheriffAccuracy }) {
  const names = Object.keys(shapes);
  const rows = [];
  for (let i = 0; i < players; i++) {
    const s = i === 0 ? shapes.hybrid : shapes[names[Math.floor(rnd() * 3)]];
    const e = 0.45 + 0.55 * rnd(); // engagement
    const done = (cap, p) => cap * Math.min(1, Math.max(0, p * e + (rnd() - 0.5) * 0.25));
    const arrival = rnd() < 0.9 ? 10 : 0;
    const solvedCulprit = i !== 0 && rnd() < solveBase * s.recSolve * (0.5 + e);
    const reck = i === 0 ? 0 : (solvedCulprit ? RECKONING.culprit : 0) + RECKONING.other * (solvedCulprit ? 0.6 : 0.25) * Math.min(1, rnd() * 1.4);
    rows.push({ id: `p${i}`, culprit: i === 0, solved: solvedCulprit, base: arrival + done(s.obj, 1.0) + done(s.web, 0.95) + done(s.case, 1.0) + done(s.hunt, 0.9), reck });
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
console.log("culprit win share / winners who never named the culprit / mean correct accusers  (23 players, 3000 games each)");
for (const solveBase of [0.12, 0.25, 0.4]) {
  for (const [escape, decay] of [[28, 2], [32, 2], [36, 2]]) {
    let cw = 0, nonSolve = 0, k = 0, n = 3000;
    for (let g = 0; g < n; g++) {
      const r = game({ solveBase, escape, decay, sheriffAccuracy: (K) => Math.min(0.85, 0.1 + 0.03 * K) });
      cw += r.culpritWon; nonSolve += !r.winnerSolved && !r.culpritWon; k += r.K;
    }
    console.log(`solve~${solveBase.toFixed(2)}  escape ${escape} -${decay}/accuser: culprit wins ${(100 * cw / n).toFixed(0)}%  non-solver wins ${(100 * nonSolve / n).toFixed(0)}%  avg accusers ${(k / n).toFixed(1)}`);
  }
}
