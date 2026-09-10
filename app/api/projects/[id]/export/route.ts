import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateInputValue, humanizeEnum } from "@/lib/format";

function csv(value: unknown) {
  let text = String(value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "project";
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { itemNumber: "asc" },
        include: {
          tests: {
            orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }],
            include: {
              createdBy: { select: { displayName: true } },
              _count: { select: { attachments: true } },
            },
          },
        },
      },
    },
  });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const rows = [
    ["Project Code", "Project Name", "Location", "Contractor", "Item No.", "Item Description", "Date Conducted", "Test Conducted", "Result", "Remarks", "Evidence Files", "Recorded By"],
  ];

  for (const item of project.items) {
    if (!item.tests.length) {
      rows.push([project.projectCode, project.name, project.location || "", project.contractor, item.itemNumber, item.description, "", "", "", "", "0", ""]);
      continue;
    }

    for (const test of item.tests) {
      rows.push([
        project.projectCode,
        project.name,
        project.location || "",
        project.contractor,
        item.itemNumber,
        item.description,
        dateInputValue(test.conductedAt),
        test.testName,
        humanizeEnum(test.result),
        test.remarks || "",
        String(test._count.attachments),
        test.createdBy.displayName,
      ]);
    }
  }

  const body = `\uFEFF${rows.map((row) => row.map(csv).join(",")).join("\r\n")}`;
  const filename = `${safeFileName(project.projectCode)}-material-tests.csv`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
