import { canEditTests } from "@/lib/permissions";
import crypto from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUploadUrl } from "@/lib/r2";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const EXTENSIONS: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf" };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!canEditTests(user)) return NextResponse.json({ error: "Editing access required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const testId = typeof body?.testId === "string" ? body.testId : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = Number(body?.size || 0);

  if (!testId || !ALLOWED.has(contentType) || !Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid file. Use JPG, PNG, WebP, or PDF up to 10 MB." }, { status: 400 });
  }

  const test = await prisma.test.findUnique({ where: { id: testId }, select: { id: true, _count: { select: { attachments: true } } } });
  if (!test) return NextResponse.json({ error: "Test not found." }, { status: 404 });
  if (test._count.attachments >= 20) return NextResponse.json({ error: "This test already has the maximum number of attachments." }, { status: 400 });

  const safeExt = EXTENSIONS[contentType] || path.extname(String(body?.fileName || "")).toLowerCase();
  const key = `tests/${testId}/${crypto.randomUUID()}${safeExt}`;

  try {
    const uploadUrl = await createUploadUrl(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  } catch {
    return NextResponse.json({ error: "File storage is not configured yet." }, { status: 503 });
  }
}
