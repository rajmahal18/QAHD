import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/projects");

  return (
    <main className="loginPage">
      <div className="loginBox">
        <div className="loginBrand">
          <div className="loginSeal"><img src="/mpw-logo.png" alt="Ministry of Public Works BARMM" width="84" height="84" /></div>
          <div className="loginOffice">Ministry of Public Works · BARMM</div>
          <h1>QAH Material Testing</h1>
          <p>Project test monitoring and evidence registry.</p>
        </div>
        <LoginForm />
        <p className="loginFootnote">QAH Division · Internal monitoring system</p>
      </div>
    </main>
  );
}
