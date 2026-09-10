import { roleLabel } from "@/lib/permissions";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== UserRole.ADMIN) redirect("/projects");

  const accounts = await prisma.user.findMany({
    orderBy: [{ displayName: "asc" }, { username: "asc" }],
    select: {
      id: true,
      displayName: true,
      username: true,
      role: true,
      accessLevel: true,
      isActive: true,
      mustChangePassword: true,
    },
  });

  const active = accounts.filter((account) => account.isActive).length;
  const pendingPassword = accounts.filter((account) => account.mustChangePassword).length;
  const admins = accounts.filter((account) => account.role === UserRole.ADMIN).length;

  return (
    <>
      <AppHeader />
      <main className="shell appMain">
        <a className="backLink" href="/projects">← Projects</a>
        <section className="pageHero compactHero">
          <div className="heroCopy">
            <div className="eyebrow">Administration</div>
            <h1>Accounts</h1>
            <p>Keep access simple, visible, and controlled. No unnecessary role sprawl.</p>
          </div>
          <div className="heroActions"> 
            <a className="button" href="/accounts/new">+ Add account</a>
          </div>
        </section>

        <section className="kpiGrid section firstSection">
          <div className="card kpiCard accent-blue"><span className="kpiLabel">Total accounts</span><strong>{accounts.length}</strong><small>Current users in the system</small></div>
          <div className="card kpiCard accent-gold"><span className="kpiLabel">Active</span><strong>{active}</strong><small>{accounts.length - active} inactive</small></div>
          <div className="card kpiCard accent-orange"><span className="kpiLabel">Password change required</span><strong>{pendingPassword}</strong><small>Users with temporary passwords</small></div>
          <div className="card kpiCard accent-slate"><span className="kpiLabel">Administrators</span><strong>{admins}</strong><small>Accounts with admin access</small></div>
        </section>

        <section className="section">
          <div className="sectionHeader sectionHeaderSpacious">
            <div>
              <h2>Account list</h2>
              <p>Open an account to edit the name, role, active status, or reset its password.</p>
            </div>
          </div>
          <div className="list accountList accountListPremium">
            {accounts.map((account) => (
              <a className="card accountRow accountRowPremium" href={`/accounts/${account.id}`} key={account.id}>
                <div className="rowTitle">
                  <strong>{account.displayName}</strong>
                  <span>@{account.username}</span>
                </div>
                <div className="accountRowStatus">
                  <span className={`badge ${account.isActive ? "ACTIVE" : "INACTIVE"}`}>{account.isActive ? "Active" : "Inactive"}</span>
                  <span className="badge roleBadge">{roleLabel(account)}</span>
                  {account.mustChangePassword ? <span className="badge PENDING">Password change</span> : null}
                  <span className="chevron" aria-hidden="true">›</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
