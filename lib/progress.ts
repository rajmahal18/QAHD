import { Prisma } from "@prisma/client";

export class ProgressValidationError extends Error {}

export function parseProgress(raw: FormDataEntryValue | null) {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(text)) {
    throw new ProgressValidationError("Physical accomplishment must be a number from 0 to 100 with up to two decimal places.");
  }
  const value = new Prisma.Decimal(text);
  if (value.greaterThan(100)) throw new ProgressValidationError("Physical accomplishment must be 0 to 100.");
  return value;
}

export function projectProgress(project: {
  physicalAccomplishment: number;
  physicalAccomplishmentDecimal: Prisma.Decimal | null;
}) {
  return project.physicalAccomplishmentDecimal?.toNumber() ?? project.physicalAccomplishment;
}
