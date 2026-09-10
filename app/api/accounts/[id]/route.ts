import { roleData, accessRole } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function validUsername(value: string) {
  return /^[a-z0-9._-]{3,50}$/.test(value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (admin.role !== UserRole.ADMIN) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  // A pre-role-update browser tab only knows ADMIN/USER. Do not let its stale
  // USER value overwrite a Viewer or Editor assignment.
  if (body?.role === "USER" && existing.role === "USER" && existing.accessLevel != null) {
    return NextResponse.json({ error: "Role settings have changed. Reload this page before saving." }, { status: 409 });
  }
  const permissions = roleData(body?.role ?? accessRole(existing));
  const isActive = body?.isActive ?? existing.isActive;

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
  }

  if (!displayName || displayName.length > 100 || !validUsername(username)) {
    return NextResponse.json({ error: "Enter a valid name and username." }, { status: 400 });
  }
  if (!permissions) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (id === admin.id && (accessRole(permissions) !== accessRole(existing) || !isActive)) {
    return NextResponse.json({ error: "You cannot deactivate or change the role of the account you are currently using." }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { displayName, username, ...permissions, isActive },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That username is already in use." }, { status: 409 });
    }
    throw error;
  }
}
