"use client";

import { useState } from "react";

export default function AttachmentActions({ id, canRemove = false }: { id: string; canRemove?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!window.confirm("Remove this evidence file? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not remove the file.");
      window.location.reload();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove the file.");
      setBusy(false);
    }
  }

  return (
    <div className="attachmentActions">
      <a className="button secondary small" href={`/api/attachments/${id}`} target="_blank" rel="noreferrer">View</a>
      {canRemove ? <button className="button ghost small" type="button" onClick={remove} disabled={busy}>{busy ? "Removing…" : "Remove"}</button> : null}
      {error ? <span className="attachmentError">{error}</span> : null}
    </div>
  );
}
