import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "physicalAccomplishmentDecimal" DECIMAL(5,2)`;
    // Old deployments can still write integers. Clear a stale decimal if they change progress.
    await tx.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION qah_sync_legacy_progress() RETURNS trigger AS $$
      BEGIN
        IF NEW."physicalAccomplishment" IS DISTINCT FROM OLD."physicalAccomplishment"
          AND NEW."physicalAccomplishmentDecimal" IS NOT DISTINCT FROM OLD."physicalAccomplishmentDecimal" THEN
          NEW."physicalAccomplishmentDecimal" := NULL;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await tx.$executeRawUnsafe(`DROP TRIGGER IF EXISTS qah_sync_legacy_progress ON "Project"`);
    await tx.$executeRawUnsafe(`
      CREATE TRIGGER qah_sync_legacy_progress BEFORE UPDATE ON "Project"
      FOR EACH ROW EXECUTE FUNCTION qah_sync_legacy_progress()
    `);
  });
  console.log("Decimal progress storage is ready. Existing progress values are preserved.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
