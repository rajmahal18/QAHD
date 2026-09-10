import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@prisma/client";
import { parseProgress, projectProgress, ProgressValidationError } from "./progress";

test("progress preserves decimals and accepts range boundaries", () => {
  for (const [input, expected] of [["0", "0"], ["100", "100"], ["42.75", "42.75"], ["99.99", "99.99"], ["0.01", "0.01"], [" 12.50 ", "12.5"], [".25", "0.25"]]) {
    assert.equal(parseProgress(input).toString(), expected);
  }
});

test("invalid values are rejected instead of rounded or silently defaulted", () => {
  for (const input of [null, "", " ", "-0.01", "100.01", "1.234", "NaN", "Infinity", "abc", "0x10", "1e2"]) {
    assert.throws(() => parseProgress(input), ProgressValidationError);
  }
});

test("legacy progress and explicit decimal zero display correctly", () => {
  assert.equal(projectProgress({ physicalAccomplishment: 42, physicalAccomplishmentDecimal: null }), 42);
  assert.equal(projectProgress({ physicalAccomplishment: 43, physicalAccomplishmentDecimal: new Prisma.Decimal("42.75") }), 42.75);
  assert.equal(projectProgress({ physicalAccomplishment: 20, physicalAccomplishmentDecimal: new Prisma.Decimal(0) }), 0);
});
