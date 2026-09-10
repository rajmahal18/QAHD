"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZE } from "@/lib/pagination";

export default function ListControls({ placeholder, filter, page, total }: {
  placeholder: string;
  filter?: { name: string; label: string; options: { value: string; label: string }[] };
  page: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [selection, setSelection] = useState(filter ? params.get(filter.name) || "" : "");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composing = useRef(false);
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => {
    if (timer.current || composing.current) return;
    setQuery(params.get("q") || "");
    setSelection(filter ? params.get(filter.name) || "" : "");
  }, [params, filter?.name]);
  useEffect(() => () => cancel(), []);

  function navigate(text: string, value: string, nextPage = 1, replace = true) {
    cancel();
    const next = new URLSearchParams(params.toString());
    next.delete("notice");
    text.trim() ? next.set("q", text.trim()) : next.delete("q");
    if (filter) value ? next.set(filter.name, value) : next.delete(filter.name);
    nextPage > 1 ? next.set("page", String(nextPage)) : next.delete("page");
    const url = `${pathname}${next.size ? `?${next}` : ""}`;
    startTransition(() => replace ? router.replace(url, { scroll: false }) : router.push(url, { scroll: false }));
  }
  function schedule(text: string) {
    cancel();
    if (!composing.current) timer.current = setTimeout(() => navigate(text, selection), 350);
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <div className="listControls" aria-busy={pending}>
    <form className="autoFilters" onSubmit={(event) => { event.preventDefault(); if (!composing.current) navigate(query, selection); }}>
      <input className="input" type="search" name="q" value={query} placeholder={placeholder} aria-label={placeholder}
        onChange={(event) => { setQuery(event.target.value); schedule(event.target.value); }}
        onCompositionStart={() => { composing.current = true; cancel(); }}
        onCompositionEnd={(event) => { composing.current = false; schedule(event.currentTarget.value); }} />
      {filter ? <select className="input" name={filter.name} aria-label={filter.label} value={selection}
        onChange={(event) => { setSelection(event.target.value); navigate(query, event.target.value); }}>
        {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select> : null}
      {query || selection ? <button className="button ghost" type="button" onClick={() => { setQuery(""); setSelection(""); navigate("", ""); }}>Clear</button> : null}
    </form>
    <div className="pagination">
      <span role="status" aria-live="polite">{pending ? "Loading results…" : total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}` : "0 results"}</span>
      {pages > 1 ? <nav aria-label="Pagination">
        <button className="button secondary" disabled={pending || page <= 1} onClick={() => navigate(query, selection, page - 1, false)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="button secondary" disabled={pending || page >= pages} onClick={() => navigate(query, selection, page + 1, false)}>Next</button>
      </nav> : null}
    </div>
  </div>;
}
