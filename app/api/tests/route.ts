import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTestInput } from "@/lib/test-validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);
  let input;
  try {
    input = parseTestInput(body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid test details." }, { status: 400 });
  }

  if (!input.itemId) return NextResponse.json({ error: "Project item is required." }, { status: 400 });
  const item = await prisma.projectItem.findUnique({ where: { id: input.itemId }, select: { id: true, projectId: true } });
  if (!item) return NextResponse.json({ error: "Project item not found." }, { status: 404 });

  const [test] = await prisma.$transaction([
    prisma.test.create({
      data: {
        itemId: input.itemId,
        testName: input.testName,
        conductedAt: input.conductedAt,
        result: input.result,
        remarks: input.remarks,
        createdById: user.id,
      },
      select: { id: true },
    }),
    prisma.project.update({ where: { id: item.projectId }, data: { updatedAt: new Date() }, select: { id: true } }),
  ]);

  return NextResponse.json({ testId: test.id }, { status: 201 });
}
