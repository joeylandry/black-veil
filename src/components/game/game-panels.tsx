"use client";

import { FormEvent, useState } from "react";
import type { Card, DirectoryEntry, Errand, FinalQuestion, Line, Results, SavedAnswer } from "./game-types";
import { SubmitBox } from "./submit-box";

const shareLabel: Record<Line["share"], string> = { free: "Say it freely", trade: "Trade it", paid: "Costs $100 at the bar", secret: "Keep it close" };
const shareHelp: Record<Line["share"] | "entrusted", string> = {
  free: "Anyone may be told.",
  trade: "Tell it only if they tell you a clue in return.",
  paid: "Tell it only after they drop a $100 bill in the House Tin at the bar.",
  secret: "Do not tell unless you choose to.",
  entrusted: "Another guest's small secret that you hold for them.",
};

export function Lines({ lines }: { lines: Line[] }) {
  if (!lines.length) return null;
  const entrusted = lines.filter((line) => /^About /.test(line.text));
  const groups = (["free", "trade", "paid", "secret"] as const)
    .map((share) => ({ key: share, chip: share, label: shareLabel[share], help: shareHelp[share], lines: lines.filter((line) => line.share === share && !/^About /.test(line.text)) }))
    .concat([{ key: "entrusted" as never, chip: "secret", label: "Entrusted secret", help: shareHelp.entrusted, lines: entrusted }]);
  return (
    <div className="game-clues">
      {groups.filter((group) => group.lines.length).map((group) => (
        <div className="game-clue-group" key={group.key}>
          <p className="game-clue-head"><span className={`game-chip game-chip-${group.chip}`}>{group.label}</span> <small>{group.help}</small></p>
          <ul className="game-lines">
            {group.lines.map((line) => <li key={line.text}>{line.text}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The claim flow for something the host confirms in person: claim it on the screen, then type the host's approval word. */
function ClaimBox({ errand, saved, open, onSaved }: { errand: Errand; saved?: SavedAnswer; open: boolean; onSaved: (entry: SavedAnswer) => void }) {
  const [claiming, setClaiming] = useState(Boolean(saved));
  if (!claiming) {
    return (
      <div className="game-submit">
        <button type="button" disabled={!open} onClick={() => setClaiming(true)}>Claim this point</button>
        <small>Do it for real first. Then go to Bartend Joe at the bar for the approval word.</small>
      </div>
    );
  }
  return <SubmitBox kind="objective" itemId={errand.id} label="The approval word Bartend Joe gave you" initial={saved} disabled={!open} onSaved={onSaved} />;
}

function ErrandCard({ errand, index, saved, open, onSaved }: { errand: Errand; index: number; saved?: SavedAnswer; open: boolean; onSaved: (entry: SavedAnswer) => void }) {
  const decidedElsewhere = errand.house;
  return (
    <li className={`game-errand${saved ? " done" : ""}`} id={`errand-${errand.id}`}>
      <header>
        <span className="game-errand-no">{saved ? "\u2713" : index + 1}</span>
        <div>
          <h4>{errand.title}</h4>
          <small><span className="game-pill">{errandLabel(errand.kind)}</span> {errand.points} point{saved ? " · answer saved" : ""}</small>
        </div>
      </header>
      <p>{errand.text}</p>
      {errand.withNames.length > 0 && <p className="game-with"><span>Seek out</span> {errand.withNames.join(" · ")}</p>}
      {errand.automatic ? (
        <p className="game-note">Nothing to type. This one is scored for you from what the others learn.</p>
      ) : errand.approval ? (
        <ClaimBox errand={errand} saved={saved} open={open} onSaved={onSaved} />
      ) : (
        <SubmitBox
          kind="objective"
          itemId={errand.id}
          label={decidedElsewhere ? `${errand.ask} (optional: the House and the night decide this one)` : errand.ask}
          initial={saved}
          disabled={!open}
          withProof={!decidedElsewhere && errand.kind !== "find" && errand.kind !== "swap"}
          onSaved={onSaved}
        />
      )}
    </li>
  );
}

const errandLabel = (kind: string) =>
  ({ find: "a thing to find", learn: "a secret to learn", swap: "a trade to make", money: "money to make", story: "a clue to chase", chain: "the House", motive: "your own story", role: "your office", keep: "a secret to spend", approval: "Bartend Joe will confirm" })[kind] ?? kind;

/** A small box that sends one code (and, optionally, a chosen guest) to a House endpoint and shows the reply, whatever it is. */
function CodeBox({ endpoint, label, button, placeholder, guests }: { endpoint: string; label: string; button: string; placeholder: string; guests?: DirectoryEntry[] }) {
  const [code, setCode] = useState("");
  const [buyer, setBuyer] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim() || (guests && !buyer)) return;
    setBusy(true);
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, buyer }) }).catch(() => null);
    const body = await response?.json().catch(() => null);
    setReply(body?.message ?? body?.error ?? "That did not go through.");
    setCode("");
    setBusy(false);
  }

  return (
    <form className="game-codebox" onSubmit={send}>
      <label>
        <span>{label}</span>
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder={placeholder} autoComplete="off" autoCapitalize="characters" maxLength={60} />
      </label>
      {guests && (
        <label>
          <span>Who said it?</span>
          <select value={buyer} onChange={(event) => setBuyer(event.target.value)}>
            <option value="">Choose a guest…</option>
            {guests.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
          </select>
        </label>
      )}
      <button type="submit" disabled={busy || !code.trim() || (Boolean(guests) && !buyer)}>{button}</button>
      {reply && <p className="game-reply" role="status">{reply}</p>}
    </form>
  );
}

export function PrivateTab({ card, secretsReleased, directory }: { directory?: DirectoryEntry[] | null; card: Card; secretsReleased: boolean }) {
  if (!secretsReleased) {
    return (
      <section className="game-panel game-locked">
        <p className="eyebrow">Sealed until the night</p>
        <h3>Your private card opens when the host starts the game.</h3>
        <p>Your bills, what you carry, your secrets and everything you must not say aloud arrive the moment the host starts the game. Until then, read your Public and Background tabs.</p>
      </section>
    );
  }
  const p = card.private;
  const isButler = p.role?.title === "The Butler";
  return (
    <>
      <section className="game-panel">
        <p className="eyebrow">In your pockets</p>
        <p className="game-cash"><strong>${p.startingCash.toLocaleString("en-US")}</strong> <span>{p.startingCash / 100} House bills of $100</span></p>
        <p>A clue marked &ldquo;Costs $100&rdquo; is told only after you drop a bill in the House Tin. One of your secrets may be sold to a guest for $200.</p>
        {p.carries.length > 0 && (
          <>
            <h4>You carry</h4>
            <ul className="game-carry">{p.carries.map((item) => <li key={item}>{item}</li>)}</ul>
            <p className="game-note">Keep {p.carries.length > 1 ? "these" : "this"} on you (in a pocket or your hand) all night so others can trade with you.</p>
          </>
        )}
        {p.habit && <p className="game-tell"><strong>A habit of yours.</strong> {p.habit}</p>}
      </section>
      <section className="game-panel">
        <p className="eyebrow">What you know, and what you are hiding</p>
        <Lines lines={[...p.secrets, ...p.knows]} />
      </section>
      {p.survivor && (
        <section className="game-panel game-survivor">
          <p className="eyebrow">You are one of the five</p>
          <h3>{p.survivor.veilName}, <em>{p.survivor.veilTitle}</em> · No. {p.survivor.markerNo} on the List</h3>
          <p>{p.survivor.realStory}</p>
          <p>{p.survivor.escape}</p>
          <p className="game-tell"><strong>Your tell.</strong> {p.survivor.tell}</p>
          {p.survivor.rivals.length > 0 && (
            <>
              <h4>The others</h4>
              <ul>{p.survivor.rivals.map((rival) => <li key={rival.name}>{rival.name} <small>· {rival.circle}</small></li>)}</ul>
            </>
          )}
          <h4>How the night works for you</h4>
          <ol>{p.survivor.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
          <CodeBox endpoint="/api/game/dose" label="The nightcap: the code under the glass's coaster" button="Pour" placeholder="Code" />
        </section>
      )}
      {p.role && (
        <section className="game-panel">
          <p className="eyebrow">Your office</p>
          <h3>{p.role.title}</h3>
          <ul>{p.role.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
          {isButler && <CodeBox endpoint="/api/game/butler" label="The House panel: the words the guest said to you" button="Offer" placeholder="The words" guests={directory ?? []} />}
        </section>
      )}
    </>
  );
}

export function ObjectivesTab({ card, secretsReleased, open, saved, onSaved }: { card: Card; secretsReleased: boolean; open: boolean; saved: Map<string, SavedAnswer>; onSaved: (entry: SavedAnswer) => void }) {
  if (!secretsReleased) {
    return (
      <section className="game-panel game-locked">
        <p className="eyebrow">Sealed until the night</p>
        <h3>Your objectives open when the host starts the game.</h3>
        <p>Your five objectives and the race point arrive the moment the host starts the game.</p>
      </section>
    );
  }
  const p = card.private;
  const racePending = !p.race.house && !p.race.closed && !saved.has("objective|race");
  const doneCount = p.objectives.filter((errand) => saved.has(`objective|${errand.id}`)).length;
  return (
    <>
      <section className="game-panel game-glance">
        <p className="eyebrow">Your night at a glance</p>
        <p className="game-glance-count"><strong>{doneCount}</strong> of {p.objectives.length} objectives answered</p>
        <ol className="game-glance-list">
          {p.objectives.map((errand, index) => (
            <li key={errand.id} className={saved.has(`objective|${errand.id}`) ? "done" : undefined}>
              <a href={`#errand-${errand.id}`}><span>{saved.has(`objective|${errand.id}`) ? "\u2713" : index + 1}</span>{errand.title}</a>
            </li>
          ))}
        </ol>
        <p className="game-glance-more">
          {racePending ? "Plus the race point at the bottom of this tab. " : ""}Then open <strong>Answers</strong> for the three mysteries, the survivors and your bills.
        </p>
      </section>
      <section className="game-panel">
        <p className="eyebrow">Your five objectives · {p.totalPoints} points</p>
        <ol className="game-errands">
          {p.objectives.map((errand, index) => (
            <ErrandCard key={errand.id} errand={errand} index={index} saved={saved.get(`objective|${errand.id}`)} open={open} onSaved={onSaved} />
          ))}
        </ol>
      </section>
      <section className="game-panel game-race">
        <p className="eyebrow">Act fast or lose this point</p>
        <h3>{p.race.title}</h3>
        <p><strong>The first to complete this task gets the point.</strong> {p.race.text}</p>
        {!p.race.house && p.race.closed && <p className="game-note"><strong>{p.race.wonByYou ? "You finished first. This point is yours." : "Closed. Someone else already won this point."}</strong></p>}
        {!p.race.house && (!p.race.closed || p.race.wonByYou) && <SubmitBox kind="objective" itemId="race" label={p.race.ask} initial={saved.get("objective|race")} disabled={!open} onSaved={onSaved} />}
        {p.race.slips.length > 0 && <ul>{p.race.slips.map((slip) => <li key={slip}>{slip}</li>)}</ul>}
      </section>
    </>
  );
}

export function AnswersTab({
  secretsReleased,
  open,
  questions,
  directory,
  me,
  survivor,
  butler,
  saved,
  onSaved,
}: {
  secretsReleased: boolean;
  open: boolean;
  questions: FinalQuestion[] | null;
  directory: DirectoryEntry[] | null;
  me: string;
  survivor: boolean;
  butler?: boolean;
  saved: Map<string, SavedAnswer>;
  onSaved: (entry: SavedAnswer) => void;
}) {
  if (!secretsReleased || !questions || !directory) {
    return (
      <section className="game-panel game-locked">
        <p className="eyebrow">Sealed until the night</p>
        <h3>The final questions open with the doors.</h3>
      </section>
    );
  }
  const groups = [
    { id: "old", title: "The Old Mystery: 1924" },
    { id: "new", title: "The New Mystery: tonight" },
    { id: "connection", title: "The Connection" },
  ];
  return (
    <>
      <section className="game-panel">
        <p className="eyebrow">The book stays open until the night ends</p>
        <h3>Answer as you learn. Only your last answer to each question counts.</h3>
        <p className="game-answered"><strong>{questions.filter((question) => saved.has(`mystery|${question.id}`)).length}</strong> of {questions.length} mystery questions answered</p>
        <p>Nothing on this page tells you whether you are right. The three mysteries are worth double every objective put together, so finishing your objectives and never working out the story cannot win the night.</p>
      </section>

      {groups.map((group) => (
        <section className="game-panel" key={group.id}>
          <p className="eyebrow">{group.title}</p>
          {questions
            .filter((question) => question.mystery === group.id)
            .map((question) => (
              <div className="game-question" key={question.id}>
                <h4>{question.prompt} <small className="game-points">{question.points} points</small></h4>
                {question.type === "guest" ? (
                  <GuestPicker question={question} directory={directory} me={me} initial={saved.get(`mystery|${question.id}`)} open={open} onSaved={onSaved} />
                ) : (
                  <SubmitBox kind="mystery" itemId={question.id} label={question.hint} initial={saved.get(`mystery|${question.id}`)} disabled={!open} multiline withProof onSaved={onSaved} />
                )}
              </div>
            ))}
        </section>
      ))}

      <section className="game-panel">
        <p className="eyebrow">The Survivors</p>
        <SurvivorPicker directory={directory} me={me} survivor={survivor} initial={saved.get("survivors|picks")} open={open} onSaved={onSaved} />
      </section>

      <section className="game-panel">
        <p className="eyebrow">Your bills</p>
        <p>At the end of the night, count the House bills in your pocket and type the total in dollars.</p>
        <ul>
          <li>The quarter of the room that ends best off against where they started earns one point.</li>
          <li>Clues bought at the bar and secrets you buy cost money; a secret you sell earns it.</li>
          <li>If you have a money errand, you are counted from its target.</li>
          <li>Bartend Joe may ask to see your bills.{butler && " The Butler runs the House's money, so you are not in this bonus; type your bills anyway."}</li>
        </ul>
        <SubmitBox kind="objective" itemId="cash" label="Dollars in your pocket at the end" initial={saved.get("objective|cash")} disabled={!open} onSaved={onSaved} />
      </section>
    </>
  );
}

function GuestPicker({ question, directory, me, initial, open, onSaved }: { question: FinalQuestion; directory: DirectoryEntry[]; me: string; initial?: SavedAnswer; open: boolean; onSaved: (entry: SavedAnswer) => void }) {
  const [choice, setChoice] = useState(initial?.answer ?? "");
  return (
    <>
      <label className="game-pick">
        <span>{question.hint}</span>
        <select value={choice} onChange={(event) => setChoice(event.target.value)} disabled={!open}>
          <option value="">Choose a guest…</option>
          {directory.filter((entry) => entry.id !== me).map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.name}</option>
          ))}
        </select>
      </label>
      <SubmitBox kind="mystery" itemId={question.id} label="Your answer" initial={initial} disabled={!open || !choice} compose={() => choice} onSaved={onSaved} key={`${question.id}-${initial?.at ?? "new"}`} />
    </>
  );
}

function SurvivorPicker({ directory, me, survivor, initial, open, onSaved }: { directory: DirectoryEntry[]; me: string; survivor: boolean; initial?: SavedAnswer; open: boolean; onSaved: (entry: SavedAnswer) => void }) {
  const [picked, setPicked] = useState<string[]>(() => {
    try {
      return initial ? (JSON.parse(initial.answer) as string[]) : [];
    } catch {
      return [];
    }
  });
  const toggle = (id: string) => setPicked((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : current.length >= 4 ? current : [...current, id]));
  return (
    <>
      <p>{survivor ? "You already know you are one of them, but you do not know the others. " : ""}Name up to four guests you believe are survivors. A right name earns one point; a wrong name costs half a point. Name nobody if you are not sure.</p>
      <ul className="game-picklist">
        {directory.filter((entry) => entry.id !== me).map((entry) => (
          <li key={entry.id}>
            <label>
              <input type="checkbox" checked={picked.includes(entry.id)} onChange={() => toggle(entry.id)} disabled={!open || (!picked.includes(entry.id) && picked.length >= 4)} />
              <span>{entry.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <SubmitBox kind="survivors" itemId="picks" label={`${picked.length} of 4 named`} initial={initial} disabled={!open} compose={() => (picked.length ? JSON.stringify(picked) : "")} onSaved={onSaved} key={`picks-${initial?.at ?? "new"}`} />
    </>
  );
}

export function ResultsTab({ results }: { results: Results | null }) {
  if (!results) {
    return (
      <section className="game-panel game-locked">
        <p className="eyebrow">Not yet</p>
        <h3>The book is being read.</h3>
        <p>Results appear here when the host has graded the night. Nothing is shown until then.</p>
      </section>
    );
  }
  const { you, board, awards, solution } = results;
  const name = (slug: string | null) => slug ?? "Nobody";
  return (
    <>
      <section className="game-panel game-winner">
        <p className="eyebrow">The Veil has lifted</p>
        <h3>{results.winner ? `${results.winner} solved the night.` : "Nobody scored."}</h3>
        {results.killer && <p>The Keeper was poisoned by <strong>{results.killer}</strong>.</p>}
        {you && (
          <p className="game-yourscore">
            You scored <strong>{you.total}</strong> and finished {ordinal(you.rank)} overall.
          </p>
        )}
      </section>
      {you && (
        <section className="game-panel">
          <p className="eyebrow">Where your points came from</p>
          <table className="game-table">
            <tbody>
              <tr><th>Objectives</th><td>{you.tiers.objectives} / 5</td></tr>
              <tr><th>Survivors named</th><td>{you.tiers.survivors} / 4</td></tr>
              <tr><th>The three mysteries</th><td>{you.tiers.mysteries} / 10</td></tr>
              <tr><th>Group race</th><td>{you.tiers.race} / 1</td></tr>
              <tr><th>Wallet bonus</th><td>{you.tiers.cash} / 1</td></tr>
            </tbody>
          </table>
          <details>
            <summary>Every answer, and how it was read</summary>
            <ul className="game-itemlist">
              {you.items.filter((item) => item.max > 0).map((item) => (
                <li key={`${item.kind}-${item.itemId}`}>
                  <strong>{item.points} / {item.max}</strong> <span>{item.kind} · {item.itemId}</span>
                  <small>{item.rationale}</small>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}
      <section className="game-panel">
        <p className="eyebrow">What really happened</p>
        {solution.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <h4>The five</h4>
        <ul>{solution.survivors.map((entry) => <li key={entry.markerNo}><strong>{entry.cover}</strong> was {entry.real}, {entry.title} (No. {entry.markerNo} on the List).</li>)}</ul>
      </section>
      <section className="game-panel game-letter">
        <p className="eyebrow">Cassie&rsquo;s letter</p>
        {solution.letter.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <section className="game-panel">
        <p className="eyebrow">Honours</p>
        <ul className="game-awards">
          {awards.map((award) => (
            <li key={award.id}><strong>{award.title}</strong> {name(award.guest)}<small>{award.detail}</small></li>
          ))}
        </ul>
      </section>
      <section className="game-panel">
        <p className="eyebrow">The final board</p>
        <table className="game-table game-board">
          <tbody>
            {board.map((row) => (
              <tr key={row.guest} className={row.isYou ? "you" : undefined}>
                <th>{row.rank}</th>
                <td>{row.name}{row.survivor ? " ✦" : ""}</td>
                <td className="numeric">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="game-note">✦ marks a survivor, revealed now that the night is over.</p>
      </section>
    </>
  );
}

function ordinal(n: number) {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffix[(v - 20) % 10] ?? suffix[v] ?? suffix[0]}`;
}
