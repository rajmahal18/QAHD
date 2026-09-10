"use client";

import { FormEvent, useState } from "react";

function usernameFromName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 50);
}

export default function AccountForm() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function changeName(value: string) {
    setDisplayName(value);
    if (!usernameEdited) setUsername(usernameFromName(value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (password !== confirmPassword) {
      setError("Temporary passwords do not match.");
      setBusy(false);
      return;
    }

    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        username,
        password,
        role: form.get("role"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not create the account.");
      setBusy(false);
      return;
    }

    window.location.href = `/accounts/${data.userId}?created=1`;
  }

  return (
    <form className="card formCard" onSubmit={submit}>
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="formGrid">
        <div className="field full">
          <label htmlFor="displayName">Name</label>
          <input className="input" id="displayName" name="displayName" value={displayName} onChange={(event) => changeName(event.target.value)} autoComplete="off" required />
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            className="input"
            id="username"
            name="username"
            value={username}
            onChange={(event) => { setUsernameEdited(true); setUsername(event.target.value.toLowerCase().replace(/\s+/g, "")); }}
            autoComplete="off"
            required
          />
          <span className="fieldHint">Suggested automatically from the name. You can still edit it.</span>
        </div>
        <div className="field">
          <label htmlFor="role">Role</label>
          <select className="input" id="role" name="role" defaultValue="USER">
            <option value="USER">User</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="password">Temporary password</label>
          <input className="input" id="password" name="password" type="password" minLength={10} autoComplete="new-password" required />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Confirm temporary password</label>
          <input className="input" id="confirmPassword" name="confirmPassword" type="password" minLength={10} autoComplete="new-password" required />
        </div>
      </div>
      <div className="formActions">
        <a className="button secondary" href="/accounts">Cancel</a>
        <button className="button" type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </div>
    </form>
  );
}
