"use client";

import { FormEvent, useState } from "react";
import { uploadEvidence } from "@/components/EvidenceUploader";

export default function NewTestForm({ itemId, cancelHref }: { itemId: string; cancelHref: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const files = form.getAll("evidence").filter((value): value is File => value instanceof File && value.size > 0);

    const response = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId,
        testName: form.get("testName"),
        conductedAt: form.get("conductedAt"),
        result: form.get("result"),
        remarks: form.get("remarks"),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Could not save the test.");
      setBusy(false);
      return;
    }

    try {
      if (files.length) await uploadEvidence(data.testId, files);
      window.location.href = `/tests/${data.testId}`;
    } catch (uploadError) {
      setError(`Test saved, but evidence upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}. You can add evidence from the test page.`);
      setBusy(false);
    }
  }

  return (
    <form className="card formCard" onSubmit={submit}>
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="formGrid">
        <div className="field full">
          <label htmlFor="testName">Test conducted</label>
          <input className="input" id="testName" name="testName" placeholder="e.g. Field Density Test" required />
        </div>
        <div className="field">
          <label htmlFor="conductedAt">Date conducted</label>
          <input className="input" id="conductedAt" name="conductedAt" type="date" required />
        </div>
        <div className="field">
          <label htmlFor="result">Result</label>
          <select className="input" id="result" name="result" defaultValue="PENDING">
            <option value="PENDING">Pending</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div className="field full">
          <label htmlFor="remarks">Remarks</label>
          <textarea className="input" id="remarks" name="remarks" placeholder="Optional notes about this test" />
        </div>
        <div className="field full">
          <label htmlFor="evidence">Photo / PDF evidence</label>
          <input className="input" id="evidence" name="evidence" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple />
          <span className="fieldHint">Optional. Up to 5 files. Photos are resized and compressed before upload.</span>
        </div>
      </div>
      <div className="formActions">
        <a className="button secondary" href={cancelHref}>Cancel</a>
        <button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save test"}</button>
      </div>
    </form>
  );
}
