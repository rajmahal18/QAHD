import { Prisma, TestResult } from "@prisma/client";
import ListControls from "@/components/ListControls";
import { pagination } from "@/lib/pagination";
import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TestList from "@/components/TestList";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params, searchParams }: { params: Promise<{ id: string; itemId: string }>; searchParams: Promise<{ q?: string; result?: string; page?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id, itemId } = await params;
  const item = await prisma.projectItem.findFirst({
    where: { id: itemId, projectId: id },
    include: {
      project: true,

    },
  });
  if (!item) notFound();

  const { q = "", result = "", page: requestedPage } = await searchParams;
  const where: Prisma.TestWhereInput = { itemId };
  if (Object.values(TestResult).includes(result as TestResult)) where.result = result as TestResult;
  if (q.trim()) {
    where.OR = [
      { testName: { contains: q.trim(), mode: "insensitive" } },
      { remarks: { contains: q.trim(), mode: "insensitive" } },
    ];
    const date = new Date(q.trim());
    if (!Number.isNaN(date.getTime()) && /\d{4}/.test(q)) {
      const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - 8 * 60 * 60 * 1000);
      where.OR.push({ conductedAt: { gte: start, lt: new Date(start.getTime() + 86400000) } });
    }
  }
  const [total, groups] = await Promise.all([
    prisma.test.count({ where }),
    prisma.test.groupBy({ by: ["result"], where: { itemId }, _count: true }),
  ]);
  const { page, skip, take } = pagination(requestedPage, total);
  const rows = await prisma.test.findMany({
    where, skip, take, orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    select: { id: true, testName: true, conductedAt: true, result: true, remarks: true, _count: { select: { attachments: true } } },
  });
  const counts = Object.fromEntries(groups.map((group) => [group.result, group._count]));
  const tests = rows.map((test) => ({
    id: test.id,
    testName: test.testName,
    date: formatDate(test.conductedAt),
    result: test.result,
    remarks: test.remarks,
    attachmentCount: test._count.attachments,
  }));

  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href={`/projects/${item.project.id}`}>← {item.project.projectCode}</a>
        <div className="pageTop">
          <div>
            <div className="eyebrow">Item {item.itemNumber}</div>
            <h1>{item.description}</h1>
            <p>{item.project.name} · {item.project.location || "Location not set"}</p>
          </div>
          <div className="pageActions">
            {user.role === "ADMIN" ? <a className="button secondary" href={`/projects/${item.project.id}/items/${item.id}/edit`}>Edit item</a> : null}
            <a className="button" href={`/projects/${item.project.id}/items/${item.id}/tests/new`}>+ Add test</a>
          </div>
        </div>

        <section className="section firstSection">
          <div className="sectionHeader"><div><h2>Tests conducted</h2><p>Newest first. Search or filter only when you need it.</p></div></div>
          <div className="testSummary" aria-label="Test summary">
            <strong>{groups.reduce((sum, group) => sum + group._count, 0)} tests</strong>
            <span>{counts.PASSED || 0} passed</span><span className="summaryAlert">{counts.FAILED || 0} failed</span><span className="summaryPending">{counts.PENDING || 0} pending</span>
          </div>
          <ListControls page={page} total={total} placeholder="Find a test, remark, or date" filter={{ name: "result", label: "Filter test result", options: [
            { value: "", label: "All results" }, { value: "FAILED", label: "Failed" }, { value: "PENDING", label: "Pending" }, { value: "PASSED", label: "Passed" },
          ] }} />
          <TestList tests={tests} />
        </section>
      </main>
    </>
  );
}
