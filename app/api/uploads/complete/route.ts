import { canEditTests } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headObject } from "@/lib/r2";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!canEditTests(user)) return NextResponse.json({ error: "Editing access required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const testId = typeof body?.testId === "string" ? body.testId : "";
  const key = typeof body?.key === "string" ? body.key : "";
  const originalName = typeof body?.originalName === "string" ? body.originalName.slice(0, 240) : "evidence";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = Number(body?.size || 0);

  if (!testId || !key.startsWith(`tests/${testId}/`) || !ALLOWED.has(contentType) || !Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid upload metadata." }, { status: 400 });
  }

  const test = await prisma.test.findUnique({ where: { id: testId }, select: { id: true } });
  if (!test) return NextResponse.json({ error: "Test not found." }, { status: 404 });

  try {
    const object = await headObject(key);
    const actualSize = Number(object.ContentLength || 0);
    const actualType = object.ContentType || contentType;
    if (!actualSize || actualSize > MAX_BYTES || actualSize !== size || actualType !== contentType) {
      return NextResponse.json({ error: "Uploaded file verification failed." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Uploaded file could not be verified." }, { status: 400 });
  }

  const attachment = await prisma.testAttachment.create({
    data: { testId, objectKey: key, originalName, mimeType: contentType, fileSize: size },
    select: { id: true },
  });
  return NextResponse.json({ attachmentId: attachment.id }, { status: 201 });
}
