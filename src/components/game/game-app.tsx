"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlackVeilInsignia } from "../black-veil-insignia";
import type { CardResponse, Results, SavedAnswer } from "./game-types";
import { AnswersTab, PrivateTab, ResultsTab } from "./game-panels";

type Tab = "public" | "background" | "private" | "answers" | "results";
type Load = { phase: "loading" } | { phase: "signed-out" } | { phase: "ready"; data: CardResponse };

/**
 * The guest's night: their card in three tabs, the final answers, and later the results.
 * Everything private arrives from the server only when the night begins; before that the
 * browser holds nothing to peek at.
 */
export function GameApp() {
  const [load, setLoad] = useState<Load>({ phase: "loading" });
  const [tab, setTab] = useState<Tab>("public");
  const [saved, setSaved] = useState<Map<string, SavedAnswer>>(new Map());
  const [results, setResults] = useState<Results | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/game/card", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) return setLoad({ phase: "signed-out" });
        setLoad({ phase: "ready", data: (await response.json()) as CardResponse });
      })
      .catch(() => undefined);
  }, []);

  // Poll gently: the page flips from "coming very soon" to your card by itself.
  useEffect(() => {
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const ready = load.phase === "ready" && load.data.status === "ok" ? load.data : null;
  const secretsReleased = ready?.secretsReleased ?? false;
  const published = ready?.state.resultsPublished ?? false;

  useEffect(() => {
    if (!secretsReleased) return;
    fetch("/api/game/submissions", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!body) return;
        setSaved(new Map((body.submissions as SavedAnswer[]).map((entry) => [`${entry.kind}|${entry.itemId}`, entry])));
      })
      .catch(() => undefined);
  }, [secretsReleased]);

  useEffect(() => {
    if (!published) return;
    fetch("/api/game/results", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => setResults(body?.published ? (body.results as Results) : null))
      .catch(() => undefined);
  }, [published]);

  const onSaved = useCallback((entry: SavedAnswer) => {
    setSaved((current) => new Map(current).set(`${entry.kind}|${entry.itemId}`, entry));
  }, []);

  const tabs = useMemo(() => {
    const list: { id: Tab; label: string }[] = [
      { id: "public", label: "Public" },
      { id: "background", label: "Background" },
      { id: "private", label: "Private" },
      { id: "answers", label: "Answers" },
    ];
    if (published) list.push({ id: "results", label: "Results" });
    return list;
  }, [published]);

  if (load.phase === "loading") return <div className="ledger-checking" aria-live="polite">Opening your night…</div>;

  if (load.phase === "signed-out") {
    return (
      <section className="game-soon">
        <BlackVeilInsignia />
        <p className="eyebrow">Your night</p>
        <h1>Sign in first.</h1>
        <p>Your character belongs to the name you gave the guest ledger. <Link href="/guest-ledger">Enter your name</Link>, or <Link href="/resume">sign in on this device</Link>.</p>
      </section>
    );
  }

  const { data } = load;
  if (data.status === "sealed") {
    return (
      <section className="game-soon">
        <BlackVeilInsignia />
        <p className="eyebrow">Your night · October 23, 1926</p>
        <h1>Characters coming very soon.</h1>
        <p>Management is still choosing who everyone will be. Your identity for the evening, your history and what to wear will appear on this page the moment the cast is released. Nothing here needs doing yet.</p>
        <p className="game-soon-note">This page checks for itself every few seconds. There is no need to refresh.</p>
      </section>
    );
  }
  if (data.status === "uncast") {
    return (
      <section className="game-soon">
        <BlackVeilInsignia />
        <p className="eyebrow">Your night · October 23, 1926</p>
        <h1>Your identity is still being chosen.</h1>
        <p>The cast has been released, but management has not yet matched a character to your name. It will appear here very soon. If you RSVP&rsquo;d with a different name or email than you use with friends, tell the host.</p>
      </section>
    );
  }

  if (data.status !== "ok") return null;
  const { card } = data;
  const open = data.state.submissionsOpen;
  return (
    <div className="game-app">
      <header className="game-header">
        <p className="eyebrow">Your identity for the evening · {card.circle.name}</p>
        <h1>{card.name}</h1>
        <p className="game-occupation">{card.occupation}</p>
        <p className="game-circle">{card.circle.blurb}</p>
      </header>

      <nav className="game-tabs" role="tablist" aria-label="Your card">
        {tabs.map((entry) => (
          <button key={entry.id} role="tab" type="button" aria-selected={tab === entry.id} className={tab === entry.id ? "active" : undefined} onClick={() => setTab(entry.id)}>
            {entry.label}
          </button>
        ))}
      </nav>

      <div role="tabpanel">
        {tab === "public" && (
          <section className="game-panel">
            <p className="eyebrow">What everyone knows about you</p>
            <p className="game-bio">{card.publicBio}</p>
            <p className="game-note">Anyone may read this. It is how the room will know who you are.</p>
          </section>
        )}
        {tab === "background" && (
          <section className="game-panel">
            <p className="eyebrow">Your history · for your eyes</p>
            <p>{card.background.history}</p>
            <h4>The people you know</h4>
            <ul>{card.background.people.map((line) => <li key={line}>{line}</li>)}</ul>
            <h4>What to wear or bring</h4>
            <p>{card.background.wardrobe}</p>
            <p className="game-note">Your Private tab, with your secrets and errands, unlocks when the doors open on the night.</p>
          </section>
        )}
        {tab === "private" && <PrivateTab card={card} secretsReleased={secretsReleased} open={open} saved={saved} onSaved={onSaved} />}
        {tab === "answers" && (
          <AnswersTab
            secretsReleased={secretsReleased}
            open={open}
            questions={data.questions}
            directory={data.directory}
            me={card.id}
            survivor={Boolean(card.private.survivor)}
            saved={saved}
            onSaved={onSaved}
          />
        )}
        {tab === "results" && <ResultsTab results={results} />}
      </div>
    </div>
  );
}
