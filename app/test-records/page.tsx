import { Prisma, TestResult } from "@prisma/client";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ListControls from "@/components/ListControls";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, humanizeEnum } from "@/lib/format";
import { pagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestRecordsPage({ searchParams }: { searchParams: Promise<{ q?: string; result?: string; page?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { q = "", result = "", page: requestedPage } = await searchParams;
  const where: Prisma.TestWhereInput = {};
  if (q.trim()) where.OR = [
    { testName: { contains: q.trim(), mode: "insensitive" } },
    { remarks: { contains: q.trim(), mode: "insensitive" } },
    { item: { itemNumber: { contains: q.trim(), mode: "insensitive" } } },
    { item: { description: { contains: q.trim(), mode: "insensitive" } } },
    { item: { project: { projectCode: { contains: q.trim(), mode: "insensitive" } } } },
    { item: { project: { name: { contains: q.trim(), mode: "insensitive" } } } },
  ];
  if (Object.values(TestResult).includes(result as TestResult)) where.result = result as TestResult;
  const total = await prisma.test.count({ where });
  const { page, skip, take } = pagination(requestedPage, total);
  const tests = await prisma.test.findMany({
    where, skip, take,
    orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }],
    include: { item: { include: { project: true } }, _count: { select: { attachments: true } } },
  });
  return <>
    <AppHeader />
    <main className="shell appMain directoryScreen">
      <section className="simpleMasthead"><div><div className="eyebrow">Monitoring registry</div><h1>Test Records</h1><p>Search tests across every project without opening projects one by one.</p></div></section>
      <div className="card filterPanel"><ListControls page={page} total={total} placeholder="Search test, item, project, or remarks" filter={{ name: "result", label: "Filter result", options: [
        { value: "", label: "All results" }, { value: "FAILED", label: "Failed" }, { value: "PENDING", label: "Pending" }, { value: "PASSED", label: "Passed" },
      ] }} /></div>
      <div className="list globalTestList">
        {tests.map((test) => {
          const date = test.dateTested || test.dateSubmitted || test.dateSampled || test.conductedAt;
          return <a className="card globalTestRow" href={`/tests/${test.id}`} key={test.id}>
            <div><span className="rowKicker">{test.item.project.projectCode} · Item {test.item.itemNumber}</span><strong>{test.testName}</strong><span>{test.item.project.name}</span></div>
            <div className="globalTestMeta"><span className={`badge ${test.result}`}>{humanizeEnum(test.result)}</span><span>{formatDate(date)}</span><span>{test._count.attachments} file{test._count.attachments === 1 ? "" : "s"}</span></div>
          </a>;
        })}
        {!tests.length ? <div className="card empty"><strong>No tests found.</strong>Try a different search or filter.</div> : null}
      </div>
    </main>
  </>;
}
