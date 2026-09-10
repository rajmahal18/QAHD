"use client";

import { FormEvent, useState } from "react";
import { uploadEvidence } from "@/components/EvidenceUploader";

type Defaults = {
  testName?: string;
  conductedAt?: string;
  result?: "PENDING" | "PASSED" | "FAILED";
  remarks?: string;
};

export default function TestForm({
  itemId,
  cancelHref,
  suggestions = [],
  defaults = {},
  testId,
  newTestHref,
  successMessage,
}: {
  itemId: string;
  cancelHref: string;
  suggestions?: string[];
  defaults?: Defaults;
  testId?: string;
  newTestHref?: string;
  successMessage?: string;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedTestId, setSavedTestId] = useState("");
  const editing = Boolean(testId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSavedTestId("");
    setBusy(true);

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value === "another" ? "another" : "view";
    const form = new FormData(event.currentTarget);
    const files = editing ? [] : form.getAll("evidence").filter((value): value is File => value instanceof File && value.size > 0);
    const payload = {
      itemId,
      testName: form.get("testName"),
      conductedAt: form.get("conductedAt"),
      result: form.get("result"),
      remarks: form.get("remarks"),
    };

    const response = await fetch(editing ? `/api/tests/${testId}` : "/api/tests", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || `Could not ${editing ? "update" : "save"} the test.`);
      setBusy(false);
      return;
    }

    const savedId = data.testId as string;
    setSavedTestId(savedId);
    try {
      if (files.length) await uploadEvidence(savedId, files);
      if (!editing && intent === "another" && newTestHref) {
        window.location.href = `${newTestHref}?saved=1`;
      } else {
        window.location.href = `/tests/${savedId}`;
      }
    } catch (uploadError) {
      setError(`Test saved, but evidence upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}. You can add the evidence from the saved test.`);
      setBusy(false);
    }
  }

  return (
    <form className="card formCard" onSubmit={submit}>
      {successMessage ? <div className="noticeBox successNotice">{successMessage}</div> : null}
      {error ? (
        <div className="errorBox">
          {error}
          {savedTestId ? <><br /><a className="inlineLink" href={`/tests/${savedTestId}`}>Open saved test</a></> : null}
        </div>
      ) : null}
      <div className="formGrid">
        <div className="field full">
          <label htmlFor="testName">Test conducted</label>
          <input
            className="input"
            id="testName"
            name="testName"
            list={suggestions.length ? "test-name-suggestions" : undefined}
            defaultValue={defaults.testName || ""}
            placeholder="e.g. Field Density Test"
            autoComplete="off"
            required
          />
          {suggestions.length ? (
            <>
              <datalist id="test-name-suggestions">
                {suggestions.map((name) => <option value={name} key={name} />)}
              </datalist>
              <span className="fieldHint">Start typing to reuse test names already used in this project.</span>
            </>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="conductedAt">Date conducted</label>
          <input className="input" id="conductedAt" name="conductedAt" type="date" defaultValue={defaults.conductedAt || ""} required />
        </div>
        <div className="field">
          <label htmlFor="result">Result</label>
          <select className="input" id="result" name="result" defaultValue={defaults.result || "PENDING"}>
            <option value="PENDING">Pending</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div className="field full">
          <label htmlFor="remarks">Remarks</label>
          <textarea className="input" id="remarks" name="remarks" defaultValue={defaults.remarks || ""} placeholder="Optional notes about this test" />
        </div>
        {!editing ? (
          <div className="field full">
            <label htmlFor="evidence">Photo / PDF evidence</label>
            <input className="input" id="evidence" name="evidence" type="file" accept="image/*,application/pdf" multiple />
            <span className="fieldHint">Optional. Up to 5 files. Photos are optimized before upload to save storage.</span>
          </div>
        ) : null}
      </div>
      <div className="formActions splitActions">
        <a className="button secondary" href={cancelHref}>Cancel</a>
        <div className="actionGroup">
          {!editing && newTestHref ? <button className="button secondary" type="submit" name="intent" value="another" disabled={busy}>Save & add another</button> : null}
          <button className="button" type="submit" name="intent" value="view" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Save test"}</button>
        </div>
      </div>
    </form>
  );
}
