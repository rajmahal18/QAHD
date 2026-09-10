import { TestResult } from "@prisma/client";

function parseDate(value: unknown, label: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error(`Invalid ${label}.`);
  const date = new Date(`${raw}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${label}.`);
  return date;
}

export function parseTestInput(body: any) {
  const itemId = typeof body?.itemId === "string" ? body.itemId : "";
  const testName = typeof body?.testName === "string" ? body.testName.trim() : "";
  const remarks = typeof body?.remarks === "string" ? body.remarks.trim() : "";
  const result = String(body?.result || "PENDING") as TestResult;

  const dateSampled = parseDate(body?.dateSampled, "Date Sampled");
  const dateSubmitted = parseDate(body?.dateSubmitted, "Date Submitted");
  const dateTested = parseDate(body?.dateTested, "Date Tested");

  if (!testName) throw new Error("Test name is required.");
  if (!dateSampled && !dateSubmitted && !dateTested) throw new Error("Enter at least one test date.");
  if (testName.length > 160 || remarks.length > 2000) throw new Error("One or more fields are too long.");
  if (!Object.values(TestResult).includes(result)) throw new Error("Invalid result.");
  if (result !== TestResult.PENDING && !dateTested) {
    throw new Error("Date Tested is required when the result is Passed or Failed.");
  }

  // Keep conductedAt as a non-destructive canonical activity date for existing
  // sorting/reporting code while the UI uses the three explicit dates.
  const conductedAt = dateTested || dateSubmitted || dateSampled!;

  return {
    itemId,
    testName,
    remarks: remarks || null,
    result,
    conductedAt,
    dateSampled,
    dateSubmitted,
    dateTested,
  };
}
