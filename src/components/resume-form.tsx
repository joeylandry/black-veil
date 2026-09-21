"use client";

import { FormEvent, useEffect, useState } from "react";

export function ResumeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (code === "invalid-token") setError("That link has expired or was already used. Request a new one below.");
    else if (code === "missing-token") setError("That link was incomplete. Request a new one below.");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        // A failure with no JSON body is an unhandled server error; carry the status
        // through so a guest reporting this gives the host something to go on.
        throw new Error(
          typeof failure?.error === "string" && failure.error
            ? failure.error
            : `Something went wrong sending that link (server error ${response.status}).`,
        );
      }
      setStatus("sent");
    } catch (caught) {
      setStatus("idle");
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Something went wrong sending that link. Try again in a moment.",
      );
    }
  }

  if (status === "sent") {
    return (
      <section className="invitation-locked">
        <p className="eyebrow">Check your correspondence</p>
        <h1>A sign-in link is on its way.</h1>
        <p>If {email} is on file, a private link back to your guest register, Black Rose standing, and character will arrive shortly. It expires in 30 minutes and works once.</p>
      </section>
    );
  }

  return (
    <form className="ledger-form" onSubmit={submit} noValidate>
      <header>
        <p className="eyebrow">Returning guest</p>
        <h1>Resume your register.</h1>
        <p>On a new device, or cleared this one? Enter the email you RSVP&rsquo;d with and we&rsquo;ll send a private link back in.</p>
      </header>
      <div className="ledger-fields">
        <label>
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
      </div>
      {error && <small className="field-error" role="alert">{error}</small>}
      <button className="ledger-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send my sign-in link"}
      </button>
    </form>
  );
}
