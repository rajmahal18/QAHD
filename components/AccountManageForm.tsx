"use client";

import RoleSelect from "@/components/RoleSelect";
import { accessRole } from "@/lib/permissions";

import PasswordInput from "@/components/PasswordInput";

import { FormEvent, useState } from "react";

type Account = {
  id: string;
  displayName: string;
  username: string;
  role: "ADMIN" | "USER";
  accessLevel: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
};

export default function AccountManageForm({ account, isSelf }: { account: Account; isSelf: boolean }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/accounts/${account.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        username: form.get("username"),
        role: isSelf ? accessRole(account) : form.get("role"),
        isActive: isSelf ? account.isActive : form.get("isActive") === "on",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Could not save account changes.");
      return;
    }
    setNotice("Account details saved.");
    window.setTimeout(() => window.location.reload(), 350);
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setNotice("");
    setResetBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/accounts/${account.id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password"), confirmPassword: form.get("confirmPassword") }),
    });
    const data = await response.json().catch(() => ({}));
    setResetBusy(false);
    if (!response.ok) {
      setError(data.error || "Could not reset the password.");
      return;
    }
    formElement.reset();
    setNotice("Temporary password saved. The user will be asked to change it after login.");
  }

  return (
    <div className="accountPanels">
      {error ? <div className="errorBox">{error}</div> : null}
      {notice ? <div className="noticeBox successNotice">{notice}</div> : null}

      <form className="card formCard" onSubmit={save}>
        <div className="sectionHeader compactSectionHeader"><div><h2>Account details</h2><p>Keep the username simple and easy to remember.</p></div></div>
        <div className="formGrid">
          <div className="field full">
            <label htmlFor="displayName">Name</label>
            <input className="input" id="displayName" name="displayName" defaultValue={account.displayName} required />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input className="input" id="username" name="username" defaultValue={account.username} required />
          </div>
          <div className="field">
            <label htmlFor="role">Role</label>
            <RoleSelect defaultValue={accessRole(account)} disabled={isSelf} />
            {isSelf ? <span className="fieldHint">Your own role cannot be changed here.</span> : null}
          </div>
          <label className={`toggleRow full ${isSelf ? "disabledToggle" : ""}`}>
            <input type="checkbox" name="isActive" defaultChecked={account.isActive} disabled={isSelf} />
            <span><strong>Active account</strong><small>Inactive accounts cannot sign in.</small></span>
          </label>
        </div>
        <div className="formActions"><button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
      </form>

      {!isSelf ? <form className="card formCard" onSubmit={resetPassword}>
        <div className="sectionHeader compactSectionHeader"><div><h2>Reset password</h2><p>Set a temporary password only when the user needs help signing in.</p></div></div>
        <div className="formGrid">
          <div className="field">
            <label htmlFor="password">Temporary password</label>
            <PasswordInput className="input" id="password" name="password" minLength={10} autoComplete="new-password" required />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm temporary password</label>
            <PasswordInput className="input" id="confirmPassword" name="confirmPassword" minLength={10} autoComplete="new-password" required />
          </div>
        </div>
        <div className="formActions"><button className="button secondary" type="submit" disabled={resetBusy}>{resetBusy ? "Resetting…" : "Set temporary password"}</button></div>
      </form> : <div className="card selfPasswordNote">Use <a className="inlineLink" href="/account">My account</a> to change your own password.</div>}
    </div>
  );
}
