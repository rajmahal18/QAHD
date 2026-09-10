"use client";

import { useState } from "react";
import { AccessRole, ROLE_OPTIONS } from "@/lib/permissions";

export default function RoleSelect({ defaultValue = "ENCODER", disabled = false }: { defaultValue?: AccessRole; disabled?: boolean }) {
  const [role, setRole] = useState(defaultValue);
  return <>
    <select className="input" id="role" name="role" value={role} disabled={disabled} aria-describedby="roleHelp" onChange={(event) => setRole(event.target.value as AccessRole)}>
      {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <span className="fieldHint" id="roleHelp">{ROLE_OPTIONS.find((option) => option.value === role)?.description}</span>
  </>;
}
