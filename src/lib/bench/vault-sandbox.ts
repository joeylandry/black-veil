/**
 * Server-only fixture for RST-08: a deliberately vulnerable copy of the vault
 * service, isolated from every real table. It holds invented records only, and the
 * flaw it demonstrates — an object reference with no ownership check — is the lesson.
 * The guest's session here is a fixture identity, not their real one.
 */

type VaultRecord = {
  id: number;
  drawer: string;
  classification: "open" | "sealed" | "restricted";
  ownerId: string;
  summary: string;
  reference: string;
};

export const VAULT_SESSION = { guestId: "g-011", name: "A. Thayer", entitlements: ["vault:read:own"] };
/** The one record the session is not entitled to. Reported by reference, never guessable. */
export const RESTRICTED_REFERENCE = "RSV-7731-CASTELLO";

const owners = ["g-004", "g-011", "g-019", "g-027", "g-033"];

const VAULT: VaultRecord[] = Array.from({ length: 20 }, (_, index) => {
  const id = 101 + index;
  const ownerId = id === 104 || id === 105 || id === 109 ? "g-011" : owners[index % owners.length];
  return {
    id,
    drawer: `drawer-${String(((index % 6) + 1)).padStart(2, "0")}`,
    classification: id === 117 ? "restricted" : id % 4 === 0 ? "sealed" : "open",
    ownerId: id === 117 ? "g-027" : ownerId,
    summary:
      id === 117
        ? "Standing reservation held against the 1926 guest list; party undisclosed."
        : `Transcription slip ${id} - routine catalogue work.`,
    reference: id === 117 ? RESTRICTED_REFERENCE : `RSV-${1000 + id * 7}-CATALOGUE`,
  };
});

export function runVaultCommand(input: string): string[] {
  const command = input.trim();

  if (command === "help") {
    return [
      "whoami                       show the session this bench holds",
      "GET /vault/index             list every record id the vault holds",
      "GET /vault/records?owner=me  list records owned by this session",
      "GET /vault/records/<id>      read one record",
    ];
  }

  if (command === "whoami") {
    return JSON.stringify(VAULT_SESSION, null, 2).split("\n");
  }

  const normalised = command.replace(/^GET\s+/i, "");

  if (normalised === "/vault/index") {
    return [
      JSON.stringify({ count: VAULT.length, ids: VAULT.map((record) => record.id) }, null, 2),
      "",
      "note: ids are issued in sequence by the cataloguing desk.",
    ].join("\n").split("\n");
  }

  if (/^\/vault\/records\?owner=me$/i.test(normalised)) {
    const mine = VAULT.filter((record) => record.ownerId === VAULT_SESSION.guestId);
    return JSON.stringify(mine, null, 2).split("\n");
  }

  const byId = normalised.match(/^\/vault\/records\/(\d+)$/);
  if (byId) {
    const record = VAULT.find((item) => item.id === Number(byId[1]));
    if (!record) {
      return ["404 Not Found", JSON.stringify({ error: "Not found" })];
    }
    // No ownership check. This is the defect under review.
    return ["200 OK", ...JSON.stringify({ record }, null, 2).split("\n")];
  }

  return [`${command}: not a route this sandbox serves. Type \`help\`.`];
}

/** True when the history actually read the restricted record out of the sandbox. */
export function readRestrictedRecord(history: string[]) {
  return history.some((command) => /\/vault\/records\/117\b/.test(command));
}
