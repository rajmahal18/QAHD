import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const rows = await prisma.project.groupBy({ by: ["location"], where: { location: { not: null } }, _count: { _all: true }, orderBy: { _count: { location: "desc" } } });
  return <><AppHeader /><main className="shell appMain directoryScreen"><section className="simpleMasthead"><div><div className="eyebrow">Project index</div><h1>Locations</h1><p>Open a location to jump straight to matching projects.</p></div></section><div className="directoryGrid">{rows.map((row) => row.location ? <a className="card directoryCard" href={`/projects?q=${encodeURIComponent(row.location)}`} key={row.location}><span>Location</span><strong>{row.location}</strong><small>{row._count._all} project{row._count._all === 1 ? "" : "s"}</small></a> : null)}</div></main></>;
}
