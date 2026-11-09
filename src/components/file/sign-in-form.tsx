"use client";

import { FormEvent, useState } from "react";

export function SignInForm() {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setState("busy");
    setError(null);
    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "The link could not be sent.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("The link could not be sent. Try again in a minute.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <p className="notice" role="status">
        If that email is on the file, a link is on its way. It works once and expires in 30 minutes.
      </p>
    );
  }

  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      {error && (
        <p className="finding-message" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button" disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Send the link"}
      </button>
    </form>
  );
}
