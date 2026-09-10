import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AttachmentActions from "@/components/AttachmentActions";
import EvidenceUploader from "@/components/EvidenceUploader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, humanFileSize, humanizeEnum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { testId } = await params;
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      createdBy: { select: { displayName: true } },
      attachments: { orderBy: { createdAt: "asc" } },
      item: { include: { project: true } },
    },
  });
  if (!test) notFound();
  const itemHref = `/projects/${test.item.project.id}/items/${test.item.id}`;
  const repeatHref = `${itemHref}/tests/new?repeat=${encodeURIComponent(test.id)}`;

  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href={itemHref}>← Item {test.item.itemNumber}</a>
        <div className="pageTop">
          <div>
            <div className="eyebrow">{formatDate(test.conductedAt)}</div>
            <h1>{test.testName}</h1>
            <p>{test.item.project.projectCode} · {test.item.description}</p>
          </div>
          <div className="pageActions">
            <span className={`badge ${test.result}`}>{humanizeEnum(test.result)}</span>
            <a className="button secondary" href={`/tests/${test.id}/edit`}>Edit</a>
            <a className="button" href={repeatHref}>Record again</a>
          </div>
        </div>

        <div className="card infoCard">
          <div className="infoGrid">
            <div className="infoItem"><span>Date conducted</span><strong>{formatDate(test.conductedAt)}</strong></div>
            <div className="infoItem"><span>Recorded by</span><strong>{test.createdBy.displayName}</strong></div>
            <div className="infoItem"><span>Project location</span><strong>{test.item.project.location || "—"}</strong></div>
            <div className="infoItem fullInfo"><span>Remarks</span><strong>{test.remarks || "—"}</strong></div>
          </div>
        </div>

        <section className="section">
          <div className="sectionHeader"><div><h2>Evidence</h2><p>Photos and PDF test results.</p></div></div>
          {test.attachments.length ? (
            <div className="attachmentList">
              {test.attachments.map((attachment) => (
                <div className="card attachmentRow" key={attachment.id}>
                  <div className="attachmentName"><strong>{attachment.originalName}</strong><span>{humanFileSize(attachment.fileSize)} · {attachment.mimeType === "application/pdf" ? "PDF" : "Image"}</span></div>
                  <AttachmentActions id={attachment.id} />
                </div>
              ))}
            </div>
          ) : <div className="card empty"><strong>No evidence uploaded.</strong>Add a photo or PDF below.</div>}
        </section>

        <section className="section"><EvidenceUploader testId={test.id} /></section>
      </main>
    </>
  );
}
