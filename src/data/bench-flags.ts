/**
 * Server-only, like src/data/ctf-flags.ts. A bench flag is a receipt: it is issued
 * only after src/lib/bench/graders.ts has confirmed the work, and the solve is
 * already recorded by then. Never import this from a "use client" module.
 */
export const benchFlags: Record<string, string> = {
  "register-recovery": "VEIL{PAGE_RESTORED_BY_REVERT}",
  "two-clerks-one-register": "VEIL{REGISTERS_RECONCILED}",
  "unwitnessed-page": "VEIL{COUNTERSIGNED}",
  "standard-crate": "VEIL{SEALED_IN_A_STANDARD_CRATE}",
  "nothing-leaves-unproved": "VEIL{NOTHING_LEAVES_UNPROVED}",
  "how-much-silence": "VEIL{BUDGET_SPENT_FREEZE_ORDERED}",
  "stewards-keys": "VEIL{ONLY_THE_KEYS_THE_ROUND_NEEDS}",
  "coat-check-numbers": "VEIL{NUMBERS_NO_LONGER_ENOUGH}",
  "sealed-pass": "VEIL{PASS_REISSUED}",
  "one-fact-written-once": "VEIL{ONE_FACT_WRITTEN_ONCE}",
  "subscription-wire": "VEIL{IN_THE_ORDER_RECORDED}",
  "before-you-touch-it": "VEIL{PINNED_BEFORE_TOUCHED}",
};
