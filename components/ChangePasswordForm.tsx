"use client";

import PasswordInput from "@/components/PasswordInput";

import { FormEvent, useState } from "react";

export default function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
        confirmPassword: form.get("confirmPassword"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Could not change your password.");
      return;
    }

    event.currentTarget.reset();
    window.location.href = "/account?changed=1";
  }

  return (
    <form className="card formCard" onSubmit={submit}>
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="formGrid">
        <div className="field full">
          <label htmlFor="currentPassword">Current password</label>
          <PasswordInput className="input" id="currentPassword" name="currentPassword" autoComplete="current-password" required />
        </div>
        <div className="field">
          <label htmlFor="newPassword">New password</label>
          <PasswordInput className="input" id="newPassword" name="newPassword" minLength={10} autoComplete="new-password" required />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <PasswordInput className="input" id="confirmPassword" name="confirmPassword" minLength={10} autoComplete="new-password" required />
        </div>
      </div>
      <div className="formActions"><button className="button" type="submit" disabled={busy}>{busy ? "Changing…" : "Change password"}</button></div>
    </form>
  );
}
