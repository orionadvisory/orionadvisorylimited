import { templates } from "@orion/core/documents/templates";
import bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ApiError } from "../src/lib/errors";
import { RateLimiter } from "../src/lib/rate-limit";
import type { FounderRepo, TemplateBundle } from "../src/modules/founder/repo";
import { InMemoryAuthRepo } from "./fake-auth-repo";
import { FakeLlm, FakeStorage, fakeRepo, founderDeps, generousLimits } from "./fake-founder";
import { json, makeApp, makeAuth, sessionCookie } from "./helpers";

const PASSWORD = "correct horse battery";
let HASH: string;
beforeAll(async () => {
  HASH = await bcrypt.hash(PASSWORD, 4); // low cost: speed only, format identical
});

const TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";
const STARTUP = { id: "22222222-2222-4222-8222-222222222222", name: "Acme", stage: null, structure: null, primaryJurisdiction: null, riskScore: null };
const BUNDLE: TemplateBundle = {
  template: { id: TEMPLATE_ID, name: "Legal Health Check" },
  sections: [{ id: "s1", title: "Corporate" }],
  questions: [
    { id: "q1", sectionId: "s1", questionKey: "incorporated", prompt: "Is the company incorporated?", domain: "corporate" },
    { id: "q2", sectionId: "s1", questionKey: "articles", prompt: "Upload your articles", domain: "corporate" },
  ],
};
const AI_RESULT = {
  overallScore: 62,
  riskLevel: "medium",
  summary: "Some gaps.",
  domainScores: { corporate: { score: 62, issues: 1 } },
  issues: [{ title: "No founder agreement", description: "x", domain: "corporate", severity: "high", resolutionPath: "document_generation" }],
  priorityActions: ["Sign a founders agreement"],
};

const post = (body: unknown, cookie?: string) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
  body: JSON.stringify(body),
});

/** App + a signed-in member. */
async function setup(over: Parameters<typeof founderDeps>[0] = {}) {
  const authRepo = new InMemoryAuthRepo();
  const user = authRepo.addUser({ email: "founder@acme.co", passwordHash: HASH, onboardingCompleted: true });
  const founder = founderDeps(over);
  const app = makeApp({ auth: makeAuth(authRepo), founder });
  const login = await app.request("/v1/auth/login", post({ email: "founder@acme.co", password: PASSWORD }));
  return { app, user, founder, cookie: sessionCookie(login)! };
}

const ENTITY = {
  id: "55555555-5555-4555-8555-555555555555",
  name: "Acme Nigeria Limited",
  tradingName: "Acme NG",
  legalType: "Private company limited by shares",
  jurisdiction: "Nigeria",
  state: "Lagos",
  registrationNumber: "RC 1234567",
  registeredAddress: null,
  industry: "Technology / SaaS",
  financialYearEnd: "12-31",
  taxId: null,
  role: "operating",
  status: "active" as const,
  incorporatedAt: "2024-01-10T00:00:00.000Z",
  createdAt: "2026-11-25T10:00:00.000Z",
  updatedAt: "2026-11-25T10:00:00.000Z",
};

const OBLIGATION = {
  id: "66666666-6666-4666-8666-666666666666", entityId: ENTITY.id, entityName: ENTITY.name,
  ruleId: null, title: "CAC annual return", regulator: "Corporate Affairs Commission", category: "corporate",
  status: "needs_confirmation" as const, dueAt: null, dateStatus: "pending_confirmation" as const,
  explanation: "Confirm the incorporation anniversary and filing history.", source: "user" as const,
  completedAt: null, createdAt: "2026-11-25T10:00:00.000Z", updatedAt: "2026-11-25T10:00:00.000Z",
};

describe("ORION 2 compliance obligations", () => {
  it("lists the signed-in workspace obligations without caching", async () => {
    const listObligations = vi.fn<FounderRepo["listObligations"]>(async () => [OBLIGATION]);
    const { app, cookie, user } = await setup({ repo: fakeRepo({ listObligations }) });
    const res = await app.request("/v1/obligations", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200); expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect((await json(res)).data[0].dateStatus).toBe("pending_confirmation");
    expect(listObligations).toHaveBeenCalledWith(user.id);
  });
  it("creates an obligation without inventing a date", async () => {
    const createObligation = vi.fn<FounderRepo["createObligation"]>(async () => OBLIGATION);
    const { app, cookie, user } = await setup({ repo: fakeRepo({ createObligation }) });
    const body = { entityId: ENTITY.id, title: " CAC annual return ", category: "corporate" };
    const res = await app.request("/v1/obligations", post(body, cookie));
    expect(res.status).toBe(201);
    expect(createObligation).toHaveBeenCalledWith(user.id, { ...body, title: "CAC annual return" });
  });
  it("returns 404 for an obligation outside the workspace", async () => {
    const updateObligation = vi.fn<FounderRepo["updateObligation"]>(async () => null);
    const { app, cookie } = await setup({ repo: fakeRepo({ updateObligation }) });
    const res = await app.request(`/v1/obligations/${OBLIGATION.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ status: "completed" }) });
    expect(res.status).toBe(404);
  });
});

describe("ORION 2 entities", () => {
  it("requires a session", async () => {
    const { app } = await setup();
    expect((await app.request("/v1/entities")).status).toBe(401);
  });

  it("lists only the signed-in workspace and disables caching", async () => {
    const listEntities = vi.fn<FounderRepo["listEntities"]>(async () => [ENTITY]);
    const { app, cookie, user } = await setup({ repo: fakeRepo({ listEntities }) });
    const res = await app.request("/v1/entities?includeArchived=true", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect((await json(res)).data[0].name).toBe("Acme Nigeria Limited");
    expect(listEntities).toHaveBeenCalledWith(user.id, true);
  });

  it("validates and creates an entity", async () => {
    const createEntity = vi.fn<FounderRepo["createEntity"]>(async () => ENTITY);
    const { app, cookie, user } = await setup({ repo: fakeRepo({ createEntity }) });
    const body = { name: " Acme Nigeria Limited ", legalType: ENTITY.legalType, jurisdiction: "Nigeria", financialYearEnd: "12-31" };
    const res = await app.request("/v1/entities", post(body, cookie));
    expect(res.status).toBe(201);
    expect(createEntity).toHaveBeenCalledWith(user.id, { ...body, name: "Acme Nigeria Limited" });

    const invalid = await app.request("/v1/entities", post({ ...body, financialYearEnd: "December" }, cookie));
    expect(invalid.status).toBe(400);
  });

  it("does not reveal an entity outside the caller's workspace", async () => {
    const updateEntity = vi.fn<FounderRepo["updateEntity"]>(async () => null);
    const { app, cookie, user } = await setup({ repo: fakeRepo({ updateEntity }) });
    const res = await app.request(`/v1/entities/${ENTITY.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "archived" }),
    });
    expect(res.status).toBe(404);
    expect(updateEntity).toHaveBeenCalledWith(user.id, ENTITY.id, { status: "archived" });
  });
});

describe("dashboard, issues, referrals", () => {
  it("requires a session", async () => {
    const { app } = await setup();
    for (const path of ["/v1/me/dashboard", "/v1/issues", "/v1/referrals", "/v1/documents"]) {
      expect((await app.request(path)).status, path).toBe(401);
    }
  });

  it("returns the dashboard for the signed-in user", async () => {
    const getDashboard = vi.fn(async () => ({
      user: { id: "x", name: "Ada", email: "a@b.co", role: "member" as const, status: "active" as const },
      startup: null,
      stats: { documentCount: 0, issueCount: 0, resolvedCount: 0, criticalCount: 0 },
      issues: [],
      recentDocs: [],
      healthCheck: null,
    }));
    const { app, cookie, user } = await setup({ repo: fakeRepo({ getDashboard }) });
    const res = await app.request("/v1/me/dashboard", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect((await json(res)).data.user.name).toBe("Ada");
    expect(getDashboard).toHaveBeenCalledWith(user.id);
  });

  it("refuses to refer an issue that isn't yours (no IDOR)", async () => {
    const createReferral = vi.fn(async () => "x");
    const { app, cookie } = await setup({
      repo: fakeRepo({ findIssueForUser: async () => null, createReferral }),
    });
    const res = await app.request(
      "/v1/referrals",
      post({ issueId: "33333333-3333-4333-8333-333333333333", issueSummary: "help" }, cookie),
    );
    expect(res.status).toBe(404);
    expect(createReferral).not.toHaveBeenCalled();
  });

  it("creates a referral for your own issue, using the issue's startup", async () => {
    const createReferral = vi.fn<FounderRepo["createReferral"]>(async () => "44444444-4444-4444-8444-444444444444");
    const { app, cookie, user } = await setup({
      repo: fakeRepo({
        findIssueForUser: async () => ({ id: "i1", title: "No NDA", startupId: STARTUP.id }),
        createReferral,
      }),
    });
    const res = await app.request(
      "/v1/referrals",
      post({ issueId: "33333333-3333-4333-8333-333333333333", issueSummary: "  help please " }, cookie),
    );
    expect(res.status).toBe(201);
    expect(createReferral).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.id, startupId: STARTUP.id, issueSummary: "help please", issueTitle: "No NDA" }),
    );
  });
});

describe("assessment drafts", () => {
  it("validates the draft payload", async () => {
    const { app, cookie } = await setup();
    const res = await app.request(`/v1/assessments/${TEMPLATE_ID}/draft`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ answers: { a: 1 }, currentSectionIdx: -1 }),
    });
    expect(res.status).toBe(400);
  });

  it("round-trips a draft for the caller only", async () => {
    const saveDraft = vi.fn<FounderRepo["saveDraft"]>(async () => new Date("2026-11-24T10:00:00Z"));
    const { app, cookie, user } = await setup({ repo: fakeRepo({ saveDraft }) });
    const payload = { answers: { a: "yes", b: ["x", "y"] }, currentSectionIdx: 1, completedSectionIds: ["s1"] };
    const res = await app.request(`/v1/assessments/${TEMPLATE_ID}/draft`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(200);
    expect((await json(res)).data.updatedAt).toBe("2026-11-24T10:00:00.000Z");
    expect(saveDraft).toHaveBeenCalledWith(user.id, TEMPLATE_ID, payload);
  });
});

describe("POST /v1/health-check (scoring)", () => {
  it("scores a guest questionnaire and tolerates fenced JSON", async () => {
    const llm = new FakeLlm(["```json\n" + JSON.stringify(AI_RESULT) + "\n```"]);
    const { app } = await setup({ llm, repo: fakeRepo({ getTemplateBundle: async () => BUNDLE }) });
    const res = await app.request("/v1/health-check", post({ templateId: TEMPLATE_ID, answers: { incorporated: "No" } }));
    expect(res.status).toBe(200);
    const { data } = await json(res);
    expect(data).toMatchObject({ overallScore: 62, templateId: TEMPLATE_ID, answeredQuestions: 1, totalQuestions: 2 });
    expect(llm.calls[0].messages[1].content).toContain("Q: Is the company incorporated?\nA: No");
  });

  it("never reads a storage key supplied by the client (guest)", async () => {
    const storage = new FakeStorage();
    await storage.put("other-startup/secret.pdf", "TOP SECRET TERM SHEET", "text/plain");
    const llm = new FakeLlm([JSON.stringify(AI_RESULT)]);
    const { app } = await setup({ llm, storage, repo: fakeRepo({ getTemplateBundle: async () => BUNDLE }) });
    const answers = {
      incorporated: "Yes",
      articles__file: JSON.stringify({ uploadId: "u1", fileName: "x.pdf", storageKey: "other-startup/secret.pdf" }),
    };
    const res = await app.request("/v1/health-check", post({ templateId: TEMPLATE_ID, answers }));
    expect(res.status).toBe(200);
    expect(storage.reads).toEqual([]);
    expect(JSON.stringify(llm.calls)).not.toContain("TOP SECRET");
  });

  it("signed-in: reads only the caller's own upload, by uploadId, ignoring the client storage key", async () => {
    const storage = new FakeStorage();
    await storage.put("mine/articles.txt", "OUR ARTICLES", "text/plain");
    await storage.put("other-startup/secret.pdf", "TOP SECRET", "text/plain");
    const findUploadForUser = vi.fn(async (uploadId: string) =>
      uploadId === "mine" ? { storageKey: "mine/articles.txt", name: "articles.txt" } : null,
    );
    const llm = new FakeLlm([JSON.stringify(AI_RESULT)]);
    const { app, cookie, user } = await setup({
      llm,
      storage,
      repo: fakeRepo({ getTemplateBundle: async () => BUNDLE, findUploadForUser }),
    });
    const answers = {
      articles__file: JSON.stringify({ uploadId: "mine", storageKey: "other-startup/secret.pdf" }),
      incorporated__file: JSON.stringify({ uploadId: "theirs", storageKey: "other-startup/secret.pdf" }),
    };
    expect((await app.request("/v1/health-check", post({ templateId: TEMPLATE_ID, answers }, cookie))).status).toBe(200);
    expect(storage.reads).toEqual(["mine/articles.txt"]);
    expect(findUploadForUser).toHaveBeenCalledWith("theirs", user.id);
    const prompt = llm.calls[0].messages[1].content;
    expect(prompt).toContain("OUR ARTICLES");
    expect(prompt).not.toContain("TOP SECRET");
  });

  it("502s on non-JSON or invalid model output without leaking it", async () => {
    for (const bad of ["Sorry, I can't help with that SECRET-RAW", JSON.stringify({ summary: "no score" })]) {
      const { app } = await setup({ llm: new FakeLlm([bad]), repo: fakeRepo({ getTemplateBundle: async () => BUNDLE }) });
      const res = await app.request("/v1/health-check", post({ templateId: TEMPLATE_ID, answers: { incorporated: "No" } }));
      expect(res.status).toBe(502);
      expect(JSON.stringify(await json(res))).not.toContain("SECRET-RAW");
    }
  });

  it("404s for an unknown template", async () => {
    const { app } = await setup({ repo: fakeRepo({ getTemplateBundle: async () => null }) });
    const res = await app.request("/v1/health-check", post({ templateId: TEMPLATE_ID, answers: { a: "b" } }));
    expect(res.status).toBe(404);
  });

  it("rate-limits guests per IP", async () => {
    const limits = { ...generousLimits(), guestScoringPerIp: new RateLimiter(1, 60_000) };
    const llm = new FakeLlm([JSON.stringify(AI_RESULT), JSON.stringify(AI_RESULT)]);
    const { app } = await setup({ llm, limits, repo: fakeRepo({ getTemplateBundle: async () => BUNDLE }) });
    const req = () =>
      app.request("/v1/health-check", {
        ...post({ templateId: TEMPLATE_ID, answers: { incorporated: "No" } }),
        headers: { "Content-Type": "application/json", "x-orion-client-ip": "203.0.113.9" },
      });
    expect((await req()).status).toBe(200);
    expect((await req()).status).toBe(429);
  });
});

describe("POST /v1/onboarding/complete", () => {
  it("rejects an out-of-range score", async () => {
    const { app, cookie } = await setup();
    const res = await app.request(
      "/v1/onboarding/complete",
      post({ templateId: TEMPLATE_ID, answers: {}, result: { ...AI_RESULT, overallScore: 150 } }, cookie),
    );
    expect(res.status).toBe(400);
  });

  it("saves with the startup name from the answers", async () => {
    const completeOnboarding = vi.fn<FounderRepo["completeOnboarding"]>(async () => "55555555-5555-4555-8555-555555555555");
    const { app, cookie, user } = await setup({ repo: fakeRepo({ completeOnboarding }) });
    const res = await app.request(
      "/v1/onboarding/complete",
      post({ templateId: TEMPLATE_ID, answers: { __startup_name: "  Acme Ltd  " }, result: AI_RESULT }, cookie),
    );
    expect(res.status).toBe(200);
    expect(completeOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.id, templateId: TEMPLATE_ID, startupName: "Acme Ltd" }),
    );
  });
});

describe("documents", () => {
  const template = templates[0];
  const requiredField = template.fields.find((f) => f.required)!;
  const allFields = Object.fromEntries(template.fields.map((f) => [f.id, "value"]));

  it("404s an unknown template and 400s a missing required field", async () => {
    const { app, cookie } = await setup();
    expect((await app.request("/v1/documents/generate", post({ templateId: "nope", fields: {} }, cookie))).status).toBe(404);
    const missing = { ...allFields, [requiredField.id]: "" };
    const res = await app.request("/v1/documents/generate", post({ templateId: template.id, fields: missing }, cookie));
    expect(res.status).toBe(400);
    expect((await json(res)).error.message).toContain(requiredField.label);
  });

  it("generates, stores and records a document", async () => {
    const storage = new FakeStorage();
    const createGeneratedDocument = vi.fn<FounderRepo["createGeneratedDocument"]>(async (i) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      createdAt: new Date("2026-11-24T10:00:00Z"),
    }));
    const { app, cookie } = await setup({
      storage,
      llm: new FakeLlm(["## Agreement\nText"]),
      repo: fakeRepo({ getOrCreateStartup: async () => STARTUP, createGeneratedDocument }),
    });
    const res = await app.request("/v1/documents/generate", post({ templateId: template.id, fields: allFields }, cookie));
    expect(res.status).toBe(201);
    const { data } = await json(res);
    expect(data.content).toBe("## Agreement\nText");
    const [key] = [...storage.objects.keys()];
    expect(key).toMatch(new RegExp(`^${STARTUP.id}/generated/${data.id}/`));
    expect(createGeneratedDocument).toHaveBeenCalledWith(expect.objectContaining({ storageKey: key, startupId: STARTUP.id }));
  });

  it("download: 404 when not yours, 302 to a signed URL, or markdown attachment", async () => {
    const id = "66666666-6666-4666-8666-666666666666";
    const cases: Array<[Awaited<ReturnType<FounderRepo["findDocumentForUser"]>>, number]> = [
      [null, 404],
      [{ name: "NDA", storageKey: "s/generated/x.md", content: "c" }, 302],
      [{ name: 'Evil"\r\nX-Injected: 1', storageKey: null, content: "# Doc" }, 200],
    ];
    for (const [doc, status] of cases) {
      const { app, cookie } = await setup({ repo: fakeRepo({ findDocumentForUser: async () => doc }) });
      const res = await app.request(`/v1/documents/${id}/download`, { headers: { Cookie: cookie } });
      expect(res.status).toBe(status);
      if (status === 302) expect(res.headers.get("Location")).toMatch(/^https:\/\/storage\.example\//);
      if (status === 200) {
        expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="Evil_X-Injected__1.md"');
        expect(res.headers.get("X-Injected")).toBeNull();
      }
    }
  });

  it("upload: validates type and sanitises the storage key", async () => {
    const storage = new FakeStorage();
    const createUpload = vi.fn<FounderRepo["createUpload"]>(async () => {});
    const { app, cookie } = await setup({
      storage,
      repo: fakeRepo({ getOrCreateStartup: async () => STARTUP, createUpload }),
    });
    const send = (file: File, extra: Record<string, string> = {}) => {
      const form = new FormData();
      form.append("file", file);
      for (const [k, v] of Object.entries(extra)) form.append(k, v);
      return app.request("/v1/documents/upload", { method: "POST", headers: { Cookie: cookie }, body: form });
    };

    expect((await send(new File(["x"], "a.exe", { type: "application/x-msdownload" }))).status).toBe(400);
    expect((await send(new File(["x"], "a.pdf", { type: "application/pdf" }), { assessmentId: "../../x" })).status).toBe(400);

    const ok = await send(new File(["%PDF"], "../../evil name.pdf", { type: "application/pdf" }));
    expect(ok.status).toBe(201);
    const { data } = await json(ok);
    expect(data.storageKey).toBe(`${STARTUP.id}/uploads/${data.uploadId}/evil_name.pdf`);
    expect(storage.objects.has(data.storageKey)).toBe(true);
    expect(createUpload).toHaveBeenCalledWith(expect.objectContaining({ id: data.uploadId, mimeType: "application/pdf" }));
  });
});

describe("POST /v1/chat", () => {
  it("streams SSE chunks, saves both messages, and ignores a client startupId", async () => {
    const getChatContext = vi.fn<FounderRepo["getChatContext"]>(async () => ({ startup: STARTUP, issues: [], history: [] }));
    const saveChatMessage = vi.fn<FounderRepo["saveChatMessage"]>(async () => {});
    const { app, cookie, user } = await setup({
      llm: new FakeLlm([], ["Hello", " founder"]),
      repo: fakeRepo({ getChatContext, saveChatMessage }),
    });
    const res = await app.request(
      "/v1/chat",
      post({ message: "What is a SAFE?", startupId: "99999999-9999-4999-8999-999999999999" }, cookie),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await res.text()).toBe('data: {"content":"Hello"}\n\ndata: {"content":" founder"}\n\ndata: [DONE]\n\n');
    expect(getChatContext).toHaveBeenCalledWith(user.id);
    expect(saveChatMessage.mock.calls.map(([m]) => [m.role, m.content, m.startupId])).toEqual([
      ["user", "What is a SAFE?", STARTUP.id],
      ["assistant", "Hello founder", STARTUP.id],
    ]);
  });

  it("502s before streaming if the model is unavailable", async () => {
    const { app, cookie } = await setup({
      llm: new FakeLlm([], new Error("provider down")),
      repo: fakeRepo({ getChatContext: async () => ({ startup: STARTUP, issues: [], history: [] }) }),
    });
    expect((await app.request("/v1/chat", post({ message: "hi" }, cookie))).status).toBe(502);
  });
});

describe("ORION 2 workspace team access", () => {
  const MEMBER = {
    id: "77777777-7777-4777-8777-777777777777", userId: "88888888-8888-4888-8888-888888888888",
    name: "Ada Accountant", email: "ada@ledger.ng", role: "external_adviser" as const,
    entityScope: "selected" as const, entityIds: [ENTITY.id], createdAt: "2026-11-26T10:00:00.000Z",
  };

  it("requires a session", async () => {
    const { app } = await setup();
    expect((await app.request("/v1/workspace/members")).status).toBe(401);
  });

  it("returns the caller's role and permissions without caching", async () => {
    const getWorkspaceAccess = vi.fn<FounderRepo["getWorkspaceAccess"]>(async () => ({
      workspaceId: STARTUP.id, workspaceName: "Acme", role: "viewer", entityScope: "all", entityIds: null,
      permissions: ["entity:read", "obligation:read"],
    }));
    const { app, cookie, user } = await setup({ repo: fakeRepo({ getWorkspaceAccess }) });
    const res = await app.request("/v1/workspace", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect((await json(res)).data.role).toBe("viewer");
    expect(getWorkspaceAccess).toHaveBeenCalledWith(user.id);
  });

  it("adds a scoped member with a normalised email", async () => {
    const addMember = vi.fn<FounderRepo["addMember"]>(async () => MEMBER);
    const { app, cookie, user } = await setup({ repo: fakeRepo({ addMember }) });
    const res = await app.request("/v1/workspace/members", post({ email: " Ada@Ledger.NG ", role: "external_adviser", entityIds: [ENTITY.id] }, cookie));
    expect(res.status).toBe(201);
    expect(addMember).toHaveBeenCalledWith(user.id, { email: "ada@ledger.ng", role: "external_adviser", entityIds: [ENTITY.id] });
  });

  it("rejects an unknown role", async () => {
    const { app, cookie } = await setup();
    const res = await app.request("/v1/workspace/members", post({ email: "ada@ledger.ng", role: "superuser" }, cookie));
    expect(res.status).toBe(400);
  });

  it("surfaces a permission denial from the repo as 403", async () => {
    const listMembers = vi.fn<FounderRepo["listMembers"]>(async () => {
      throw new ApiError(403, "forbidden", "Your role in this workspace does not allow this action");
    });
    const { app, cookie } = await setup({ repo: fakeRepo({ listMembers }) });
    const res = await app.request("/v1/workspace/members", { headers: { Cookie: cookie } });
    expect(res.status).toBe(403);
    expect((await json(res)).error.code).toBe("forbidden");
  });

  it("returns 404 when updating or removing a member outside the workspace", async () => {
    const updateMember = vi.fn<FounderRepo["updateMember"]>(async () => null);
    const removeMember = vi.fn<FounderRepo["removeMember"]>(async () => false);
    const { app, cookie } = await setup({ repo: fakeRepo({ updateMember, removeMember }) });
    const patch = await app.request(`/v1/workspace/members/${MEMBER.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ role: "viewer" }),
    });
    expect(patch.status).toBe(404);
    const del = await app.request(`/v1/workspace/members/${MEMBER.id}`, { method: "DELETE", headers: { Cookie: cookie } });
    expect(del.status).toBe(404);
  });
});
