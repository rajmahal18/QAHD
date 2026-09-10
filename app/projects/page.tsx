import { canManageProjects } from "@/lib/permissions";
import { projectProgress } from "@/lib/progress";
import ProjectRegistryControls from "@/components/ProjectRegistryControls";
import { pagination } from "@/lib/pagination";
import { Prisma, ProjectStatus, TestResult } from "@prisma/client";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createViewUrl } from "@/lib/r2";
import { humanizeEnum } from "@/lib/format";

export const dynamic = "force-dynamic";

function municipalityFromLocation(location: string | null) {
  if (!location) return "";
  return location.split(",")[0]?.trim() || "";
}

async function safeViewUrl(objectKey: string) {
  try {
    return await createViewUrl(objectKey);
  } catch {
    return null;
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; municipality?: string; sort?: string; view?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const {
    q = "",
    status = "",
    municipality = "",
    sort = "updated",
    view = "list",
    page: requestedPage,
  } = await searchParams;

  const query = q.trim();
  const validStatus = Object.values(ProjectStatus).includes(status as ProjectStatus) ? (status as ProjectStatus) : undefined;
  const selectedMunicipality = municipality.trim();
  const where: Prisma.ProjectWhereInput = {};

  if (query) {
    where.OR = [
      { projectCode: { contains: query, mode: "insensitive" } },
      { name: { contains: query, mode: "insensitive" } },
      { contractor: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
      { projectEngineer: { contains: query, mode: "insensitive" } },
      { projectInspector: { contains: query, mode: "insensitive" } },
      { materialsEngineer: { contains: query, mode: "insensitive" } },
      { laboratoryTechnician: { contains: query, mode: "insensitive" } },
    ];
  }
  if (validStatus) where.status = validStatus;
  if (selectedMunicipality) where.location = { contains: selectedMunicipality, mode: "insensitive" };

  const orderBy: Prisma.ProjectOrderByWithRelationInput[] = sort === "code"
    ? [{ projectCode: "asc" }]
    : sort === "progress"
      ? [{ physicalAccomplishment: "desc" }, { updatedAt: "desc" }]
      : [{ updatedAt: "desc" }, { projectCode: "asc" }];

  const [
    total,
    totalProjects,
    ongoingProjects,
    completedProjects,
    attentionCount,
    locationRows,
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count(),
    prisma.project.count({ where: { status: ProjectStatus.ONGOING } }),
    prisma.project.count({ where: { status: ProjectStatus.COMPLETED } }),
    prisma.test.count({ where: { result: { in: [TestResult.FAILED, TestResult.PENDING] } } }),
    prisma.project.findMany({ where: { location: { not: null } }, select: { location: true }, distinct: ["location"], orderBy: { location: "asc" } }),
  ]);

  const municipalities = Array.from(
    new Set(locationRows.map((row) => municipalityFromLocation(row.location)).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));

  const { page, skip, take } = pagination(requestedPage, total);
  const projects = await prisma.project.findMany({
    where,
    skip,
    take,
    orderBy,
    include: { _count: { select: { items: true } } },
  });

  const projectIds = projects.map((project) => project.id);
  const imageAttachments = projectIds.length ? await prisma.testAttachment.findMany({
    where: {
      mimeType: { startsWith: "image/" },
      test: { item: { projectId: { in: projectIds } } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(100, projectIds.length * 8),
    select: {
      objectKey: true,
      test: { select: { item: { select: { projectId: true } } } },
    },
  }) : [];

  const keyByProject = new Map<string, string>();
  for (const attachment of imageAttachments) {
    const projectId = attachment.test.item.projectId;
    if (!keyByProject.has(projectId)) keyByProject.set(projectId, attachment.objectKey);
  }

  const thumbnailEntries = await Promise.all(
    Array.from(keyByProject.entries()).map(async ([projectId, objectKey]) => [projectId, await safeViewUrl(objectKey)] as const),
  );
  const thumbnailByProject = new Map(thumbnailEntries);

  const normalizedView = view === "grid" ? "grid" : "list";

  return (
    <>
      <AppHeader />
      <main className="shell appMain projectsScreen">
        <section className="projectsMasthead">
          <div className="mastheadCopy">
            <div className="eyebrow">QAH Division</div>
            <h1>Projects</h1>
            <p>Find a project, open an item, record the test. Nothing extra.</p>
          </div>
          <div className="mastheadSignature" aria-hidden="true">
            <span>Building</span><span>Better</span><span>Bangsamoro</span><i />
          </div>
        </section>

        <section className="dashboardStrip" aria-label="Project summary">
          <div className="metricCard">
            <div className="metricIcon blue">▰</div>
            <div><span>Total Projects</span><strong>{totalProjects}</strong></div>
          </div>
          <div className="metricCard">
            <div className="metricIcon blue dotted">•••</div>
            <div><span>Ongoing</span><strong>{ongoingProjects}</strong></div>
          </div>
          <div className="metricCard">
            <div className="metricIcon green">✓</div>
            <div><span>Completed</span><strong>{completedProjects}</strong></div>
          </div>
          <div className="metricCard">
            <div className="metricIcon gold">!</div>
            <div><span>Needs Attention</span><strong>{attentionCount}</strong></div>
          </div>
          {canManageProjects(user) ? <a className="button addProjectHero" href="/projects/new">＋ Add project</a> : null}
        </section>

        <ProjectRegistryControls page={page} total={total} municipalities={municipalities} />

        {projects.length ? (
          <section className={`projectRegistry ${normalizedView === "grid" ? "gridView" : "listView"}`}>
            {projects.map((project) => {
              const progress = projectProgress(project);
              const thumbnail = thumbnailByProject.get(project.id);
              return (
                <article className="projectEntry card" key={project.id}>
                  <div className={`projectThumbnail ${thumbnail ? "hasImage" : "placeholder"}`}>
                    {thumbnail ? <img src={thumbnail} alt="" /> : <><img src="/mpw-logo.png" alt="" /><span>QAH</span></>}
                  </div>

                  <div className="projectEntryCore">
                    <span className="projectCode">{project.projectCode}</span>
                    <h2>{project.name}</h2>
                    <div className="projectIdentityLine">
                      <span className="identityIcon" aria-hidden="true">♙</span>
                      <span>{project.contractor}</span>
                      <i />
                      <span className="identityIcon" aria-hidden="true">⌖</span>
                      <span>{project.location || "Location not set"}</span>
                    </div>
                    <div className="entryProgress">
                      <div className="entryProgressMeta"><span>Physical accomplishment</span><strong>{progress}%</strong></div>
                      <div className="progressTrack"><div className="progressFill" style={{ width: `${progress}%` }} /></div>
                    </div>
                  </div>

                  <div className="projectEntryStatus">
                    <span className={`badge ${project.status}`}>{humanizeEnum(project.status)}</span>
                    <span className="statusMeta">▧&nbsp; {project._count.items} item{project._count.items === 1 ? "" : "s"}</span>
                    <span className="statusMeta">▦&nbsp; Last updated<br /><strong>{project.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" })}</strong></span>
                  </div>

                  <div className="projectEntryAction">
                    <a className="openProjectButton" href={`/projects/${project.id}`}>Open project <span>→</span></a>
                    <details className="entryMore">
                      <summary aria-label="More project actions">⋮</summary>
                      <div className="entryMoreMenu">
                        <a href={`/projects/${project.id}`}>Open project</a>
                        <a href={`/api/projects/${project.id}/export`}>Export CSV</a>
                        {canManageProjects(user) ? <a href={`/projects/${project.id}/edit`}>Edit project</a> : null}
                      </div>
                    </details>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="card empty registryEmpty"><strong>No projects found.</strong>{query || validStatus || selectedMunicipality ? "Try a different search or filter." : "Add the first project to get started."}</div>
        )}
      </main>
    </>
  );
}
