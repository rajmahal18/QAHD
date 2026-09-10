import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const rows = await prisma.project.groupBy({ by: ["contractor"], _count: { _all: true }, orderBy: { _count: { contractor: "desc" } } });
  return <><AppHeader /><main className="shell appMain directoryScreen"><section className="simpleMasthead"><div><div className="eyebrow">Project index</div><h1>Contractors</h1><p>Browse implementors and open their matching project records.</p></div></section><div className="directoryGrid">{rows.map((row) => <a className="card directoryCard" href={`/projects?q=${encodeURIComponent(row.contractor)}`} key={row.contractor}><span>Implementor / Contractor</span><strong>{row.contractor}</strong><small>{row._count._all} project{row._count._all === 1 ? "" : "s"}</small></a>)}</div></main></>;
}
