import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseGuestName, editDistance, findGuestForRecovery, nameClose, nameStrong, normalizeEmail, tooManyAttempts, type RecoverCandidate } from "@/lib/auth/recover";

/** The register as it really is: names and emails from the staff screenshots. */
const register: RecoverCandidate[] = [
  { id: "adam", fullName: "Adam Ouldsfiya", email: "ouldsfiyaadam@gmail.com" },
  { id: "ananya", fullName: "Ananya", email: "akoduru@umass.edu" },
  { id: "angelos", fullName: "Angelos Boules", email: "angelos.boules24@gmail.com" },
  { id: "anika", fullName: "Anika Mahns", email: "anika.mahns@gmail.com" },
  { id: "anthony", fullName: "Anthony Tse Huang", email: "anthony@ecgraphic.com" },
  { id: "arjun", fullName: "Arjun V. Bhat", email: "arjunbhat0630@gmail.com" },
  { id: "diwakar", fullName: "Diwakar Sandhu", email: "dsandhu8567@gmail.com" },
  { id: "emre", fullName: "Emre Sunar", email: "emresunar1201@gmail.com" },
  { id: "eric", fullName: "Eric Li", email: "ericlibeibei@gmail.com" },
  { id: "erika", fullName: "Erika Lam", email: "erikaklam@gmail.com" },
  { id: "joel", fullName: "Joel Indipiginja", email: "jindipiginja@gmail.com" },
  { id: "josh", fullName: "Josh Kaminsky", email: "josh.kaminsky0@gmail.com" },
  { id: "krrish", fullName: "Krrish Verma", email: "krrish583@gmail.com" },
  { id: "leon", fullName: "Leon", email: "leon332157@gmail.com" },
  { id: "luke", fullName: "Luke Sheldon", email: "lukesheldon2004@gmail.com" },
  { id: "mihir", fullName: "Mihir", email: "mihir.nagarkatti@gmail.com" },
  { id: "molly", fullName: "Molly Daniel", email: "mollyjodaniel@gmail.com" },
  { id: "rebecca", fullName: "Rebecca Chou", email: "rstchou@gmail.com" },
  { id: "rhea", fullName: "Rhea Mallya", email: "rhea.mallya@gmail.com" },
  { id: "sidd", fullName: "Sidd Arvind", email: "siddarvind04@gmail.com" },
  { id: "silas", fullName: "Silas Palmer", email: "silastpalmer@gmail.com" },
  { id: "theodor", fullName: "Theodor Farag", email: "theodorfarag@gmail.com" },
  { id: "tiffany", fullName: "Tiffany Liu", email: "tmliu@bu.edu" },
  { id: "victor", fullName: "Victor Liu", email: "victor.liu@example.com" },
];
const who = (name: string, email: string) => findGuestForRecovery(register, name, email)?.id ?? null;

describe("emails", () => {
  it("ignores case, spaces, and Gmail dots and +tags", () => {
    assert.equal(normalizeEmail("  Eric.Li.Beibei+party@GMAIL.com "), "ericlibeibei@gmail.com");
    assert.equal(normalizeEmail("a.b@googlemail.com"), "ab@gmail.com");
    assert.equal(normalizeEmail("a.b@umass.edu"), "a.b@umass.edu", "dots matter outside Gmail");
  });
  it("measures typos", () => {
    assert.equal(editDistance("kitten", "sitting"), 3);
    assert.equal(editDistance("same", "same"), 0);
    assert.equal(editDistance("eirc", "eric"), 1, "a swap of neighbours is one slip");
  });
});

describe("names", () => {
  it("forgive a misspelling, a nickname, or just a first or last name", () => {
    assert.ok(nameClose("Eirc Li", "Eric Li"));
    assert.ok(nameClose("Erik Li", "Eric Li"));
    assert.ok(nameClose("Joshua Kaminski", "Josh Kaminsky"));
    assert.ok(nameClose("Theo Farag", "Theodor Farag"));
    assert.ok(nameClose("Ananya Koduru", "Ananya"));
    assert.ok(nameClose("sunar", "Emre Sunar"));
    assert.ok(nameClose("Siddarth Arvind", "Sidd Arvind"));
  });
  it("do not match a different person", () => {
    assert.ok(!nameClose("Victor Chen", "Eric Li"));
    assert.ok(!nameClose("Tom Smith", "Tiffany Liu"));
  });
  it("need both first and last names to line up for a strong match", () => {
    assert.ok(nameStrong("Eric Li", "Eric Li"));
    assert.ok(nameStrong("Eirc Li", "Eric Li"));
    assert.ok(nameStrong("Arjun Bhat", "Arjun V. Bhat"));
    assert.ok(nameStrong("Ananya Koduru", "Ananya"), "extra words typed are fine");
    assert.ok(!nameStrong("Eric Chen", "Eric Li"), "the last name is wrong");
    assert.ok(!nameStrong("Eric", "Eric Li"), "a first name alone is not enough");
  });
});

describe("finding a guest again", () => {
  it("works with the exact name and email", () => {
    assert.equal(who("Eric Li", "ericlibeibei@gmail.com"), "eric");
    assert.equal(who("Tiffany Liu", "tmliu@bu.edu"), "tiffany");
  });
  it("forgives a misspelled name and a differently written email", () => {
    assert.equal(who("Eirc Li", "ERICLIBEIBEI@gmail.com"), "eric");
    assert.equal(who("Josh Kaminski", "josh.kaminsky0@gmail.com"), "josh");
    assert.equal(who("Joshua Kaminsky", "joshkaminsky0@gmail.com"), "josh", "Gmail dots do not matter");
    assert.equal(who("Mihir Nagarkatti", "mihir.nagarkatti@gmail.com"), "mihir", "registered with a first name only");
    assert.equal(who("Ananya Koduru", "akoduru@umass.edu"), "ananya");
    assert.equal(who("Leon Ge", "leon332157@gmail.com"), "leon");
  });
  it("forgives a typo in the email when the name is right", () => {
    assert.equal(who("Rebecca Chou", "rstchou@gmial.com"), "rebecca");
    assert.equal(who("Silas Palmer", "silastpalmer@gmail.co"), "silas");
    assert.equal(who("Eric Li", "ericlibeibe@gmail.com"), "eric");
  });
  it("does not let a mistyped email through on a first name alone", () => {
    assert.equal(who("Eric", "ericlibeibe@gmail.com"), null);
    assert.equal(who("Eric", "ericlibeibei@gmail.com"), "eric", "but an exact email only needs a loose name");
  });
  it("refuses a name that does not belong to that email", () => {
    assert.equal(who("Victor Chen", "ericlibeibei@gmail.com"), null);
    assert.equal(who("Tom Smith", "tmliu@bu.edu"), null);
  });
  it("refuses an email nobody registered", () => {
    assert.equal(who("Eric Li", "someone.else@gmail.com"), null);
    assert.equal(who("Eric Li", "totally@different.org"), null);
    assert.equal(who("Eric Li", "not an email"), null);
    assert.equal(who("", "ericlibeibei@gmail.com"), null);
  });
  it("refuses a near-miss email when two guests are equally close", () => {
    const twins: RecoverCandidate[] = [
      { id: "a", fullName: "Sam Price", email: "sam1@x.com" },
      { id: "b", fullName: "Sam Price", email: "sam2@x.com" },
    ];
    assert.equal(findGuestForRecovery(twins, "Sam Price", "sam3@x.com"), null);
    assert.equal(findGuestForRecovery(twins, "Sam Price", "sam1@x.com")?.id, "a");
  });
  it("never confuses two guests with the same surname", () => {
    assert.equal(who("Victor Liu", "victor.liu@example.com"), "victor");
    assert.equal(who("Tiffany Liu", "victor.liu@example.com"), "victor", "the exact email wins and Liu matches, as the same surname");
    assert.equal(who("Eric Li", "victor.liu@example.com"), null);
  });
});

describe("keeping a registered name", () => {
  it("keeps the registered name when the new one is a near miss", () => {
    assert.equal(chooseGuestName("Eric Li", "Eric Lee"), "Eric Li");
    assert.equal(chooseGuestName("Josh Kaminsky", "Joshua Kaminsky"), "Josh Kaminsky");
  });
  it("takes a genuinely different name, and a first one", () => {
    assert.equal(chooseGuestName("Eric Li", "Tom Smith"), "Tom Smith");
    assert.equal(chooseGuestName(undefined, "New Guest"), "New Guest");
  });
});

describe("guess limit", () => {
  it("cuts off a burst of tries, then lets them back in", () => {
    const start = 1_000_000;
    for (let i = 0; i < 6; i += 1) assert.equal(tooManyAttempts("pair:1.2.3.4|a@b.c", start + i, 6), false);
    assert.equal(tooManyAttempts("pair:1.2.3.4|a@b.c", start + 9, 6), true);
    assert.equal(tooManyAttempts("pair:1.2.3.4|other@b.c", start + 9, 6), false, "another email from the same wifi is unaffected");
    assert.equal(tooManyAttempts("pair:1.2.3.4|a@b.c", start + 11 * 60 * 1000, 6), false, "the window passes");
  });
  it("lets a whole party share one wifi address", () => {
    const start = 2_000_000;
    for (let guest = 0; guest < 60; guest += 1) assert.equal(tooManyAttempts("address:9.9.9.9", start + guest, 150), false);
  });
});
