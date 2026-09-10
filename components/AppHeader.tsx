import { getCurrentUser } from "@/lib/auth";
import AppNavigation from "@/components/AppNavigation";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "QA";
}

export default async function AppHeader() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <>
      <aside className="appSidebar" aria-label="QAH navigation">
        <div className="sidebarTop">
          <div className="sidebarMark" aria-hidden="true"><span /><span /><span /></div>
        </div>
        <AppNavigation isAdmin={user.role === "ADMIN"} />
        <div className="sidebarBranding" aria-hidden="true">
          <div className="sidebarWatermark"><img src="/mpw-logo.png" alt="" /></div>
          <p>Quality infrastructure<br />for a stronger<br />Bangsamoro</p>
          <span className="goldRule" />
        </div>
      </aside>

      <header className="appHeader premiumTopbar">
        <div className="brandStrip" aria-hidden="true" />
        <div className="headerInner appHeaderInner">
          <div className="mobileMenuWrap">
            <details className="mobileMenu">
              <summary aria-label="Open navigation">
                <span /><span /><span />
              </summary>
              <div className="mobileMenuPanel">
                <AppNavigation isAdmin={user.role === "ADMIN"} mobile />
              </div>
            </details>
          </div>

          <a className="brand" href="/projects" aria-label="QAH Material Testing home">
            <span className="brandSeal"><img src="/mpw-logo.png" alt="" width="48" height="48" /></span>
            <span className="brandCopy">
              <span className="brandOffice">Ministry of Public Works · BARMM</span>
              <strong>QAH Material Testing</strong>
              <small>Monitoring &amp; Evidence Registry</small>
            </span>
          </a>

          <details className="userDropdown premiumUserDropdown">
            <summary>
              <span className="avatarBadge" aria-hidden="true">{initials(user.displayName)}</span>
              <span className="userIdentityStack">
                <span className="userName">{user.displayName}</span>
                <span className="userAccountLabel">{user.role === "ADMIN" ? "QAH Administrator" : "QAH Division"}</span>
              </span>
              <span className="menuChevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="userDropdownMenu">
              <a href="/account">My account</a>
              {user.role === "ADMIN" ? <a href="/accounts">Accounts</a> : null}
              <form action="/api/auth/logout" method="post"><button type="submit">Logout</button></form>
            </div>
          </details>
        </div>
      </header>
    </>
  );
}
