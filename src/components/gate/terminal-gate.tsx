"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

const boot = [
  "SUFFOLK COUNTY RECORDS · DIGITIZATION TERMINAL v0.245",
  "connecting to vault ......................... ok",
  "",
  `FILE ${siteConfig.fileNumber} · “THE BLACK TOAD”`,
  `IMPOUNDED     ${siteConfig.impoundedOn.toUpperCase()}  by order of the Superior Court`,
  `SEAL EXPIRED  ${siteConfig.unsealedOn.toUpperCase()}  00:00`,
  "STATUS        UNSEALED · RESTORATION INCOMPLETE",
  "",
  "10 exhibits recovered. Scans damaged.",
  "Exhibits will be released as restoration proceeds.",
  "",
  "Type anything and press ENTER to open the file.",
];

/**
 * The front door. Whatever is typed opens the file: the point is the feeling of logging in
 * to something you shouldn't, not a password. When siteConfig.extrasOpen is true this is
 * also where hidden commands will live (docs/extras.md).
 */
export function TerminalGate() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [shown, setShown] = useState(0);
  const [value, setValue] = useState("");
  const [after, setAfter] = useState<string[] | null>(null);

  useEffect(() => {
    // With reduced motion the whole screen appears at once (on the first tick).
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let line = 0;
    const timer = window.setInterval(() => {
      line = reduce ? boot.length : line + 1;
      setShown(line);
      if (line >= boot.length) window.clearInterval(timer);
    }, reduce ? 0 : 140);
    return () => window.clearInterval(timer);
  }, []);

  const ready = shown >= boot.length;

  useEffect(() => {
    if (ready) input.current?.focus();
  }, [ready]);

  function enter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (after) return;
    const typed = value.trim().slice(0, 60);
    setAfter([
      `> ${typed}`,
      typed ? `access logged: “${typed}”` : "access logged: (no name given)",
      `opening file ${siteConfig.fileNumber} ...`,
      "look before you leap.",
    ]);
    document.cookie = `${siteConfig.enteredCookie}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.setTimeout(() => router.push("/file"), 1100);
  }

  return (
    <div className="gate" onClick={() => input.current?.focus()}>
      <div className="gate-screen" role="log" aria-live="polite">
        {boot.slice(0, shown).map((line, index) => (
          <p key={index}>{line || " "}</p>
        ))}
        {ready && !after && (
          <form onSubmit={enter} className="gate-prompt">
            <label htmlFor="gate-input" className="gate-caret">
              &gt;
            </label>
            <input
              id="gate-input"
              ref={input}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Type anything and press Enter to open the file"
            />
            <button type="submit" className="gate-enter">
              ENTER
            </button>
          </form>
        )}
        {after?.map((line, index) => (
          <p key={`after-${index}`} className={index === 0 ? "gate-echo" : undefined}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
