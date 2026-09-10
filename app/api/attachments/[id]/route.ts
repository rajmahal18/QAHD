import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createViewUrl, deleteObject } from "@/lib/r2";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);

  const { id } = await params;
  const attachment = await prisma.testAttachment.findUnique({ where: { id }, select: { objectKey: true } });
  if (!attachment) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });

  try {
    const url = await createViewUrl(attachment.objectKey);
    return NextResponse.redirect(url, 302);
  } catch {
    return NextResponse.json({ error: "File storage is not configured." }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const attachment = await prisma.testAttachment.findUnique({ where: { id }, select: { id: true, objectKey: true } });
  if (!attachment) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });

  try {
    await deleteObject(attachment.objectKey);
  } catch {
    return NextResponse.json({ error: "Could not remove the stored file." }, { status: 503 });
  }

  await prisma.testAttachment.delete({ where: { id: attachment.id } });
  return NextResponse.json({ ok: true });
}
