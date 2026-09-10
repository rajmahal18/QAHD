/**
 * QAH v0.5 safe database upgrade.
 *
 * What it does:
 * - Adds account-state fields with safe defaults.
 * - Adds Date Sampled / Date Submitted / Date Tested columns.
 * - Backfills Date Tested from the legacy Date Conducted value so existing tests are preserved.
 * - Creates the three new user accounts only when their usernames do not already exist.
 *
 * What it never does:
 * - No deletes.
 * - No truncation/reset.
 * - No updates to existing users.
 * - No password reset of existing users.
 * - No changes to existing projects, items, attachments, or test results/remarks.
 */

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const accounts = [
  { displayName: "Janiza Maraki", username: "janizamaraki" },
  { displayName: "Mahadiya Madeed", username: "mahadiyamadeed" },
  { displayName: "LMTS", username: "lmts" },
] as const;

function temporaryPassword(length = 14) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(crypto.randomBytes(length), (byte) => alphabet[byte % alphabet.length]).join("");
}

async function addColumns() {
  const statements = [
    'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true',
    'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false',
    'ALTER TABLE "Test" ADD COLUMN IF NOT EXISTS "dateSampled" TIMESTAMP(3)',
    'ALTER TABLE "Test" ADD COLUMN IF NOT EXISTS "dateSubmitted" TIMESTAMP(3)',
    'ALTER TABLE "Test" ADD COLUMN IF NOT EXISTS "dateTested" TIMESTAMP(3)',
    'CREATE INDEX IF NOT EXISTS "Test_itemId_dateTested_idx" ON "Test"("itemId", "dateTested")',
  ];

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

async function backfillLegacyDates() {
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE "Test"
    SET "dateTested" = "conductedAt"
    WHERE "dateTested" IS NULL
      AND "dateSampled" IS NULL
      AND "dateSubmitted" IS NULL
  `);
  return Number(updated || 0);
}

async function createMissingAccounts() {
  const created: Array<{ displayName: string; username: string; password: string }> = [];
  const skipped: string[] = [];

  for (const account of accounts) {
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "User"
      WHERE LOWER("username") = ${account.username}
      LIMIT 1
    `;

    if (existing.length) {
      skipped.push(account.username);
      continue;
    }

    const id = `c${crypto.randomBytes(12).toString("hex")}`;
    const password = temporaryPassword();
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$executeRaw`
      INSERT INTO "User" (
        "id", "username", "displayName", "passwordHash", "role",
        "isActive", "mustChangePassword", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${account.username}, ${account.displayName}, ${passwordHash}, 'USER',
        true, true, NOW(), NOW()
      )
    `;

    created.push({ ...account, password });
  }

  return { created, skipped };
}

async function main() {
  console.log("QAH v0.5 safe database upgrade\n");
  await addColumns();
  console.log("✓ Required columns/index are present.");

  const backfilled = await backfillLegacyDates();
  console.log(`✓ Preserved legacy test dates: ${backfilled} record(s) backfilled to Date Tested.`);

  const { created, skipped } = await createMissingAccounts();
  console.log(`✓ New accounts created: ${created.length}`);
  if (skipped.length) console.log(`✓ Existing usernames skipped unchanged: ${skipped.join(", ")}`);

  if (created.length) {
    console.log("\nTEMPORARY PASSWORDS — copy these now. Users will be asked to change them after login:");
    for (const account of created) {
      console.log(`  ${account.displayName} | ${account.username} | ${account.password}`);
    }
  } else {
    console.log("\nNo new passwords generated because all three accounts already exist.");
  }

  console.log("\nDone. Existing users and all unrelated database data were left untouched.");
}

main()
  .catch((error) => {
    console.error("Upgrade failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
