import bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { AdminRepo } from "../src/modules/admin/repo";
import { InMemoryAuthRepo } from "./fake-auth-repo";
import { FakeStorage } from "./fake-founder";
import { fakeAdminRepo, json, makeApp, makeAuth, sessionCookie } from "./helpers";

const PASSWORD = "correct horse battery";
let HASH: string;
beforeAll(async () => {
  HASH = await bcrypt.hash(PASSWORD, 4);
});

const ID = "6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a";
const TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";

const jsonReq = (method: string, body: unknown, cookie?: string) => ({
  method,
  headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
  body: JSON.stringify(body),
});

async function setup(repo: Partial<AdminRepo> = {}, storage = new FakeStorage()) {
  const authRepo = new InMemoryAuthRepo();
  const admin = authRepo.addUser({ email: "admin@orion.africa", passwordHash: HASH, role: "admin", onboardingCompleted: true });
  authRepo.addUser({ email: "member@acme.co", passwordHash: HASH, role: "member", onboardingCompleted: true });
  const app = makeApp({
    auth: makeAuth(authRepo),
    admin: { repo: fakeAdminRepo(repo), storage },
    partners: { list: async () => [], getLogo: async () => null },
  });
  const login = async (email: string) =>
    sessionCookie(await app.request("/v1/auth/login", jsonReq("POST", { email, password: PASSWORD })))!;
  return { app, admin, storage, adminCookie: await login("admin@orion.africa"), memberCookie: await login("member@acme.co") };
}

// A sample of every route shape under /v1/admin.
const ADMIN_ROUTES: Array<[string, string, unknown?]> = [
  ["GET", "/v1/admin/users"],
  ["GET", "/v1/admin/users/stats"],
  ["PATCH", `/v1/admin/users/${ID}/role`, { role: "admin" }],
  ["PATCH", `/v1/admin/users/${ID}/status`, { status: "suspended" }],
  ["GET", "/v1/admin/templates"],
  ["GET", "/v1/admin/templates/status-counts"],
  ["GET", "/v1/admin/templates/options"],
  ["GET", `/v1/admin/templates/${ID}`],
  ["POST", "/v1/admin/templates", { name: "x" }],
  ["POST", `/v1/admin/templates/${ID}/publish`],
  ["DELETE", `/v1/admin/templates/${ID}`],
  ["POST", `/v1/admin/templates/${ID}/sections`, { title: "x" }],
  ["DELETE", `/v1/admin/questions/${ID}`],
  ["DELETE", `/v1/admin/rules/${ID}`],
  ["GET", "/v1/admin/submissions"],
  ["GET", `/v1/admin/submissions/${ID}`],
  ["GET", "/v1/admin/audit"],
  ["GET", "/v1/admin/partners"],
  ["DELETE", `/v1/admin/partners/${ID}`],
  ["GET", `/v1/admin/uploads/${ID}/download`],
];

describe("admin access control", () => {
  it.each(ADMIN_ROUTES)("%s %s is closed to signed-out users (401) and members (403)", async (method, path, body) => {
    const { app, memberCookie } = await setup(); // repo methods all throw: reaching one would 500
    const anon = await app.request(path, body ? jsonReq(method, body) : { method });
    expect(anon.status).toBe(401);
    const member = await app.request(path, body ? jsonReq(method, body, memberCookie) : { method, headers: { Cookie: memberCookie } });
    expect(member.status).toBe(403);
  });

  it("lets admins through", async () => {
    const listUsers = vi.fn(async () => ({ items: [], total: 0, page: 2, perPage: 20, totalPages: 1 }));
    const { app, adminCookie } = await setup({ listUsers });
    const res = await app.request("/v1/admin/users?q=ada&page=2", { headers: { Cookie: adminCookie } });
    expect(res.status).toBe(200);
    expect(listUsers).toHaveBeenCalledWith("ada", 2);
  });

  it("does not leak the admin gate onto public routes", async () => {
    const { app } = await setup();
    expect((await app.request("/healthz")).status).toBe(200);
    expect((await app.request("/v1/partners")).status).toBe(200);
  });
});

describe("users", () => {
  it("stops an admin suspending or demoting themselves", async () => {
    const { app, admin, adminCookie } = await setup();
    const suspend = await app.request(`/v1/admin/users/${admin.id}/status`, jsonReq("PATCH", { status: "suspended" }, adminCookie));
    expect(suspend.status).toBe(400);
    expect((await json(suspend)).error.message).toBe("You cannot suspend your own admin account.");
    const demote = await app.request(`/v1/admin/users/${admin.id}/role`, jsonReq("PATCH", { role: "member" }, adminCookie));
    expect(demote.status).toBe(400);
  });

  it("passes the acting admin to the repo and 404s unknown users", async () => {
    const setUserStatus = vi.fn<AdminRepo["setUserStatus"]>(async () => null);
    const { app, admin, adminCookie } = await setup({ setUserStatus });
    const res = await app.request(`/v1/admin/users/${ID}/status`, jsonReq("PATCH", { status: "suspended" }, adminCookie));
    expect(res.status).toBe(404);
    expect((await json(res)).error.message).toBe("User not found.");
    expect(setUserStatus).toHaveBeenCalledWith(admin.id, ID, "suspended");
  });

  it("rejects an invalid role", async () => {
    const { app, adminCookie } = await setup();
    expect((await app.request(`/v1/admin/users/${ID}/role`, jsonReq("PATCH", { role: "owner" }, adminCookie))).status).toBe(400);
  });
});

describe("assessment builder", () => {
  it("refuses to delete a published template", async () => {
    const { app, adminCookie } = await setup({ deleteTemplate: async () => "published" });
    const res = await app.request(`/v1/admin/templates/${TEMPLATE_ID}`, { method: "DELETE", headers: { Cookie: adminCookie } });
    expect(res.status).toBe(409);
    expect((await json(res)).error.message).toContain("Archive first");
  });

  it("reports the template id so the admin app can revalidate", async () => {
    const createQuestion = vi.fn<AdminRepo["createQuestion"]>(async () => ({ id: ID, templateId: TEMPLATE_ID }));
    const { app, adminCookie } = await setup({ createQuestion });
    const res = await app.request(
      `/v1/admin/sections/${ID}/questions`,
      jsonReq("POST", { questionKey: "has_nda", prompt: "Do you have an NDA?", options: { choices: ["Yes", "No"] } }, adminCookie),
    );
    expect(res.status).toBe(201);
    expect((await json(res)).data).toEqual({ id: ID, templateId: TEMPLATE_ID });
    expect(createQuestion.mock.calls[0][2]).toMatchObject({
      options: { choices: ["Yes", "No"] },
      inputType: "text",
      required: true,
      weight: 1,
      domain: null,
    });
  });

  it("validates question and rule bodies", async () => {
    const { app, adminCookie } = await setup();
    const badQuestion = await app.request(`/v1/admin/sections/${ID}/questions`, jsonReq("POST", { questionKey: "", prompt: "x", weight: -5 }, adminCookie));
    expect(badQuestion.status).toBe(400);
    const badRule = await app.request(
      `/v1/admin/templates/${ID}/rules`,
      jsonReq("POST", { name: "r", condition: null, severity: "huge", resolutionPath: "self_serve", recommendationTitle: "t", recommendationDescription: "d" }, adminCookie),
    );
    expect(badRule.status).toBe(400);
  });

  it("404s when the parent template is missing", async () => {
    const { app, adminCookie } = await setup({ createSection: async () => null });
    const res = await app.request(`/v1/admin/templates/${ID}/sections`, jsonReq("POST", { title: "Corporate" }, adminCookie));
    expect(res.status).toBe(404);
  });
});

describe("partners & uploads", () => {
  it("uploads a logo to storage and records the partner", async () => {
    const createPartner = vi.fn<AdminRepo["createPartner"]>(async () => {});
    const { app, admin, adminCookie, storage } = await setup({ createPartner });
    const post = (file: File) => {
      const form = new FormData();
      form.append("name", " Acme Ventures ");
      form.append("logo", file);
      return app.request("/v1/admin/partners", { method: "POST", headers: { Cookie: adminCookie }, body: form });
    };
    expect((await post(new File(["x"], "logo.pdf", { type: "application/pdf" }))).status).toBe(400);

    const res = await post(new File(["png"], "Logo.PNG", { type: "image/png" }));
    expect(res.status).toBe(201);
    const { id } = (await json(res)).data;
    expect(storage.objects.has(`partners/${id}/logo.png`)).toBe(true);
    expect(createPartner).toHaveBeenCalledWith(admin.id, expect.objectContaining({ id, name: "Acme Ventures", contentType: "image/png" }));
  });

  it("deletes the partner's logo object", async () => {
    const storage = new FakeStorage();
    await storage.put("partners/x/logo.png", "png", "image/png");
    const { app, adminCookie } = await setup({ deletePartner: async () => "partners/x/logo.png" }, storage);
    const res = await app.request(`/v1/admin/partners/${ID}`, { method: "DELETE", headers: { Cookie: adminCookie } });
    expect(res.status).toBe(200);
    expect(storage.objects.size).toBe(0);
  });

  it("redirects upload downloads to a signed URL", async () => {
    const { app, adminCookie } = await setup({ findUploadStorageKey: async () => "s/assessments/a/q/file.pdf" });
    const res = await app.request(`/v1/admin/uploads/${ID}/download`, { headers: { Cookie: adminCookie } });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toMatch(/^https:\/\/storage\.example\//);
  });
});

describe("first-admin bootstrap (public)", () => {
  const body = { name: "Ada Admin", email: " Ada@Orion.Africa ", password: "longenough" };

  it("is locked once an admin exists", async () => {
    const createFirstAdmin = vi.fn();
    const { app } = await setup({ hasAdmin: async () => true, createFirstAdmin });
    expect((await json(await app.request("/v1/bootstrap/admin"))).data).toEqual({ hasAdmin: true });
    const res = await app.request("/v1/bootstrap/admin", jsonReq("POST", body));
    expect(res.status).toBe(409);
    expect(createFirstAdmin).not.toHaveBeenCalled();
  });

  it("creates the first admin with a bcrypt hash and normalised email", async () => {
    const createFirstAdmin = vi.fn<AdminRepo["createFirstAdmin"]>(async () => "ok");
    const { app } = await setup({ hasAdmin: async () => false, createFirstAdmin });
    const res = await app.request("/v1/bootstrap/admin", jsonReq("POST", body));
    expect(res.status).toBe(201);
    const input = createFirstAdmin.mock.calls[0][0];
    expect(input.email).toBe("ada@orion.africa");
    expect(await bcrypt.compare("longenough", input.passwordHash)).toBe(true);
  });

  it("validates input and reports a taken email", async () => {
    const { app } = await setup({ hasAdmin: async () => false, createFirstAdmin: async () => "email_taken" });
    expect((await app.request("/v1/bootstrap/admin", jsonReq("POST", { ...body, password: "short" }))).status).toBe(400);
    expect((await app.request("/v1/bootstrap/admin", jsonReq("POST", body))).status).toBe(409);
  });
});
