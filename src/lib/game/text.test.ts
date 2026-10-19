import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { containsTerm, matchesAny, matchesPattern, normalize, normalizeCode, parseClock, parseMoney } from "./text";

describe("normalize", () => {
  it("lowercases, strips accents and punctuation, and drops possessives", () => {
    assert.equal(normalize("  Kit’s  “Keeper” — Kessler!  "), "kit keeper kessler");
    assert.equal(normalize("Café Müller"), "cafe muller");
  });
  it("keeps clock times and dollar signs intact", () => {
    assert.equal(normalize("at 8:30 for $140"), "at 8:30 for $140");
  });
});

describe("containsTerm", () => {
  it("matches whole words and phrases in order", () => {
    assert.ok(containsTerm("It was half past eight sharp", "half past eight"));
    assert.ok(!containsTerm("past half eight", "half past eight"));
  });
  it("does not match inside other words", () => {
    assert.ok(!containsTerm("the mastermind", "master"));
    assert.ok(!containsTerm("hearsay", "hearse"));
  });
  it("folds plurals and verb endings", () => {
    assert.ok(containsTerm("the markers", "marker"));
    assert.ok(containsTerm("he forged them", "forge"));
    assert.ok(containsTerm("forging orders", "forge"));
  });
  it("forgives one typo on long words only", () => {
    assert.ok(containsTerm("pumpernikel", "pumpernickel"));
    assert.ok(containsTerm("strychnnine", "strychnine"));
    assert.ok(!containsTerm("sock", "rock"));
    assert.ok(!containsTerm("dolly", "holly"));
  });
  it("does not let a short common word pass for a longer answer word", () => {
    assert.ok(!containsTerm("lifted note for note from a songbook", "forged"));
    assert.ok(!containsTerm("from the cellar", "framed"));
    assert.ok(!containsTerm("count invisible bills", "killed"));
    assert.ok(!containsTerm("the second door", "second doorman"));
  });
  it("handles possessives and hyphens", () => {
    assert.ok(containsTerm("Dutton's Pawn", "dutton"));
    assert.ok(containsTerm("the co-pilot died", "co-pilot"));
  });
});

describe("matchesPattern", () => {
  it("needs every group and any term within a group", () => {
    const pattern = [["strychnine", "nux vomica"], ["rye", "whiskey"]];
    assert.ok(matchesPattern("nux vomica in the whiskey", pattern));
    assert.ok(!matchesPattern("strychnine in the gin", pattern));
    assert.ok(!matchesPattern("", pattern));
  });
  it("never matches an empty pattern", () => {
    assert.ok(!matchesPattern("anything", []));
    assert.ok(!matchesAny("anything", []));
  });
});

describe("codes, money and clocks", () => {
  it("normalizes codes", () => {
    assert.equal(normalizeCode("ew-wxp "), "EWWXP");
    assert.equal(normalizeCode("EWWXP"), normalizeCode("e w w x p"));
  });
  it("reads money", () => {
    assert.equal(parseMoney("$140"), 140);
    assert.equal(parseMoney("about 1,250 dollars"), 1250);
    assert.equal(parseMoney("lots"), null);
  });
  it("reads evening clock times", () => {
    assert.equal(parseClock("8:46"), 20 * 60 + 46);
    assert.equal(parseClock("8:46 pm"), 20 * 60 + 46);
    assert.equal(parseClock("20:46"), 20 * 60 + 46);
    assert.equal(parseClock("8.46pm"), 20 * 60 + 46);
    assert.equal(parseClock("12:05 am"), 5);
    assert.equal(parseClock("nine ish"), null);
    assert.equal(parseClock("8:75"), null);
  });
});
