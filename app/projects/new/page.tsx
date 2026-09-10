import { canManageProjects } from "@/lib/permissions";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ProjectForm from "@/components/ProjectForm";
import { createProject } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canManageProjects(user)) redirect("/projects");
  const { error = "" } = await searchParams;

  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href="/projects">← Projects</a>
        <div className="pageTop"><div><h1>New project</h1><p>Enter the core project details. Team fields can be updated later.</p></div></div>
        <ProjectForm action={createProject} error={error} />
      </main>
    </>
  );
}
