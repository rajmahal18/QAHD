import { roleLabel } from "@/lib/permissions";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ change?: string; changed?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { change = "", changed = "" } = await searchParams;
  const mustChange = user.mustChangePassword || change === "required";

  return (
    <>
      <AppHeader />
      <main className="shell narrowShell">
        <a className="backLink" href="/projects">← Projects</a>
        <div className="pageTop">
          <div>
            <div className="eyebrow">My account</div>
            <h1>{user.displayName}</h1>
            <p>@{user.username} · {roleLabel(user)}</p>
          </div>
        </div>

        {changed ? <div className="noticeBox successNotice">Password changed successfully.</div> : null}

        {mustChange ? (
          <div className="noticeBox passwordNotice">
            <strong>Change your temporary password.</strong>
            <span>Choose your own password before continuing regular use of the app.</span>
          </div>
        ) : null}

        <section className="section firstSection">
          <div className="sectionHeader"><div><h2>Change password</h2><p>Your username stays the same.</p></div></div>
          <ChangePasswordForm />
        </section>
      </main>
    </>
  );
}
