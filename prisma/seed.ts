import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.SEED_ADMIN_USERNAME || "admin").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const displayName = process.env.SEED_ADMIN_NAME || "QAH Administrator";

  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (existing) {
    console.log(`Admin already exists and was left unchanged: ${username}`);
    return;
  }

  if (!password || password.length < 10) {
    throw new Error("Set SEED_ADMIN_PASSWORD to at least 10 characters before running db:seed.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      username,
      displayName,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log(`Admin user created: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
