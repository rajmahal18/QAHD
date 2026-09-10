import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import TestForm from "@/components/TestForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateInputValue } from "@/lib/format";

export default async function EditTestPage({ params }: { params: Promise<{ testId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { testId } = await params;

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { item: { include: { project: true } } },
  });
  if (!test) notFound();

  const recentNames = await prisma.test.findMany({
    where: { item: { projectId: test.item.project.id } },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { testName: true },
  });
  const suggestions = Array.from(new Set(recentNames.map((row) => row.testName))).slice(0, 30);
  const back = `/tests/${test.id}`;

  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href={back}>← Test details</a>
        <div className="pageTop"><div><h1>Edit test</h1><p>Item {test.item.itemNumber} · {test.item.project.projectCode}</p></div></div>
        <TestForm
          itemId={test.item.id}
          testId={test.id}
          cancelHref={back}
          suggestions={suggestions}
          defaults={{
            testName: test.testName,
            dateSampled: test.dateSampled ? dateInputValue(test.dateSampled) : "",
            dateSubmitted: test.dateSubmitted ? dateInputValue(test.dateSubmitted) : "",
            dateTested: test.dateTested ? dateInputValue(test.dateTested) : (!test.dateSampled && !test.dateSubmitted ? dateInputValue(test.conductedAt) : ""),
            result: test.result,
            remarks: test.remarks || "",
          }}
        />
      </main>
    </>
  );
}
