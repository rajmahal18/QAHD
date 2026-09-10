"use client";

import { usePathname } from "next/navigation";

const icons = {
  dashboard: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  projects: "M3 6.5h6l2 2h10v11H3z",
  tests: "M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V3M8 14h8",
  locations: "M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Zm0-8.5A2.5 2.5 0 1 0 12 7a2.5 2.5 0 0 0 0 5.5Z",
  contractors: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5M3 20v-2a5 5 0 0 1 10 0v2M14 15.5a4 4 0 0 1 7 2.5v2",
  reports: "M5 20V10h3v10Zm6 0V4h3v16Zm6 0v-7h3v7Z",
  references: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7",
  accounts: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9v-2a7 7 0 0 1 14 0v2",
};

type IconName = keyof typeof icons;

function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={icons[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const baseItems: Array<{ href: string; label: string; icon: IconName; match?: (path: string) => boolean }> = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", match: (path) => path === "/dashboard" },
  { href: "/projects", label: "Projects", icon: "projects", match: (path) => path === "/projects" || path.startsWith("/projects/") },
  { href: "/test-records", label: "Test Records", icon: "tests", match: (path) => path === "/test-records" || path.startsWith("/tests/") },
  { href: "/locations", label: "Locations", icon: "locations" },
  { href: "/contractors", label: "Contractors", icon: "contractors" },
  { href: "/reports", label: "Reports", icon: "reports" },
  { href: "/references", label: "References", icon: "references" },
];

export default function AppNavigation({ isAdmin = false, mobile = false }: { isAdmin?: boolean; mobile?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...baseItems, { href: "/accounts", label: "Accounts", icon: "accounts" as IconName }] : baseItems;

  return (
    <nav className={mobile ? "mobileNavList" : "sideNav"} aria-label="Primary navigation">
      {items.map((item) => {
        const active = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <a href={item.href} key={item.href} className={active ? "active" : undefined}>
            <span className="navIcon"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
