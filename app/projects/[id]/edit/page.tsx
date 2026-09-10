import { canManageProjects } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ProjectForm from "@/components/ProjectForm";
import { updateProject } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManageProjects(user)) redirect("/projects");
  const { id } = await params;
  const { error = "" } = await searchParams;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href={`/projects/${project.id}`}>← Project</a>
        <div className="pageTop"><div><h1>Edit project</h1><p>{project.projectCode}</p></div></div>
        <ProjectForm project={project} action={updateProject.bind(null, project.id)} error={error} />
      </main>
    </>
  );
}
