"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";

const PAGE_SIZE = 20;

type Option = { value: string; label: string };

function pageWindow(current: number, pages: number) {
  const values: Array<number | "ellipsis"> = [];
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  values.push(1);
  if (current > 4) values.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(pages - 1, current + 1);
  for (let p = start; p <= end; p++) values.push(p);
  if (current < pages - 3) values.push("ellipsis");
  values.push(pages);
  return values;
}

export default function ProjectRegistryControls({
  page,
  total,
  municipalities,
}: {
  page: number;
  total: number;
  municipalities: Option[];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState(params.get("status") || "");
  const [municipality, setMunicipality] = useState(params.get("municipality") || "");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sort = params.get("sort") || "updated";
  const view = params.get("view") === "grid" ? "grid" : "list";
  const pageValues = useMemo(() => pageWindow(page, pages), [page, pages]);

  function go(patch: Record<string, string | null>, nextPage = 1, scroll = true) {
    startTransition(() => {
      const next = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      if (nextPage > 1) next.set("page", String(nextPage)); else next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll });
    });
  }

  function schedule(value: string) {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => go({ q: value.trim() }), 250);
  }

  function clearAll() {
    setQuery("");
    setStatus("");
    setMunicipality("");
    go({ q: null, status: null, municipality: null, sort: null, view: null });
  }

  return (
    <>
      <div className="projectToolbar card">
        <label className="projectSearchField" aria-label="Search projects">
          <span className="projectSearchIcon" aria-hidden="true">⌕</span>
          <input
            className="input"
            value={query}
            placeholder="Search project, location, contractor, or staff..."
            onChange={(event) => { setQuery(event.target.value); schedule(event.target.value); }}
          />
        </label>

        <select
          className="input toolbarSelect"
          aria-label="Filter municipality"
          value={municipality}
          onChange={(event) => { setMunicipality(event.target.value); go({ municipality: event.target.value }); }}
        >
          <option value="">All municipalities</option>
          {municipalities.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>

        <select
          className="input toolbarSelect"
          aria-label="Filter status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); go({ status: event.target.value }); }}
        >
          <option value="">All statuses</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        {(query || status || municipality || sort !== "updated" || view !== "list") ? (
          <button className="toolbarClear" type="button" onClick={clearAll}>Clear</button>
        ) : null}
      </div>

      <div className="registryMetaRow">
        <span>{pending ? "Refreshing…" : total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} projects` : "0 projects"}</span>
        <div className="registryTools">
          <label className="sortLabel">
            <span>Sort by</span>
            <select className="input compactSelect" value={sort} onChange={(event) => go({ sort: event.target.value })}>
              <option value="updated">Recently updated</option>
              <option value="code">Project code</option>
              <option value="progress">Highest accomplishment</option>
            </select>
          </label>
          <div className="viewSwitch" aria-label="View style">
            <button type="button" className={view === "list" ? "active" : ""} aria-label="List view" onClick={() => go({ view: "list" })}>☷</button>
            <button type="button" className={view === "grid" ? "active" : ""} aria-label="Grid view" onClick={() => go({ view: "grid" })}>⊞</button>
          </div>
        </div>
      </div>

      {pages > 1 ? (
        <div className="registryPagination">
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} projects</span>
          <nav aria-label="Project pagination">
            <button className="pageControl wide" disabled={pending || page <= 1} onClick={() => go({}, page - 1, false)}>‹ Previous</button>
            {pageValues.map((value, index) => value === "ellipsis"
              ? <span className="pageEllipsis" key={`e-${index}`}>…</span>
              : <button className={`pageControl ${value === page ? "active" : ""}`} key={value} onClick={() => go({}, value, false)}>{value}</button>
            )}
            <button className="pageControl wide" disabled={pending || page >= pages} onClick={() => go({}, page + 1, false)}>Next ›</button>
          </nav>
        </div>
      ) : null}
    </>
  );
}
