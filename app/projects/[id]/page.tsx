import { canManageProjects } from "@/lib/permissions";
import { projectProgress } from "@/lib/progress";
import ListControls from "@/components/ListControls";
import { pagination } from "@/lib/pagination";
import { Prisma, TestResult } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ProjectItemList from "@/components/ProjectItemList";
import { createItem, createItemsBulk } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, humanizeEnum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; q?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const { notice = "", q = "", page: requestedPage } = await searchParams;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const where: Prisma.ProjectItemWhereInput = { projectId: id };
  if (q.trim()) where.OR = [
    { itemNumber: { contains: q.trim(), mode: "insensitive" } },
    { description: { contains: q.trim(), mode: "insensitive" } },
  ];
  const total = await prisma.projectItem.count({ where });
  const { page, skip, take } = pagination(requestedPage, total);
  const items = await prisma.projectItem.findMany({
    where,
    skip,
    take,
    orderBy: [{ itemNumber: "asc" }, { id: "asc" }],
    select: {
      id: true,
      itemNumber: true,
      description: true,
      _count: { select: { tests: true } },
      tests: { orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }], take: 1, select: { conductedAt: true, result: true } },
    },
  });
  const testWhere: Prisma.TestWhereInput = { item: { projectId: project.id } };
  const [totalTests, failedTests, pendingTests, attentionTests] = await Promise.all([
    prisma.test.count({ where: testWhere }),
    prisma.test.count({ where: { ...testWhere, result: TestResult.FAILED } }),
    prisma.test.count({ where: { ...testWhere, result: TestResult.PENDING } }),
    prisma.test.findMany({
      where: { ...testWhere, result: { in: [TestResult.FAILED, TestResult.PENDING] } },
      orderBy: [{ conductedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        testName: true,
        conductedAt: true,
        result: true,
        item: { select: { itemNumber: true, description: true } },
      },
    }),
  ]);

  const addItem = createItem.bind(null, project.id);
  const addItemsBulk = createItemsBulk.bind(null, project.id);
  const itemRows = items.map((item) => ({
    id: item.id,
    itemNumber: item.itemNumber,
    description: item.description,
    testCount: item._count.tests,
    lastTest: item.tests[0] ? formatDate(item.tests[0].conductedAt) : null,
    lastResult: item.tests[0]?.result || null,
  }));

  const progress = projectProgress(project);

  return (
    <>
      <AppHeader />
      <main className="shell appMain">
        <a className="backLink" href="/projects">← Project registry</a>

        <section className="pageHero detailHero">
          <div className="heroCopy">
            <div className="eyebrow">{project.projectCode}</div>
            <h1>{project.name}</h1>
            <p>{project.contractor}</p>
            <div className="heroMetaChips">
              <span>{project.location || "Location not set"}</span>
              <span>{total} item{total === 1 ? "" : "s"}</span>
              <span>{totalTests} tests recorded</span>
            </div>
          </div>
          <div className="heroAside card statusPanel">
            <div className="statusPanelHead">
              <span className={`badge ${project.status}`}>{humanizeEnum(project.status)}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progressWrap compact">
              <div className="progressMeta"><span>Physical accomplishment</span><span>{progress}%</span></div>
              <div className="progressTrack">
                <div className="progressFill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="heroAsideActions">
              <a className="button secondary" href={`/api/projects/${project.id}/export`}>Export CSV</a>
              {project.location ? (
                <a
                  className="button secondary"
                  href={project.latitude !== null && project.longitude !== null
                    ? `https://www.google.com/maps/search/?api=1&query=${project.latitude},${project.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps ↗
                </a>
              ) : null}
              {canManageProjects(user) ? <a className="button" href={`/projects/${project.id}/edit`}>Edit project</a> : null}
            </div>
          </div>
        </section>

        {notice ? <div className="noticeBox successNotice">{notice}</div> : null}

        <section className="kpiGrid section firstSection">
          <div className="card kpiCard accent-blue">
            <span className="kpiLabel">Status</span>
            <strong>{humanizeEnum(project.status)}</strong>
            <small>Current project monitoring state</small>
          </div>
          <div className="card kpiCard accent-gold">
            <span className="kpiLabel">Tests recorded</span>
            <strong>{totalTests}</strong>
            <small>{pendingTests} pending · {failedTests} failed</small>
          </div>
          <div className="card kpiCard accent-orange">
            <span className="kpiLabel">Needs attention</span>
            <strong>{failedTests + pendingTests}</strong>
            <small>Auto-surfaced from failed and pending tests</small>
          </div>
          <div className="card kpiCard accent-slate">
            <span className="kpiLabel">Project team</span>
            <strong>{[project.projectEngineer, project.projectInspector, project.materialsEngineer, project.laboratoryTechnician].filter(Boolean).length}</strong>
            <small>Assigned staff fields filled in</small>
          </div>
        </section>

        <section className="section twoColumnOverview">
          <div className="card infoCard">
            <div className="sectionHeader compactHeader">
              <div>
                <h2>Overview</h2>
                <p>Core project details kept visible without overloading the page.</p>
              </div>
            </div>
            <div className="infoGrid overviewGrid">
              <div className="infoItem"><span>Contractor / Implementor</span><strong>{project.contractor || "—"}</strong></div>
              <div className="infoItem"><span>Location</span><strong>{project.location || "—"}</strong></div>
              <div className="infoItem"><span>Project Engineer</span><strong>{project.projectEngineer || "—"}</strong></div>
              <div className="infoItem"><span>Project Inspector</span><strong>{project.projectInspector || "—"}</strong></div>
              <div className="infoItem"><span>Materials Engineer</span><strong>{project.materialsEngineer || "—"}</strong></div>
              <div className="infoItem"><span>Laboratory Technician</span><strong>{project.laboratoryTechnician || "—"}</strong></div>
            </div>
          </div>

          {attentionTests.length ? (
            <div className="card infoCard sideAttentionCard">
              <div className="sectionHeader compactHeader">
                <div>
                  <h2>Needs attention</h2>
                  <p>{failedTests + pendingTests > 5 ? `Latest 5 of ${failedTests + pendingTests} attention items.` : "Failed or pending tests surfaced automatically."}</p>
                </div>
              </div>
              <div className="list compactList">
                {attentionTests.map((test) => (
                  <a className="attentionMiniRow" href={`/tests/${test.id}`} key={test.id}>
                    <div>
                      <strong>{test.testName}</strong>
                      <span>Item {test.item.itemNumber} · {formatDate(test.conductedAt)}</span>
                    </div>
                    <span className={`badge ${test.result}`}>{humanizeEnum(test.result)}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="section">
          <div className="sectionHeader sectionHeaderSpacious">
            <div>
              <h2>Items</h2>
              <p>Open an item to record, search, and review its tests.</p>
            </div>
          </div>
          <div className="card filterPanel">
            <ListControls page={page} total={total} placeholder="Find an item number or description" />
          </div>
          <ProjectItemList projectId={project.id} items={itemRows} />

          {canManageProjects(user) ? (
            <div className="itemEntryStack section">
              <form className="card inlineForm inlineFormPremium" action={addItem}>
                <div className="field"><label htmlFor="itemNumber">Item No.</label><input className="input" id="itemNumber" name="itemNumber" placeholder="e.g. 200" autoComplete="off" required /></div>
                <div className="field"><label htmlFor="description">Description</label><input className="input" id="description" name="description" placeholder="e.g. Aggregate Base Course" autoComplete="off" required /></div>
                <button className="button" type="submit">+ Add item</button>
              </form>

              <details className="card bulkPanel">
                <summary>Add multiple items from Sheets</summary>
                <form action={addItemsBulk} className="bulkForm">
                  <p>Copy two columns from Google Sheets — item number and description — then paste them below. Existing item numbers are skipped.</p>
                  <div className="field">
                    <label htmlFor="items">Paste items</label>
                    <textarea className="input bulkTextarea" id="items" name="items" placeholder={'200\tAggregate Base Course\n311\tPortland Cement Concrete Pavement'} required />
                    <span className="fieldHint">Also accepts: 200 | Aggregate Base Course</span>
                  </div>
                  <div className="formActions"><button className="button" type="submit">Add items</button></div>
                </form>
              </details>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
