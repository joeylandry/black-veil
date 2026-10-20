"use client";

import { FormEvent, useState } from "react";
import { eventConfig } from "@/config/event";
import type { Card, DirectoryEntry, Errand, FinalQuestion, Line, Results, SavedAnswer } from "./game-types";
import { SubmitBox } from "./submit-box";

const shareLabel: Record<Line["share"], string> = { free: "Say it freely", trade: "Trade it", secret: "Keep it close" };

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

function ErrandCard({ errand, index, saved, open, onSaved }: { errand: Errand; index: number; saved?: SavedAnswer; open: boolean; onSaved: (entry: SavedAnswer) => void }) {
  const decidedElsewhere = errand.house;
  return (
    <li className="game-errand">
      <header>
        <span className="game-errand-no">{index + 1}</span>
        <div>
          <h4>{errand.title}</h4>
          <small>{errand.points} points · {errandLabel(errand.kind)}</small>
        </div>
      </header>
      <p>{errand.text}</p>
      {errand.withNames.length > 0 && <p className="game-with">Seek out: {errand.withNames.join(" · ")}</p>}
      <SubmitBox
        kind="objective"
        itemId={errand.id}
        label={decidedElsewhere ? `${errand.ask} (optional: the House and the night decide this one)` : errand.ask}
        initial={saved}
        disabled={!open}
        withProof={!decidedElsewhere && errand.kind !== "find" && errand.kind !== "swap"}
        onSaved={onSaved}
      />
    </li>
  );
}

const errandLabel = (kind: string) =>
  ({ find: "a thing to find", learn: "a secret to learn", swap: "a trade to make", money: "money to make", hide: "a secret to keep", seek: "gossip to find", story: "a clue to chase", chain: "the House", motive: "your own story", role: "your office" })[kind] ?? kind;

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
    const when = new Date(eventConfig.secretsReleaseAt).toLocaleString([], { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
    return (
      <section className="game-panel game-locked">
        <p className="eyebrow">Sealed until the night</p>
        <h3>Your private card opens on {when}.</h3>
        <p>Your secrets, your five errands and everything you must not say aloud arrive when the doors open. Until then, read your Public and Background tabs and decide what to wear.</p>
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
          <h4>The others</h4>
          <ul>{p.survivor.rivals.map((rival) => <li key={rival.name}>{rival.name} <small>· {rival.circle}</small></li>)}</ul>
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
        <p className="eyebrow">Your five errands · {p.totalPoints} points</p>
        <ol className="game-errands">
          {p.objectives.map((errand, index) => (
            <ErrandCard key={errand.id} errand={errand} index={index} saved={saved.get(`objective|${errand.id}`)} open={open} onSaved={onSaved} />
          ))}
        </ol>
      </section>
      <section className="game-panel">
        <p className="eyebrow">In your pockets</p>
        <p>You start the night with ${p.startingCash} in House bills.{p.carries.length > 0 && <> You also carry: {p.carries.join(", ")}.</>}</p>
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
  const filed = [...saved.values()].filter((entry) => entry.kind === "exhibit");
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
        <p>Nothing on this page tells you whether you are right. The three mysteries are worth more than every errand put together, so finishing your errands and never working out the story cannot win the night.</p>
      </section>

      <section className="game-panel">
        <p className="eyebrow">Pages and clues you have found</p>
        <p>Every printed page ends with a short filing code. Type one to file it. Two points a page, six pages at most. Pages you were handed do not count.</p>
        <SubmitBox kind="exhibit" itemId="new" label="A filing code" placeholder="e.g. at the foot of a page" disabled={!open} onSaved={onSaved} key={`exhibit-${filed.length}`} />
        {filed.length > 0 && <p className="game-filed">Filed so far: {filed.map((entry) => entry.answer).join(" · ")}</p>}
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
        {survivor ? (
          <p>You know them already. Your own marks for the night come from how well you stay hidden: every guest who names you takes two points off.</p>
        ) : (
          <SurvivorPicker directory={directory} me={me} initial={saved.get("survivors|picks")} open={open} onSaved={onSaved} />
        )}
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

function SurvivorPicker({ directory, me, initial, open, onSaved }: { directory: DirectoryEntry[]; me: string; initial?: SavedAnswer; open: boolean; onSaved: (entry: SavedAnswer) => void }) {
  const [picked, setPicked] = useState<string[]>(() => {
    try {
      return initial ? (JSON.parse(initial.answer) as string[]) : [];
    } catch {
      return [];
    }
  });
  const toggle = (id: string) => setPicked((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : current.length >= 5 ? current : [...current, id]));
  return (
    <>
      <p>Name up to five guests you believe are survivors. A right name earns four points; a wrong name costs two. Name nobody if you are not sure.</p>
      <ul className="game-picklist">
        {directory.filter((entry) => entry.id !== me).map((entry) => (
          <li key={entry.id}>
            <label>
              <input type="checkbox" checked={picked.includes(entry.id)} onChange={() => toggle(entry.id)} disabled={!open || (!picked.includes(entry.id) && picked.length >= 5)} />
              <span>{entry.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <SubmitBox kind="survivors" itemId="picks" label={`${picked.length} of 5 named`} initial={initial} disabled={!open} compose={() => (picked.length ? JSON.stringify(picked) : "")} onSaved={onSaved} key={`picks-${initial?.at ?? "new"}`} />
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
            You scored <strong>{you.total}</strong> and finished {ordinal(you.rank)} overall, {ordinal(you.circleRank)} in your circle.
          </p>
        )}
      </section>
      {you && (
        <section className="game-panel">
          <p className="eyebrow">Where your points came from</p>
          <table className="game-table">
            <tbody>
              <tr><th>Errands</th><td>{you.tiers.objectives} / 60</td></tr>
              <tr><th>Pages filed</th><td>{you.tiers.exhibits} / 12</td></tr>
              <tr><th>Survivors</th><td>{you.tiers.survivors} / 20</td></tr>
              <tr><th>The three mysteries</th><td>{you.tiers.mysteries} / 100</td></tr>
              {you.tiers.poisoner > 0 && <tr><th>The Poisoner</th><td>{you.tiers.poisoner}</td></tr>}
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
