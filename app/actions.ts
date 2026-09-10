"use server";

import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") throw new Error("Admin access required.");
  return user;
}

function text(form: FormData, key: string, required = false) {
  const value = String(form.get(key) || "").trim();
  if (required && !value) throw new Error(`${key} is required.`);
  return value || null;
}


function optionalCoordinate(form: FormData, key: string, min: number, max: number) {
  const raw = String(form.get(key) || "").trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Invalid ${key}.`);
  }
  return value;
}

function accomplishment(form: FormData) {
  const value = Number(form.get("physicalAccomplishment") || 0);
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error("Physical accomplishment must be 0 to 100.");
  return Math.round(value);
}

function status(form: FormData): ProjectStatus {
  const value = String(form.get("status") || "ONGOING");
  if (!Object.values(ProjectStatus).includes(value as ProjectStatus)) throw new Error("Invalid project status.");
  return value as ProjectStatus;
}

function projectData(form: FormData) {
  const latitude = optionalCoordinate(form, "latitude", -90, 90);
  const longitude = optionalCoordinate(form, "longitude", -180, 180);
  if ((latitude === null) !== (longitude === null)) {
    throw new Error("Latitude and longitude must be set together.");
  }

  return {
    projectCode: text(form, "projectCode", true)!,
    name: text(form, "name", true)!,
    location: text(form, "location", true)!,
    latitude,
    longitude,
    contractor: text(form, "contractor", true)!,
    projectEngineer: text(form, "projectEngineer"),
    projectInspector: text(form, "projectInspector"),
    materialsEngineer: text(form, "materialsEngineer"),
    laboratoryTechnician: text(form, "laboratoryTechnician"),
    physicalAccomplishment: accomplishment(form),
    status: status(form),
  };
}

function duplicateMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  return (error as { code?: string }).code === "P2002" ? fallback : null;
}

export async function createProject(form: FormData) {
  await requireAdmin();
  let project;
  try {
    project = await prisma.project.create({ data: projectData(form) });
  } catch (error) {
    const message = duplicateMessage(error, "That project ID / code is already in use.");
    if (message) redirect(`/projects/new?error=${encodeURIComponent(message)}`);
    throw error;
  }
  redirect(`/projects/${project.id}`);
}

export async function updateProject(projectId: string, form: FormData) {
  await requireAdmin();
  try {
    await prisma.project.update({ where: { id: projectId }, data: projectData(form) });
  } catch (error) {
    const message = duplicateMessage(error, "That project ID / code is already in use.");
    if (message) redirect(`/projects/${projectId}/edit?error=${encodeURIComponent(message)}`);
    throw error;
  }
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function createItem(projectId: string, form: FormData) {
  await requireAdmin();
  const itemNumber = text(form, "itemNumber", true)!;
  const description = text(form, "description", true)!;
  let notice = "Item added.";

  try {
    await prisma.$transaction([
      prisma.projectItem.create({ data: { projectId, itemNumber, description } }),
      prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() }, select: { id: true } }),
    ]);
  } catch (error) {
    const message = duplicateMessage(error, `Item ${itemNumber} already exists in this project.`);
    if (message) notice = message;
    else throw error;
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?notice=${encodeURIComponent(notice)}`);
}

function parseBulkItems(raw: string) {
  const rows: Array<{ itemNumber: string; description: string }> = [];
  const seen = new Set<string>();
  let ignored = 0;

  for (const line of raw.split(/\r?\n/)) {
    const clean = line.trim();
    if (!clean) continue;

    let parts: string[];
    if (clean.includes("\t")) parts = clean.split("\t");
    else if (clean.includes("|")) parts = clean.split("|");
    else parts = clean.split(/\s+-\s+/, 2);

    const itemNumber = String(parts.shift() || "").trim().replace(/^item\s+/i, "");
    const description = parts.join(" ").trim();
    if (!itemNumber || !description) {
      ignored += 1;
      continue;
    }

    const key = itemNumber.toLowerCase();
    if (seen.has(key)) {
      ignored += 1;
      continue;
    }
    seen.add(key);

    if (rows.length >= 150) {
      ignored += 1;
      continue;
    }
    rows.push({ itemNumber: itemNumber.slice(0, 80), description: description.slice(0, 240) });
  }

  return { rows, ignored };
}

export async function createItemsBulk(projectId: string, form: FormData) {
  await requireAdmin();
  const raw = String(form.get("items") || "");
  const { rows, ignored } = parseBulkItems(raw);
  if (!rows.length) {
    redirect(`/projects/${projectId}?notice=${encodeURIComponent("Nothing was added. Paste two columns from Sheets, or use: item number | description.")}`);
  }

  const [result] = await prisma.$transaction([
    prisma.projectItem.createMany({
      data: rows.map((row) => ({ projectId, ...row })),
      skipDuplicates: true,
    }),
    prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() }, select: { id: true } }),
  ]);
  const skipped = rows.length - result.count + ignored;
  const notice = skipped
    ? `Added ${result.count} item${result.count === 1 ? "" : "s"}; skipped ${skipped} duplicate or invalid row${skipped === 1 ? "" : "s"}.`
    : `Added ${result.count} item${result.count === 1 ? "" : "s"}.`;

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?notice=${encodeURIComponent(notice)}`);
}

export async function updateItem(projectId: string, itemId: string, form: FormData) {
  await requireAdmin();
  const itemNumber = text(form, "itemNumber", true)!;
  const description = text(form, "description", true)!;

  try {
    await prisma.$transaction([
      prisma.projectItem.update({
        where: { id: itemId },
        data: { itemNumber, description },
      }),
      prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() }, select: { id: true } }),
    ]);
  } catch (error) {
    const message = duplicateMessage(error, `Item ${itemNumber} already exists in this project.`);
    if (message) redirect(`/projects/${projectId}/items/${itemId}/edit?error=${encodeURIComponent(message)}`);
    throw error;
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/items/${itemId}`);
  redirect(`/projects/${projectId}/items/${itemId}`);
}
