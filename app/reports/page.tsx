import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const [projects, tests, attachments] = await Promise.all([prisma.project.count(), prisma.test.count(), prisma.testAttachment.count()]);
  return <><AppHeader /><main className="shell appMain directoryScreen"><section className="simpleMasthead"><div><div className="eyebrow">Registry snapshot</div><h1>Reports</h1><p>A lightweight overview. Detailed CSV export stays inside each project.</p></div></section><div className="dashboardStrip reportsStrip"><div className="metricCard"><div className="metricIcon blue">▰</div><div><span>Projects</span><strong>{projects}</strong></div></div><div className="metricCard"><div className="metricIcon green">✓</div><div><span>Tests</span><strong>{tests}</strong></div></div><div className="metricCard"><div className="metricIcon gold">▧</div><div><span>Evidence files</span><strong>{attachments}</strong></div></div></div><div className="card reportNote"><strong>Need a project-level report?</strong><p>Open a project and use <b>Export CSV</b>. This keeps reporting simple and avoids a separate report-builder workflow.</p><a className="button" href="/projects">Open projects</a></div></main></>;
}
