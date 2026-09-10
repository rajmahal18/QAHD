import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  const displayName = process.env.SEED_ADMIN_NAME || "QAH Administrator";

  if (!password || password.length < 10) {
    throw new Error("Set SEED_ADMIN_PASSWORD to at least 10 characters before running db:seed.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: { displayName, passwordHash, role: UserRole.ADMIN },
    create: { username, displayName, passwordHash, role: UserRole.ADMIN },
  });

  console.log(`Admin user ready: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
