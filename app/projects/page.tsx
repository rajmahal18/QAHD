import ListControls from "@/components/ListControls";
import { pagination } from "@/lib/pagination";
import { Prisma, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { humanizeEnum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { q = "", status = "", page: requestedPage } = await searchParams;
  const query = q.trim();
  const validStatus = Object.values(ProjectStatus).includes(status as ProjectStatus) ? (status as ProjectStatus) : undefined;

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

  const total = await prisma.project.count({ where });
  const { page, skip, take } = pagination(requestedPage, total);
  const projects = await prisma.project.findMany({
    where, skip, take,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }, { id: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return (
    <>
      <AppHeader />
      <main className="shell">
        <div className="pageTop">
          <div>
            <div className="eyebrow">QAH Division</div>
            <h1>Projects</h1>
            <p>Find a project, open an item, record the test. Nothing extra.</p>
          </div>
          {user.role === "ADMIN" ? <a className="button" href="/projects/new">+ Add project</a> : null}
        </div>

        <ListControls page={page} total={total} placeholder="Search project, location, contractor, or staff" filter={{ name: "status", label: "Filter project status", options: [
          { value: "", label: "All statuses" }, { value: "ONGOING", label: "Ongoing" }, { value: "COMPLETED", label: "Completed" }, { value: "SUSPENDED", label: "Suspended" },
        ] }} />

        {projects.length ? (
          <div className="list">
            {projects.map((project) => (
              <a className="card projectRow" href={`/projects/${project.id}`} key={project.id}>
                <div className="rowTop">
                  <div className="rowTitle">
                    <span className="rowKicker">{project.projectCode}</span>
                    <strong>{project.name}</strong>
                    <span>{project.contractor}</span>
                  </div>
                  <span className={`badge ${project.status}`}>{humanizeEnum(project.status)}</span>
                </div>
                <div className="rowMeta projectMeta">
                  <span>{project.location || "Location not set"}</span>
                  <span>{project._count.items} item{project._count.items === 1 ? "" : "s"}</span>
                </div>
                <div className="progressWrap">
                  <div className="progressMeta"><span>Physical accomplishment</span><span>{project.physicalAccomplishment}%</span></div>
                  <div className="progressTrack"><div className="progressFill" style={{ width: `${project.physicalAccomplishment}%` }} /></div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card empty"><strong>No projects found.</strong>{query || validStatus ? "Try a different search or filter." : "Add the first project to get started."}</div>
        )}
      </main>
    </>
  );
}
