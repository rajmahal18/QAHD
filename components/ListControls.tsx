"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

const PAGE_SIZE = 20;

type FilterOption = { value: string; label: string };

export default function ListControls({
  page,
  total,
  placeholder,
  filter,
}: {
  page: number;
  total: number;
  placeholder: string;
  filter?: { name: string; label: string; options: FilterOption[] };
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") || "");
  const [selection, setSelection] = useState(filter ? (params.get(filter.name) || "") : "");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composing = useRef(false);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const navigate = useCallback((q: string, value: string, nextPage = 1, scroll = true) => {
    startTransition(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q); else next.delete("q");
      if (filter) {
        if (value) next.set(filter.name, value);
        else next.delete(filter.name);
      }
      if (nextPage > 1) next.set("page", String(nextPage));
      else next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll });
    });
  }, [filter, params, pathname, router]);

  const cancel = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  };

  const schedule = (value: string) => {
    cancel();
    timeout.current = setTimeout(() => navigate(value.trim(), selection), 250);
  };

  return (
    <div>
      <form className="autoFilters searchCard" role="search" onSubmit={(event) => { event.preventDefault(); navigate(query.trim(), selection); }}>
        <label className="searchField" aria-label={placeholder}>
          <span className="searchIcon" aria-hidden="true">⌕</span>
          <input
            className="input"
            name="q"
            placeholder={placeholder}
            value={query}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              if (!composing.current) schedule(event.target.value);
            }}
            onCompositionStart={() => { composing.current = true; cancel(); }}
            onCompositionEnd={(event) => { composing.current = false; schedule(event.currentTarget.value); }}
          />
        </label>
        {filter ? (
          <div className="selectField">
            <select
              className="input"
              name={filter.name}
              aria-label={filter.label}
              value={selection}
              onChange={(event) => {
                setSelection(event.target.value);
                navigate(query, event.target.value);
              }}
            >
              {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        ) : null}
        <div className="filterActions">
          {(query || selection) ? <button className="button ghost" type="button" onClick={() => { setQuery(""); setSelection(""); navigate("", ""); }}>Clear</button> : null}
        </div>
      </form>
      <div className="pagination paginationPremium">
        <span role="status" aria-live="polite" className="resultsMeta">
          {pending ? "Refreshing results…" : total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}` : "0 results"}
        </span>
        {pages > 1 ? (
          <nav aria-label="Pagination">
            <button className="button secondary" disabled={pending || page <= 1} onClick={() => navigate(query, selection, page - 1, false)}>Previous</button>
            <span className="pageBadge">Page {page} of {pages}</span>
            <button className="button secondary" disabled={pending || page >= pages} onClick={() => navigate(query, selection, page + 1, false)}>Next</button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
