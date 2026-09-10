import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function validUsername(value: string) {
  return /^[a-z0-9._-]{3,50}$/.test(value);
}

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (admin.role !== UserRole.ADMIN) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = String(body?.role || UserRole.USER) as UserRole;

  if (!displayName || !username || !password) {
    return NextResponse.json({ error: "Name, username, and temporary password are required." }, { status: 400 });
  }
  if (displayName.length > 100 || !validUsername(username)) {
    return NextResponse.json({ error: "Use a simple username with letters, numbers, dot, dash, or underscore." }, { status: 400 });
  }
  if (password.length < 10 || password.length > 256) {
    return NextResponse.json({ error: "Temporary password must be 10 to 256 characters." }, { status: 400 });
  }
  if (!Object.values(UserRole).includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: {
        displayName,
        username,
        passwordHash,
        role,
        isActive: true,
        mustChangePassword: true,
      },
      select: { id: true },
    });
    return NextResponse.json({ userId: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That username is already in use." }, { status: 409 });
    }
    throw error;
  }
}
