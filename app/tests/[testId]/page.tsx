import { canEditTests } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AttachmentActions from "@/components/AttachmentActions";
import EvidenceUploader from "@/components/LazyEvidenceUploader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, humanFileSize, humanizeEnum } from "@/lib/format";

export const dynamic = "force-dynamic";

function shownDate(value: Date | null) {
  return value ? formatDate(value) : "—";
}

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
  const primaryDate = test.dateTested || test.dateSubmitted || test.dateSampled || test.conductedAt;
  const primaryLabel = test.dateTested ? "Tested" : test.dateSubmitted ? "Submitted" : test.dateSampled ? "Sampled" : "Recorded";

  return (
    <>
      <AppHeader />
      <main className="shell appMain">
        <a className="backLink" href={itemHref}>← Item {test.item.itemNumber}</a>
        <section className="pageHero compactHero">
          <div className="heroCopy">
            <div className="eyebrow">{primaryLabel} {formatDate(primaryDate)}</div>
            <h1>{test.testName}</h1>
            <p>{test.item.project.projectCode} · {test.item.description}</p>
            <div className="heroMetaChips">
              <span>{humanizeEnum(test.result)}</span>
              <span>{test.attachments.length} attachment{test.attachments.length === 1 ? "" : "s"}</span>
              <span>{test.item.project.location || "Location not set"}</span>
            </div>
          </div>
          <div className="heroActions">
            <div className="pageActions">
              <span className={`badge ${test.result}`}>{humanizeEnum(test.result)}</span>
              {canEditTests(user) ? <a className="button secondary" href={`/tests/${test.id}/edit`}>Edit</a> : null}
              {canEditTests(user) ? <a className="button" href={repeatHref}>Record again</a> : null}
            </div>
          </div>
        </section>

        <section className="section firstSection">
          <div className="card infoCard">
            <div className="testDateSummary">
              <div className="infoItem"><span>Date Sampled</span><strong>{shownDate(test.dateSampled)}</strong></div>
              <div className="infoItem"><span>Date Submitted</span><strong>{shownDate(test.dateSubmitted)}</strong></div>
              <div className="infoItem"><span>Date Tested</span><strong>{shownDate(test.dateTested)}</strong></div>
            </div>
            <div className="infoGrid testMetaGrid">
              <div className="infoItem"><span>Recorded by</span><strong>{test.createdBy.displayName}</strong></div>
              <div className="infoItem"><span>Project location</span><strong>{test.item.project.location || "—"}</strong></div>
              <div className="infoItem fullInfo"><span>Remarks</span><strong>{test.remarks || "—"}</strong></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sectionHeader"><div><h2>Evidence</h2><p>Photos and PDF test results.</p></div></div>
          {test.attachments.length ? (
            <div className="attachmentList">
              {test.attachments.map((attachment) => (
                <div className="card attachmentRow" key={attachment.id}>
                  <div className="attachmentName"><strong>{attachment.originalName}</strong><span>{humanFileSize(attachment.fileSize)} · {attachment.mimeType === "application/pdf" ? "PDF" : "Image"}</span></div>
                  <AttachmentActions id={attachment.id} canRemove={canEditTests(user)} />
                </div>
              ))}
            </div>
          ) : <div className="card empty"><strong>No evidence uploaded.</strong>{canEditTests(user) ? "Add a photo or PDF below." : "No files recorded for this test."}</div>}
        </section>

        {canEditTests(user) ? <section className="section"><EvidenceUploader testId={test.id} /></section> : null}
      </main>
    </>
  );
}
