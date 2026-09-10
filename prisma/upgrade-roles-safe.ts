import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accessLevel" TEXT`;
  console.log("Role storage is ready. Existing admins and users retain their current access.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
