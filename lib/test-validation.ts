import { TestResult } from "@prisma/client";

export function parseTestInput(body: any) {
  const itemId = typeof body?.itemId === "string" ? body.itemId : "";
  const testName = typeof body?.testName === "string" ? body.testName.trim() : "";
  const remarks = typeof body?.remarks === "string" ? body.remarks.trim() : "";
  const result = String(body?.result || "PENDING") as TestResult;
  const conductedRaw = typeof body?.conductedAt === "string" ? body.conductedAt : "";

  if (!testName || !conductedRaw) throw new Error("Test name and date are required.");
  if (testName.length > 160 || remarks.length > 2000) throw new Error("One or more fields are too long.");
  if (!Object.values(TestResult).includes(result)) throw new Error("Invalid result.");

  const conductedAt = new Date(`${conductedRaw}T12:00:00+08:00`);
  if (Number.isNaN(conductedAt.getTime())) throw new Error("Invalid test date.");

  return { itemId, testName, remarks: remarks || null, result, conductedAt };
}
