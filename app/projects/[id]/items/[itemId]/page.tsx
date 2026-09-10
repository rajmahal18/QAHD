import { canManageProjects, canEditTests } from "@/lib/permissions";
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

function dateRange(raw: string) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime()) || !/\d{4}/.test(raw)) return null;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - 8 * 60 * 60 * 1000);
  return { gte: start, lt: new Date(start.getTime() + 86400000) };
}

export default async function ItemPage({ params, searchParams }: { params: Promise<{ id: string; itemId: string }>; searchParams: Promise<{ q?: string; result?: string; page?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id, itemId } = await params;
  const item = await prisma.projectItem.findFirst({
    where: { id: itemId, projectId: id },
    include: { project: true },
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
    const range = dateRange(q.trim());
    if (range) {
      where.OR.push(
        { dateSampled: range },
        { dateSubmitted: range },
        { dateTested: range },
        { conductedAt: range },
      );
    }
  }
  const [total, groups] = await Promise.all([
    prisma.test.count({ where }),
    prisma.test.groupBy({ by: ["result"], where: { itemId }, _count: true }),
  ]);
  const { page, skip, take } = pagination(requestedPage, total);
  const rows = await prisma.test.findMany({
    where, skip, take, orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    select: {
      id: true,
      testName: true,
      conductedAt: true,
      dateSampled: true,
      dateSubmitted: true,
      dateTested: true,
      result: true,
      remarks: true,
      _count: { select: { attachments: true } },
    },
  });
  const counts = Object.fromEntries(groups.map((group) => [group.result, group._count]));
  const tests = rows.map((test) => {
    const date = test.dateTested || test.dateSubmitted || test.dateSampled || test.conductedAt;
    const prefix = test.dateTested ? "Tested" : test.dateSubmitted ? "Submitted" : test.dateSampled ? "Sampled" : "Recorded";
    return {
      id: test.id,
      testName: test.testName,
      date: `${prefix} ${formatDate(date)}`,
      result: test.result,
      remarks: test.remarks,
      attachmentCount: test._count.attachments,
    };
  });

  return (
    <>
      <AppHeader />
      <main className="shell appMain">
        <a className="backLink" href={`/projects/${item.project.id}`}>← {item.project.projectCode}</a>
        <section className="pageHero compactHero">
          <div className="heroCopy">
            <div className="eyebrow">Item {item.itemNumber}</div>
            <h1>{item.description}</h1>
            <p>{item.project.name}</p>
            <div className="heroMetaChips">
              <span>{item.project.location || "Location not set"}</span>
              <span>{total} matching test{total === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div className="heroActions">
            <div className="pageActions">
              {canManageProjects(user) ? <a className="button secondary" href={`/projects/${item.project.id}/items/${item.id}/edit`}>Edit item</a> : null}
              {canEditTests(user) ? <a className="button" href={`/projects/${item.project.id}/items/${item.id}/tests/new`}>+ Add test</a> : null}
            </div>
          </div>
        </section>

        <section className="section firstSection">
          <div className="testSummary" aria-label="Test summary">
            <strong>{groups.reduce((sum, group) => sum + group._count, 0)} tests</strong>
            <span>{counts.PASSED || 0} passed</span>
            <span className="summaryAlert">{counts.FAILED || 0} failed</span>
            <span className="summaryPending">{counts.PENDING || 0} pending</span>
          </div>
          <div className="card filterPanel">
            <ListControls
              page={page}
              total={total}
              placeholder="Find a test name, remark, or date"
              filter={{
                name: "result",
                label: "Filter test result",
                options: [
                  { value: "", label: "All results" },
                  { value: "FAILED", label: "Failed" },
                  { value: "PENDING", label: "Pending" },
                  { value: "PASSED", label: "Passed" },
                ],
              }}
            />
          </div>
          <TestList tests={tests} />
        </section>
      </main>
    </>
  );
}
