import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { humanizeEnum } from "@/lib/format";

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
      isActive: true,
      mustChangePassword: true,
    },
  });

  return (
    <>
      <AppHeader />
      <main className="shell">
        <a className="backLink" href="/projects">← Projects</a>
        <div className="pageTop">
          <div>
            <div className="eyebrow">Administration</div>
            <h1>Accounts</h1>
            <p>{accounts.length} account{accounts.length === 1 ? "" : "s"}. Keep access simple and controlled.</p>
          </div>
          <div className="pageActions"><a className="button" href="/accounts/new">+ Add account</a></div>
        </div>

        <div className="list accountList">
          {accounts.map((account) => (
            <a className="card accountRow" href={`/accounts/${account.id}`} key={account.id}>
              <div className="rowTitle">
                <strong>{account.displayName}</strong>
                <span>@{account.username}</span>
              </div>
              <div className="accountRowStatus">
                <span className={`badge ${account.isActive ? "ACTIVE" : "INACTIVE"}`}>{account.isActive ? "Active" : "Inactive"}</span>
                <span className="badge roleBadge">{humanizeEnum(account.role)}</span>
                {account.mustChangePassword ? <span className="badge PENDING">Password change</span> : null}
                <span className="chevron" aria-hidden="true">›</span>
              </div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
