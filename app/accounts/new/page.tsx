import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AccountForm from "@/components/AccountForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== UserRole.ADMIN) redirect("/projects");

  return (
    <>
      <AppHeader />
      <main className="shell narrowShell">
        <a className="backLink" href="/accounts">← Accounts</a>
        <div className="pageTop"><div><div className="eyebrow">Accounts</div><h1>Add account</h1><p>The user will be asked to replace the temporary password after signing in.</p></div></div>
        <AccountForm />
      </main>
    </>
  );
}
