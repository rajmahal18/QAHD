"use client";

import { FormEvent, useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });

    setLoading(false);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Unable to sign in.");
      return;
    }

    window.location.href = data.mustChangePassword ? "/account?change=required" : "/projects";
  }

  return (
    <form className="card loginForm" onSubmit={submit}>
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="field">
        <label htmlFor="username">Username</label>
        <input className="input" id="username" name="username" autoComplete="username" required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="button" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
