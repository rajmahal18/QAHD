import { UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AccountManageForm from "@/components/AccountManageForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ManageAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== UserRole.ADMIN) redirect("/projects");

  const { id } = await params;
  const { created = "" } = await searchParams;
  const account = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      username: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
    },
  });
  if (!account) notFound();

  return (
    <>
      <AppHeader />
      <main className="shell narrowShell">
        <a className="backLink" href="/accounts">← Accounts</a>
        <div className="pageTop">
          <div>
            <div className="eyebrow">Manage account</div>
            <h1>{account.displayName}</h1>
            <p>@{account.username}</p>
          </div>
        </div>
        {created ? <div className="noticeBox successNotice">Account created. Share the temporary password securely with the user.</div> : null}
        <AccountManageForm account={account} isSelf={account.id === user.id} />
      </main>
    </>
  );
}
