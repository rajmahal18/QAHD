import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
  }
  if (username.length > 100 || password.length > 256) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "This account is inactive. Contact the administrator." }, { status: 403 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword });
}
