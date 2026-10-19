import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runValidation } from "./validate";

describe("the game bible", () => {
  const report = runValidation();
  for (const check of report.checks) {
    it(check.name, () => {
      assert.deepEqual(check.details, []);
    });
  }
  it("passes everything", () => {
    assert.equal(report.ok, true);
  });
});
