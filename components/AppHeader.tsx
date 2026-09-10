import { getCurrentUser } from "@/lib/auth";

export default async function AppHeader() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <header className="appHeader">
      <div className="brandStrip" aria-hidden="true" />
      <div className="shell headerInner">
        <a className="brand" href="/projects" aria-label="QAH Material Testing home">
          <span className="brandSeal">
            <img src="/mpw-logo.png" alt="" width="46" height="46" />
          </span>
          <span className="brandCopy">
            <span className="brandOffice">Ministry of Public Works · BARMM</span>
            <strong>QAH Material Testing</strong>
            <small>Monitoring &amp; Evidence Registry</small>
          </span>
        </a>
        <div className="userMenu">
          <span className="userIdentity">
            <span className="userDot" aria-hidden="true" />
            <span className="userName">{user.displayName}</span>
          </span>
          <form action="/api/auth/logout" method="post">
            <button className="button ghost small" type="submit">Logout</button>
          </form>
        </div>
      </div>
    </header>
  );
}
