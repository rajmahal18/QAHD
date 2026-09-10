"use client";

import { useMemo, useState } from "react";

type TestRow = {
  id: string;
  testName: string;
  date: string;
  result: "PASSED" | "FAILED" | "PENDING";
  remarks: string | null;
  attachmentCount: number;
};

function label(value: TestRow["result"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function TestList({ tests }: { tests: TestRow[] }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const counts = useMemo(() => ({
    passed: tests.filter((test) => test.result === "PASSED").length,
    failed: tests.filter((test) => test.result === "FAILED").length,
    pending: tests.filter((test) => test.result === "PENDING").length,
  }), [tests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((test) => {
      const matchesText = !q || `${test.testName} ${test.remarks || ""} ${test.date}`.toLowerCase().includes(q);
      const matchesResult = !result || test.result === result;
      return matchesText && matchesResult;
    });
  }, [tests, query, result]);

  if (!tests.length) return <div className="card empty"><strong>No tests recorded.</strong>Add the first test conducted for this item.</div>;

  return (
    <>
      <div className="testSummary" aria-label="Test summary">
        <strong>{tests.length} test{tests.length === 1 ? "" : "s"}</strong>
        <span>{counts.passed} passed</span>
        <span className={counts.failed ? "summaryAlert" : ""}>{counts.failed} failed</span>
        <span className={counts.pending ? "summaryPending" : ""}>{counts.pending} pending</span>
      </div>

      {tests.length >= 4 || counts.failed || counts.pending ? (
        <div className="testFilters">
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a test or remark"
            aria-label="Find a test"
          />
          <select className="input" value={result} onChange={(event) => setResult(event.target.value)} aria-label="Filter test result">
            <option value="">All results</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
            <option value="PASSED">Passed</option>
          </select>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="list">
          {filtered.map((test) => (
            <a className="card testRow" href={`/tests/${test.id}`} key={test.id}>
              <div className="rowTop">
                <div className="rowTitle"><strong>{test.testName}</strong><span>{test.date}</span></div>
                <span className={`badge ${test.result}`}>{label(test.result)}</span>
              </div>
              <div className="rowMeta">
                <span>{test.attachmentCount} attachment{test.attachmentCount === 1 ? "" : "s"}</span>
                {test.remarks ? <span>{test.remarks.length > 100 ? `${test.remarks.slice(0, 100)}…` : test.remarks}</span> : null}
              </div>
            </a>
          ))}
        </div>
      ) : <div className="card empty"><strong>No matching tests.</strong>Clear the search or change the result filter.</div>}
    </>
  );
}
