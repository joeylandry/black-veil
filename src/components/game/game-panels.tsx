"use client";

import { FormEvent, useState } from "react";
import type { Card, DirectoryEntry, Errand, FinalQuestion, Line, Results, SavedAnswer } from "./game-types";
import { SubmitBox } from "./submit-box";

const shareLabel: Record<Line["share"], string> = { free: "Say it freely", trade: "Trade it", paid: "Costs $100 at the bar", secret: "Keep it close" };

export function Lines({ lines }: { lines: Line[] }) {
  if (!lines.length) return null;
  return (
    <ul className="game-lines">
      {lines.map((line) => (
        <li key={line.text}>
          <span className={`game-chip game-chip-${line.share}`}>{shareLabel[line.share]}</span>
          {line.text}
        </li>
      ))}
    </ul>
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
    <li className="game-errand">
      <header>
        <span className="game-errand-no">{index + 1}</span>
        <div>
          <h4>{errand.title}</h4>
          <small>{errand.points} point · {errandLabel(errand.kind)}</small>
        </div>
      </header>
      <p>{errand.text}</p>
      {errand.withNames.length > 0 && <p className="game-with">Seek out: {errand.withNames.join(" · ")}</p>}
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

/** A small box that sends one code to a House endpoint and shows the reply, whatever it is. */
function CodeBox({ endpoint, label, button, placeholder }: { endpoint: string; label: string; button: string; placeholder: string }) {
  const [code, setCode] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }).catch(() => null);
    const body = await response?.json().catch(() => null);
    setReply(body?.message ?? body?.error ?? "That did not go through.");
    setCode("");
    setBusy(false);
  }

  return (
    <form className="game-codebox" onSubmit={send}>
      <label>
        <span>{label}</span>
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder={placeholder} autoComplete="off" autoCapitalize="characters" maxLength={12} />
      </label>
      <button type="submit" disabled={busy || !code.trim()}>{button}</button>
      {reply && <p className="game-reply" role="status">{reply}</p>}
    </form>
  );
}

export function PrivateTab({ card, secretsReleased, open, saved, onSaved }: { card: Card; secretsReleased: boolean; open: boolean; saved: Map<string, SavedAnswer>; onSaved: (entry: SavedAnswer) => void }) {
  if (!secretsReleased) {
    return (
      <section className="game-panel game-locked">
        <p className="eyebrow">Sealed until the night</p>
        <h3>Your private card opens when the host starts the game.</h3>
        <p>Your secrets, your five objectives and everything you must not say aloud arrive the moment the host starts the game. Until then, read your Public and Background tabs.</p>
      </section>
    );
  }
  const p = card.private;
  const isButler = p.role?.title === "The Butler";
  return (
    <>
      {p.survivor && (
        <section className="game-panel game-survivor">
          <p className="eyebrow">You are one of the five</p>
          <h3>{p.survivor.veilName}, <em>{p.survivor.veilTitle}</em> · marker No. {p.survivor.markerNo}</h3>
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
          {isButler && <CodeBox endpoint="/api/game/butler" label="The House panel: the code printed on a marker" button="Offer" placeholder="Marker code" />}
        </section>
      )}
      <section className="game-panel">
        <p className="eyebrow">Your five objectives · {p.totalPoints} points</p>
        <ol className="game-errands">
          {p.objectives.map((errand, index) => (
            <ErrandCard key={errand.id} errand={errand} index={index} saved={saved.get(`objective|${errand.id}`)} open={open} onSaved={onSaved} />
          ))}
        </ol>
      </section>
      <section className="game-panel">
        <p className="eyebrow">Act fast or lose this point</p>
        <p><strong>The first to complete this task gets the point.</strong> {p.race.text}</p>
        {!p.race.house && p.race.closed && <p className="game-note"><strong>{p.race.wonByYou ? "You finished first. This point is yours." : "Closed. Someone else already won this point."}</strong></p>}
        {!p.race.house && (!p.race.closed || p.race.wonByYou) && <SubmitBox kind="objective" itemId="race" label={p.race.ask} initial={saved.get("objective|race")} disabled={!open} onSaved={onSaved} />}
        {p.race.slips.length > 0 && <ul>{p.race.slips.map((slip) => <li key={slip}>{slip}</li>)}</ul>}
      </section>
      <section className="game-panel">
        <p className="eyebrow">In your pockets</p>
        <p>You start the night with ${p.startingCash.toLocaleString("en-US")} in House bills ({p.startingCash / 100} bills of $100). A clue tagged &ldquo;Costs $100 at the bar&rdquo; is told only after you drop a bill in the House Tin; a secret of yours can be sold to a guest for $200.{p.carries.length > 0 && <> You also carry: {p.carries.join(", ")}. Keep these on you (in a pocket or your hand) all night so others can trade with you.</>}</p>
        {p.habit && <p className="game-tell"><strong>A habit of yours.</strong> {p.habit}</p>}
      </section>
      <section className="game-panel">
        <p className="eyebrow">What you know, and what you are hiding</p>
        <Lines lines={p.secrets} />
        <Lines lines={p.knows} />
        <p className="game-note">Some of this is yours to trade or tell; some is not. The tag on each line says which.</p>
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
  saved,
  onSaved,
}: {
  secretsReleased: boolean;
  open: boolean;
  questions: FinalQuestion[] | null;
  directory: DirectoryEntry[] | null;
  me: string;
  survivor: boolean;
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
        <p>Nothing on this page tells you whether you are right. The three mysteries are worth double every objective put together, so finishing your objectives and never working out the story cannot win the night.</p>
      </section>

      {groups.map((group) => (
        <section className="game-panel" key={group.id}>
          <p className="eyebrow">{group.title}</p>
          {questions
            .filter((question) => question.mystery === group.id)
            .map((question) => (
              <div className="game-question" key={question.id}>
                <h4>{question.prompt} <small>{question.points} points</small></h4>
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
        <p>When the night ends, count the House bills in your pocket and type the total in dollars. The quarter of the room that ends the night best off against where they started (the most gained, or the least spent) earns one point. If you have a money errand, you are counted from its target, because that errand already pays you for earning. Spend wisely: clues at the bar and secrets you buy cost money, a secret you sell earns it. Bartend Joe may ask to see your bills.</p>
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
        <ul>{solution.survivors.map((entry) => <li key={entry.markerNo}><strong>{entry.cover}</strong> was {entry.real}, {entry.title} (marker {entry.markerNo}).</li>)}</ul>
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
