import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { accessRole, canEditTests, canManageProjects, roleData } from "./permissions";
import * as permissions from "./permissions";

test("roles allow only their assigned project and test operations", () => {
  for (const [role, projects, tests] of [["ADMIN", true, true], ["EDITOR", true, true], ["ENCODER", false, true], ["VIEWER", false, false]] as const) {
    const user = roleData(role)!;
    assert.equal(accessRole(user), role);
    assert.equal(canManageProjects(user), projects);
    assert.equal(canEditTests(user), tests);
  }
  assert.equal(accessRole({ role: "USER" }), "ENCODER");
  assert.equal(canEditTests({ role: "USER", accessLevel: "unexpected" }), false);
  assert.equal(canManageProjects({ role: "USER", accessLevel: "ADMIN" }), false);
  assert.equal(roleData("unexpected"), null);
});

// Execute actual endpoint code with authentication and persistence replaced by test doubles.
// A denied request must return before looking up records, changing data, or accessing storage.
const mutations = [
  ["app/api/tests/route.ts", "POST"],
  ["app/api/tests/[id]/route.ts", "PATCH"],
  ["app/api/uploads/presign/route.ts", "POST"],
  ["app/api/uploads/complete/route.ts", "POST"],
  ["app/api/attachments/[id]/route.ts", "DELETE"],
  ["app/api/accounts/route.ts", "POST"],
  ["app/api/accounts/[id]/route.ts", "PATCH"],
  ["app/api/accounts/[id]/password/route.ts", "POST"],
] as const;

function endpoint(file: string, user: unknown, database?: unknown) {
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports: Record<string, (request: Request, context: unknown) => Promise<Response>> = {};
  const forbidden = new Proxy({}, { get() { throw new Error("Denied request accessed persistence or storage"); } });
  const requireMock = (name: string) => {
    if (name === "@/lib/permissions") return permissions;
    if (name === "@/lib/auth") return { getCurrentUser: async () => user };
    if (name === "next/server") return { NextResponse: { json: (body: unknown, init: ResponseInit) => Response.json(body, init) } };
    if (name === "@/lib/prisma") return { prisma: database ?? forbidden };
    if (name === "@prisma/client") return { UserRole: { ADMIN: "ADMIN", USER: "USER" } };
    return {};
  };
  new Function("require", "exports", output)(requireMock, exports);
  return exports;
}

for (const [file, method] of mutations) {
  test(`${method} ${file}: viewer denied, anonymous unauthorized`, async () => {
    for (const [user, status] of [[{ id: "viewer", ...roleData("VIEWER") }, 403], [null, 401]] as const) {
      const response = await endpoint(file, user)[method](new Request("http://localhost/test", { method }), { params: Promise.resolve({ id: "test" }) });
      assert.equal(response.status, status);
    }
  });
}

for (const [file, method] of mutations.filter(([file]) => file.includes("/accounts"))) {
  test(`${method} ${file}: editors and encoders cannot manage accounts`, async () => {
    for (const role of ["EDITOR", "ENCODER"]) {
      const response = await endpoint(file, { id: "user", ...roleData(role) })[method](new Request("http://localhost/test", { method }), { params: Promise.resolve({ id: "test" }) });
      assert.equal(response.status, 403);
    }
  });
}

test("all project server actions reject encoders and viewers before persistence", async () => {
  for (const role of ["ENCODER", "VIEWER"]) {
    const actions = endpoint("app/actions.ts", { id: "user", ...roleData(role) });
    for (const name of ["createProject", "updateProject", "createItem", "createItemsBulk", "updateItem"]) {
      await assert.rejects(() => actions[name](new Request("http://localhost"), {}), /Project editing access required/);
    }
  }
});

test("stale legacy account forms cannot replace restricted roles", async () => {
  for (const accessLevel of ["VIEWER", "EDITOR", "ENCODER"]) {
    let writes = 0;
    const database = { user: {
      findUnique: async () => ({ id: "target", role: "USER", accessLevel, isActive: true }),
      update: async () => { writes++; },
    } };
    const route = endpoint("app/api/accounts/[id]/route.ts", { id: "admin", role: "ADMIN" }, database);
    const response = await route.PATCH(new Request("http://localhost/test", { method: "PATCH", body: JSON.stringify({ displayName: "Test", username: "test", role: "USER" }) }), { params: Promise.resolve({ id: "target" }) });
    assert.equal(response.status, 409);
    assert.equal(writes, 0);
  }
});

test("admin role updates persist each role and omitted fields preserve restrictions", async () => {
  for (const role of ["ADMIN", "EDITOR", "ENCODER", "VIEWER", undefined]) {
    let saved: Record<string, unknown> | undefined;
    const database = { user: {
      findUnique: async () => ({ id: "target", role: "USER", accessLevel: "VIEWER", isActive: false }),
      update: async ({ data }: { data: Record<string, unknown> }) => { saved = data; },
    } };
    const route = endpoint("app/api/accounts/[id]/route.ts", { id: "admin", role: "ADMIN" }, database);
    const response = await route.PATCH(new Request("http://localhost/test", { method: "PATCH", body: JSON.stringify({ displayName: "Test", username: "test", role }) }), { params: Promise.resolve({ id: "target" }) });
    assert.equal(response.status, 200);
    assert.equal(saved?.role, roleData(role ?? "VIEWER")?.role);
    assert.equal(saved?.accessLevel, roleData(role ?? "VIEWER")?.accessLevel);
    assert.equal(saved?.isActive, false);
  }
});

test("admin cannot remove own administrative access", async () => {
  const database = { user: {
    findUnique: async () => ({ id: "admin", role: "ADMIN", accessLevel: null, isActive: true }),
    update: async () => { assert.fail("Self-demotion must not be persisted"); },
  } };
  const route = endpoint("app/api/accounts/[id]/route.ts", { id: "admin", role: "ADMIN" }, database);
  for (const change of [{ role: "VIEWER" }, { isActive: false }]) {
    const response = await route.PATCH(new Request("http://localhost/test", { method: "PATCH", body: JSON.stringify({ displayName: "Admin", username: "admin", ...change }) }), { params: Promise.resolve({ id: "admin" }) });
    assert.equal(response.status, 400);
  }
});

test("admin and editor pass the project action guard", async () => {
  for (const role of ["ADMIN", "EDITOR"]) {
    const actions = endpoint("app/actions.ts", { id: "user", ...roleData(role) });
    const form = new FormData();
    form.set("itemNumber", "200");
    form.set("description", "Test item");
    // The persistence sentinel proves the real action reached the write only for allowed roles.
    const createItem = actions.createItem as unknown as (id: string, form: FormData) => Promise<unknown>;
    await assert.rejects(() => createItem("project", form), /accessed persistence/);
  }
});
