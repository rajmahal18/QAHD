import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TestList from "@/components/TestList";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: Promise<{ id: string; itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id, itemId } = await params;
  const item = await prisma.projectItem.findFirst({
    where: { id: itemId, projectId: id },
    include: {
      project: true,
      tests: {
        orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }],
        include: { _count: { select: { attachments: true } } },
      },
    },
  });
  if (!item) notFound();

  const tests = item.tests.map((test) => ({
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
          <TestList tests={tests} />
        </section>
      </main>
    </>
  );
}
