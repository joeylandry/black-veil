"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSimulation, getTrack, simulationMinutes } from "@/data/leap";
import type { Exhibit, Mission, Simulation, TrackId } from "@/data/leap/types";
import { labStatus, missionStars, useLabProgress } from "./progress";
import { ConsoleSession, TaskView, createConsoleSession, taskLabels } from "./tasks";

/** Inline `code` and *emphasis* in lab copy. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*[^*\s][^*]*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) return <code key={index}>{part.slice(1, -1)}</code>;
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </>
  );
}

function ExhibitView({ exhibit }: { exhibit: Exhibit }) {
  if (exhibit.kind === "table") {
    return (
      <figure className="leap-exhibit">
        <figcaption>{exhibit.title}</figcaption>
        <div className="leap-table-wrap">
          <table className="leap-table">
            <thead>
              <tr>
                {exhibit.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exhibit.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    );
  }
  if (exhibit.kind === "code") {
    return (
      <figure className="leap-exhibit">
        <figcaption>{exhibit.title}</figcaption>
        <pre className="leap-pre">{exhibit.text}</pre>
      </figure>
    );
  }
  return (
    <figure className="leap-exhibit note">
      <figcaption>{exhibit.title}</figcaption>
      <ul>
        {exhibit.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </figure>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="leap-stars" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((index) => (
        <span key={index} className={index < count ? "on" : ""} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

function LabTimer({ minutes }: { minutes: number }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className={left === 0 ? "leap-timer over" : "leap-timer"}>
      <span className="leap-timer-label">Lab timer</span>
      <strong aria-live="off">
        {mm}:{ss}
      </strong>
      <div>
        <button type="button" className="leap-btn small" onClick={() => setRunning((value) => !value)} disabled={left === 0}>
          {running ? "Pause" : left === total ? "Start" : "Resume"}
        </button>
        <button
          type="button"
          className="leap-link"
          onClick={() => {
            setRunning(false);
            setLeft(total);
          }}
        >
          Reset
        </button>
      </div>
      {left === 0 && <small>Time! Finish your mission and jump to the debrief.</small>}
    </div>
  );
}

type View = { kind: "briefing" } | { kind: "mission"; index: number } | { kind: "debrief" };

function MissionView({
  sim,
  mission,
  index,
  done,
  hintsUsed,
  pair,
  sessions,
  onHint,
  onComplete,
  onNext,
}: {
  sim: Simulation;
  mission: Mission;
  index: number;
  done: boolean;
  hintsUsed: number;
  pair: [string, string];
  sessions: Map<string, ConsoleSession>;
  onHint: () => void;
  onComplete: () => void;
  onNext: () => void;
}) {
  const [solved, setSolved] = useState<number[]>([]);
  const allSolved = solved.length === mission.tasks.length;

  const markSolved = useCallback(
    (taskIndex: number) => {
      setSolved((current) => {
        if (current.includes(taskIndex)) return current;
        const next = [...current, taskIndex];
        if (next.length === mission.tasks.length) window.setTimeout(onComplete, 0);
        return next;
      });
    },
    [mission.tasks.length, onComplete],
  );

  const sessionFor = (taskIndex: number) => {
    const task = mission.tasks[taskIndex];
    const key = task.kind === "console" && task.session ? task.session : `${mission.id}:${taskIndex}`;
    let session = sessions.get(key);
    if (!session) {
      session = createConsoleSession();
      sessions.set(key, session);
    }
    return session;
  };

  const [driver, navigator] = index % 2 === 0 ? pair : [pair[1], pair[0]];
  const isLast = index === sim.missions.length - 1;

  return (
    <article className="leap-mission" aria-labelledby={`mission-${mission.id}`}>
      <header className="leap-mission-head">
        <p className="leap-eyebrow">
          Mission {index + 1} of {sim.missions.length} · about {mission.minutes} min
        </p>
        <h2 id={`mission-${mission.id}`}>{mission.title}</h2>
        <div className="leap-roles">
          <span>
            <b>Driver</b> {driver || "Partner A"} <small>hands on keyboard</small>
          </span>
          <span>
            <b>Navigator</b> {navigator || "Partner B"} <small>reads, guides, checks</small>
          </span>
        </div>
      </header>

      <p className="leap-brief">
        <Rich text={mission.brief} />
      </p>

      <aside className="leap-notes">
        <h3>Field notes</h3>
        <p>
          <Rich text={mission.learn} />
        </p>
      </aside>

      {mission.exhibits?.map((exhibit) => (
        <ExhibitView key={exhibit.title} exhibit={exhibit} />
      ))}

      {mission.tasks.map((task, taskIndex) => (
        <section key={taskIndex} className={solved.includes(taskIndex) ? "leap-task solved" : "leap-task"}>
          <h3>
            <span className="leap-task-num">{solved.includes(taskIndex) ? "✓" : taskIndex + 1}</span>
            {taskLabels[task.kind]}
          </h3>
          <TaskView task={task} solved={solved.includes(taskIndex)} onSolved={() => markSolved(taskIndex)} session={sessionFor(taskIndex)} />
        </section>
      ))}

      <section className="leap-hints">
        <h3>Stuck?</h3>
        {mission.hints.slice(0, hintsUsed).map((hint, hintIndex) => (
          <p key={hint} className="leap-hint">
            <b>Hint {hintIndex + 1}</b> <Rich text={hint} />
          </p>
        ))}
        {hintsUsed < mission.hints.length ? (
          <button type="button" className="leap-btn ghost" onClick={onHint}>
            Show a hint {hintsUsed === 0 ? "(−1 star)" : ""}
          </button>
        ) : (
          <p className="leap-muted">That&apos;s every hint for this mission. Ask your partner — or your facilitator.</p>
        )}
      </section>

      {(allSolved || done) && (
        <section className="leap-cleared" role="status">
          <p className="leap-cleared-title">
            {allSolved ? "Mission cleared!" : "You've cleared this mission before."} <Stars count={hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1} />
          </p>
          <p>
            <Rich text={mission.debrief} />
          </p>
          <button type="button" className="leap-btn primary" onClick={onNext}>
            {isLast ? "Go to the debrief →" : "Next mission → swap driver"}
          </button>
        </section>
      )}
    </article>
  );
}

export function SimRunner({ trackId, slug }: { trackId: TrackId; slug: string }) {
  const track = getTrack(trackId);
  const sim = getSimulation(trackId, slug);
  const { progress, update } = useLabProgress(trackId, slug);
  const [view, setView] = useState<View>({ kind: "briefing" });
  // One store per page visit: shared notebook-style consoles keep their state across missions.
  const [sessions] = useState(() => new Map<string, ConsoleSession>());
  const stageTop = useRef<HTMLDivElement>(null);

  const go = (next: View) => {
    setView(next);
    window.requestAnimationFrame(() => stageTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const complete = useCallback(
    (missionId: string) => update((current) => (current.done.includes(missionId) ? current : { ...current, done: [...current.done, missionId] })),
    [update],
  );

  if (!track || !sim) return null;

  const status = labStatus(sim, progress);
  const stars = sim.missions.reduce((sum, mission) => sum + missionStars(progress, mission.id), 0);
  const mission = view.kind === "mission" ? sim.missions[view.index] : null;
  const neighbours = track.simulations;
  const position = neighbours.findIndex((candidate) => candidate.slug === sim.slug);

  return (
    <div className={sim.shared ? "leap-lab shared" : "leap-lab"}>
      <nav className="leap-crumbs" aria-label="Breadcrumb">
        <Link href="/leap">LEAP Labs</Link> <span aria-hidden="true">›</span> <Link href={`/leap/${track.id}`}>{track.name}</Link> <span aria-hidden="true">›</span>{" "}
        <span>Week {sim.week}</span>
      </nav>

      <header className="leap-lab-hero">
        <div className="leap-lab-hero-copy">
          <p className="leap-tags">
            <span className="leap-tag week">Week {sim.week}</span>
            <span className="leap-tag">{sim.shared ? "SA + SWE shared week" : `${track.short} specific`}</span>
            <span className="leap-tag">{sim.focus}</span>
          </p>
          <h1>{sim.title}</h1>
          <p className="leap-tagline">{sim.tagline}</p>
          <p className="leap-meta">
            ⏱ about {simulationMinutes(sim)} min · 👥 built for pairs · {sim.missions.length} missions
          </p>
          <ul className="leap-tools" aria-label="Tools and platforms">
            {sim.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
        <div className="leap-lab-hero-side">
          <div className="leap-progress-card">
            <span className="leap-badge-emoji" aria-hidden="true">
              {status.complete ? sim.badge.emoji : "🔒"}
            </span>
            <strong>{status.complete ? sim.badge.name : `Badge: ${sim.badge.name}`}</strong>
            <div className="leap-bar" role="progressbar" aria-valuemin={0} aria-valuemax={status.total} aria-valuenow={status.done} aria-label="Missions cleared">
              <span style={{ width: `${(status.done / status.total) * 100}%` }} />
            </div>
            <small>
              {status.done} of {status.total} missions · {stars} of {status.total * 3} ★
            </small>
          </div>
          <LabTimer minutes={simulationMinutes(sim)} />
        </div>
      </header>

      <div className="leap-lab-body">
        <aside className="leap-steps" aria-label="Lab steps">
          <ol>
            <li>
              <button type="button" className={view.kind === "briefing" ? "active" : ""} onClick={() => go({ kind: "briefing" })}>
                <span className="leap-step-mark">▶</span>
                <span>
                  <b>Briefing</b>
                  <small>Pair up &amp; read the scene</small>
                </span>
              </button>
            </li>
            {sim.missions.map((item, itemIndex) => {
              const cleared = progress.done.includes(item.id);
              return (
                <li key={item.id}>
                  <button type="button" className={view.kind === "mission" && view.index === itemIndex ? "active" : ""} onClick={() => go({ kind: "mission", index: itemIndex })}>
                    <span className={cleared ? "leap-step-mark done" : "leap-step-mark"}>{cleared ? "✓" : itemIndex + 1}</span>
                    <span>
                      <b>{item.title}</b>
                      <small>
                        {item.minutes} min · {item.tasks.map((task) => taskLabels[task.kind]).join(" + ")}
                      </small>
                      {cleared && <Stars count={missionStars(progress, item.id)} />}
                    </span>
                  </button>
                </li>
              );
            })}
            <li>
              <button type="button" className={view.kind === "debrief" ? "active" : ""} onClick={() => go({ kind: "debrief" })}>
                <span className={status.complete ? "leap-step-mark done" : "leap-step-mark"}>{sim.badge.emoji}</span>
                <span>
                  <b>Debrief</b>
                  <small>Takeaways &amp; talk it through</small>
                </span>
              </button>
            </li>
          </ol>
        </aside>

        <div className="leap-stage" ref={stageTop}>
          {view.kind === "briefing" && (
            <article className="leap-briefing">
              <p className="leap-eyebrow">The scene</p>
              <p className="leap-story">
                <Rich text={sim.story} />
              </p>
              <div className="leap-pair">
                <h2>Pair up</h2>
                <p>Work as a driver and a navigator. The driver types; the navigator reads the brief, spots mistakes and keeps time. Swap every mission.</p>
                <div className="leap-pair-fields">
                  {[0, 1].map((slot) => (
                    <label key={slot}>
                      <span>{slot === 0 ? "Partner A (drives first)" : "Partner B (navigates first)"}</span>
                      <input
                        value={progress.pair[slot]}
                        placeholder="Name"
                        maxLength={40}
                        onChange={(event) =>
                          update((current) => {
                            const pair: [string, string] = [...current.pair];
                            pair[slot] = event.target.value;
                            return { ...current, pair };
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="leap-how">
                <div>
                  <b>1 · Read</b>
                  <span>Each mission opens with a story beat and field notes.</span>
                </div>
                <div>
                  <b>2 · Do</b>
                  <span>Hands-on tasks check your work instantly. Retry as often as you like.</span>
                </div>
                <div>
                  <b>3 · Earn</b>
                  <span>Three stars per mission — hints cost one. Clear them all for the badge.</span>
                </div>
              </div>
              <button type="button" className="leap-btn primary big" onClick={() => go({ kind: "mission", index: 0 })}>
                {status.done ? "Continue" : "Start mission 1"} →
              </button>
            </article>
          )}

          {mission && view.kind === "mission" && (
            <MissionView
              key={mission.id}
              sim={sim}
              mission={mission}
              index={view.index}
              done={progress.done.includes(mission.id)}
              hintsUsed={progress.hints[mission.id] ?? 0}
              pair={progress.pair}
              sessions={sessions}
              onHint={() =>
                update((current) => ({
                  ...current,
                  hints: { ...current.hints, [mission.id]: Math.min(mission.hints.length, (current.hints[mission.id] ?? 0) + 1) },
                }))
              }
              onComplete={() => complete(mission.id)}
              onNext={() => go(view.index + 1 < sim.missions.length ? { kind: "mission", index: view.index + 1 } : { kind: "debrief" })}
            />
          )}

          {view.kind === "debrief" && (
            <article className="leap-debrief">
              <div className={status.complete ? "leap-award won" : "leap-award"}>
                <span className="leap-award-emoji" aria-hidden="true">
                  {status.complete ? sim.badge.emoji : "🔒"}
                </span>
                <div>
                  <p className="leap-eyebrow">{status.complete ? "Badge earned" : "Badge locked"}</p>
                  <h2>{sim.badge.name}</h2>
                  <p>
                    {status.complete
                      ? `All ${status.total} missions cleared with ${stars} of ${status.total * 3} stars${progress.pair[0] && progress.pair[1] ? ` — nice work, ${progress.pair[0]} and ${progress.pair[1]}` : ""}.`
                      : `${status.total - status.done} mission${status.total - status.done === 1 ? "" : "s"} still to clear.`}
                  </p>
                </div>
              </div>
              <section>
                <h3>What you practised</h3>
                <ul className="leap-takeaways">
                  {sim.takeaways.map((item) => (
                    <li key={item}>
                      <Rich text={item} />
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>Talk it through (5 minutes)</h3>
                <ol className="leap-discuss">
                  {sim.discuss.map((item, itemIndex) => (
                    <li key={item}>
                      <b>{itemIndex === 0 ? progress.pair[0] || "Partner A" : progress.pair[1] || "Partner B"}:</b> {item}
                    </li>
                  ))}
                </ol>
              </section>
              <div className="leap-next">
                {position > 0 && (
                  <Link className="leap-btn" href={`/leap/${track.id}/${neighbours[position - 1].slug}`}>
                    ← Week {neighbours[position - 1].week}
                  </Link>
                )}
                <Link className="leap-btn" href={`/leap/${track.id}`}>
                  All {track.short} labs
                </Link>
                {position < neighbours.length - 1 && (
                  <Link className="leap-btn primary" href={`/leap/${track.id}/${neighbours[position + 1].slug}`}>
                    Week {neighbours[position + 1].week}: {neighbours[position + 1].title} →
                  </Link>
                )}
              </div>
              {status.done > 0 && (
                <button
                  type="button"
                  className="leap-link danger"
                  onClick={() => {
                    if (window.confirm("Reset this lab's progress and stars on this device?")) update((current) => ({ ...current, done: [], hints: {} }));
                  }}
                >
                  Reset this lab&apos;s progress
                </button>
              )}
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
