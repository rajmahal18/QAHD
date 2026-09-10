import { canEditTests } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTestInput } from "@/lib/test-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!canEditTests(user)) return NextResponse.json({ error: "Editing access required." }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.test.findUnique({
    where: { id },
    select: { id: true, itemId: true, item: { select: { projectId: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Test not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  let input;
  try {
    input = parseTestInput({ ...body, itemId: existing.itemId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid test details." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.test.update({
      where: { id },
      data: {
        testName: input.testName,
        conductedAt: input.conductedAt,
        dateSampled: input.dateSampled,
        dateSubmitted: input.dateSubmitted,
        dateTested: input.dateTested,
        result: input.result,
        remarks: input.remarks,
      },
    }),
    prisma.project.update({ where: { id: existing.item.projectId }, data: { updatedAt: new Date() }, select: { id: true } }),
  ]);

  return NextResponse.json({ testId: id });
}
