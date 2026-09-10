"use client";

import { InputHTMLAttributes, useState } from "react";

export default function PasswordInput({ className = "input", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="passwordInput">
      <input {...props} className={className} type={visible ? "text" : "password"} />
      <button
        className="passwordToggle"
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id}
        title={visible ? "Hide password" : "Show password"}
        disabled={props.disabled}
        onClick={() => setVisible((current) => !current)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {visible ? <path d="m3 3 18 18" /> : null}
        </svg>
      </button>
    </div>
  );
}
