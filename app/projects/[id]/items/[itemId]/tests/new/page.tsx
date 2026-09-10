import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TestForm from "@/components/TestForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayInManila } from "@/lib/format";

export default async function NewTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; itemId: string }>;
  searchParams: Promise<{ repeat?: string; saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id, itemId } = await params;
  const { repeat = "", saved = "" } = await searchParams;

  const item = await prisma.projectItem.findFirst({
    where: { id: itemId, projectId: id },
    include: { project: true },
  });
  if (!item) notFound();

  const recentNames = await prisma.test.findMany({
    where: { item: { projectId: item.project.id } },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { testName: true },
  });
  const suggestions = Array.from(new Set(recentNames.map((row) => row.testName))).slice(0, 30);

  let repeatName = "";
  if (repeat) {
    const source = await prisma.test.findFirst({ where: { id: repeat, itemId: item.id }, select: { testName: true } });
    repeatName = source?.testName || "";
  }

  const back = `/projects/${item.project.id}/items/${item.id}`;
  const newTestHref = `${back}/tests/new`;
  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href={back}>← Item {item.itemNumber}</a>
        <div className="pageTop"><div><h1>Add test</h1><p>{item.description} · {item.project.projectCode}</p></div></div>
        <TestForm
          itemId={item.id}
          cancelHref={back}
          newTestHref={newTestHref}
          suggestions={suggestions}
          defaults={{ testName: repeatName, dateSampled: todayInManila(), result: "PENDING" }}
          successMessage={saved ? "Test saved. Ready for the next one." : undefined}
        />
      </main>
    </>
  );
}
