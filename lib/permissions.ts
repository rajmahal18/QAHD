export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrator", description: "Full access, including account management." },
  { value: "EDITOR", label: "Editor", description: "Manage projects, progress, items, tests, and attachments." },
  { value: "ENCODER", label: "Encoder", description: "Add and edit tests; upload and remove attachments." },
  { value: "VIEWER", label: "Viewer", description: "View records, attachments, and export reports." },
] as const;

export type AccessRole = typeof ROLE_OPTIONS[number]["value"];
type AccountAccess = { role: string; accessLevel?: string | null };

export function accessRole(user: AccountAccess): AccessRole {
  if (user.role === "ADMIN") return "ADMIN";
  if (user.role !== "USER") return "VIEWER";
  if (user.accessLevel == null) return "ENCODER"; // Preserve legacy users' access.
  return user.accessLevel === "EDITOR" || user.accessLevel === "ENCODER" ? user.accessLevel : "VIEWER";
}

export function canManageProjects(user: AccountAccess) {
  const role = accessRole(user);
  return role === "ADMIN" || role === "EDITOR";
}

export function canEditTests(user: AccountAccess) {
  return canManageProjects(user) || accessRole(user) === "ENCODER";
}

export function roleLabel(user: AccountAccess) {
  return ROLE_OPTIONS.find((option) => option.value === accessRole(user))!.label;
}

export function roleData(value: unknown): { role: "ADMIN" | "USER"; accessLevel: string | null } | null {
  if (value === "ADMIN") return { role: "ADMIN", accessLevel: null };
  if (value === "USER" || value === "ENCODER") return { role: "USER", accessLevel: "ENCODER" };
  if (value === "EDITOR" || value === "VIEWER") return { role: "USER", accessLevel: value };
  return null;
}
