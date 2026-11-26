"use server";

import { sessionApi } from "@orion/session/api";
import { revalidatePath } from "next/cache";
import { AdminApiError, failureMessage, reviveDates } from "@/lib/api";

/**
 * Admin console actions. Form parsing and user-facing messages live here; all data
 * access, authorisation and audit logging happen in the Orion API (/v1/admin/*).
 */

// ─── Types ──────────────────────────────────────────────

export type ActionState = { error: string | null };

type UserRole = "member" | "admin";
type UserStatus = "active" | "suspended";
type Severity = "critical" | "high" | "medium" | "low" | "info";
type ResolutionPath = "self_serve" | "document_generation" | "expert_referral";

const ROLES: UserRole[] = ["member", "admin"];
const USER_STATUSES: UserStatus[] = ["active", "suspended"];

// ─── Helpers ────────────────────────────────────────────

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const raw = getString(formData, key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBoolean(formData: FormData, key: string, fallback = false) {
  const value = formData.get(key);
  if (value === null) return fallback;
  if (typeof value === "string") return value === "true" || value === "on" || value === "1";
  return true;
}

function parseJsonInput(raw: string) {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const ok = (): ActionState => ({ error: null });
const err = (message: string): ActionState => ({ error: message });

function revalidateAssessments(templateId?: string | null) {
  revalidatePath("/admin/assessments");
  if (templateId) revalidatePath(`/admin/assessments/${templateId}`);
}

/** Run a mutation; on success revalidate, on failure surface the API's message. */
async function mutate(
  send: () => Promise<Response>,
  onSuccess: (data: { templateId?: string | null }) => void,
): Promise<ActionState> {
  try {
    const res = await send();
    if (!res.ok) return err(await failureMessage(res));
    const body = (await res.json().catch(() => ({}))) as { data?: { templateId?: string | null } };
    onSuccess(body.data ?? {});
    return ok();
  } catch (e) {
    console.error("[admin] mutation failed", e);
    return err("Something went wrong. Please try again.");
  }
}

function questionInput(formData: FormData) {
  return {
    questionKey: getString(formData, "questionKey"),
    prompt: getString(formData, "prompt"),
    description: getString(formData, "description") || undefined,
    inputType: getString(formData, "inputType") || "text",
    options: parseJsonInput(getString(formData, "options")),
    domain: getString(formData, "domain") || undefined,
    required: getBoolean(formData, "required", true),
    weight: getNumber(formData, "weight", 1),
    orderIndex: getNumber(formData, "orderIndex", 0),
  };
}

function ruleInput(formData: FormData) {
  return {
    name: getString(formData, "name"),
    description: getString(formData, "description") || undefined,
    conditionText: getString(formData, "condition"),
    severity: getString(formData, "severity") as Severity,
    resolutionPath: getString(formData, "resolutionPath") as ResolutionPath,
    recommendationTitle: getString(formData, "recommendationTitle"),
    recommendationDescription: getString(formData, "recommendationDescription"),
    priority: getNumber(formData, "priority", 0),
  };
}

function ruleBody(input: ReturnType<typeof ruleInput>, condition: unknown) {
  const { conditionText: _c, ...rest } = input;
  return { ...rest, condition };
}

const ruleIncomplete = (r: ReturnType<typeof ruleInput>) =>
  !r.name || !r.conditionText || !r.severity || !r.resolutionPath || !r.recommendationTitle || !r.recommendationDescription;

// ─── User stats & list ──────────────────────────────────

export async function getAdminUserStats() {
  const api = await sessionApi();
  const res = await api.v1.admin.users.stats.$get();
  if (!res.ok) throw new AdminApiError("user stats", res.status);
  return (await res.json()).data;
}

export async function listAdminUsers(query?: string, page = 1) {
  const api = await sessionApi();
  const res = await api.v1.admin.users.$get({ query: { q: query || undefined, page: String(page) } });
  if (!res.ok) throw new AdminApiError("list users", res.status);
  return reviveDates((await res.json()).data);
}

// ─── User mutations ─────────────────────────────────────

export async function updateAdminUserRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = getString(formData, "userId");
  const role = getString(formData, "role") as UserRole;
  if (!userId || !ROLES.includes(role)) return err("Invalid role update input.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.users[":id"].role.$patch({ param: { id: userId }, json: { role } }),
    () => revalidatePath("/admin/users"),
  );
}

export async function updateAdminUserStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = getString(formData, "userId");
  const status = getString(formData, "status") as UserStatus;
  if (!userId || !USER_STATUSES.includes(status)) return err("Invalid status update input.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.users[":id"].status.$patch({ param: { id: userId }, json: { status } }),
    () => revalidatePath("/admin/users"),
  );
}

// ─── Templates (reads) ──────────────────────────────────

export async function listAssessmentTemplates(query?: string, page = 1) {
  const api = await sessionApi();
  const res = await api.v1.admin.templates.$get({ query: { q: query || undefined, page: String(page) } });
  if (!res.ok) throw new AdminApiError("list templates", res.status);
  return reviveDates((await res.json()).data);
}

export async function getAssessmentTemplateDetail(templateId: string) {
  const api = await sessionApi();
  const res = await api.v1.admin.templates[":id"].$get({ param: { id: templateId } });
  if (res.ok) return reviveDates((await res.json()).data);
  const status: number = res.status;
  if (status === 404 || status === 400) return null;
  throw new AdminApiError("template detail", status);
}

// ─── Template mutations ─────────────────────────────────

export async function createAssessmentTemplate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  if (!name) return err("Template name is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.templates.$post({ json: { name, description: description || undefined } }),
    (d) => revalidateAssessments(d.templateId),
  );
}

export async function updateAssessmentTemplate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const templateId = getString(formData, "templateId");
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  if (!templateId || !name) return err("Template id and name are required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.templates[":id"].$patch({ param: { id: templateId }, json: { name, description: description || undefined } }),
    () => revalidateAssessments(templateId),
  );
}

export async function publishAssessmentTemplate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const templateId = getString(formData, "templateId");
  if (!templateId) return err("Template id is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.templates[":id"].publish.$post({ param: { id: templateId } }),
    () => revalidateAssessments(templateId),
  );
}

export async function archiveAssessmentTemplate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const templateId = getString(formData, "templateId");
  if (!templateId) return err("Template id is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.templates[":id"].archive.$post({ param: { id: templateId } }),
    () => revalidateAssessments(templateId),
  );
}

export async function deleteAssessmentTemplate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const templateId = getString(formData, "templateId");
  if (!templateId) return err("Template id is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.templates[":id"].$delete({ param: { id: templateId } }),
    () => revalidateAssessments(),
  );
}

// ─── Section mutations ──────────────────────────────────

export async function createAssessmentSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const templateId = getString(formData, "templateId");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const orderIndex = getNumber(formData, "orderIndex", 0);
  if (!templateId || !title) return err("Template id and section title are required.");
  const api = await sessionApi();
  return mutate(
    () =>
      api.v1.admin.templates[":id"].sections.$post({
        param: { id: templateId },
        json: { title, description: description || undefined, orderIndex },
      }),
    () => revalidateAssessments(templateId),
  );
}

export async function updateAssessmentSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sectionId = getString(formData, "sectionId");
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const orderIndex = getNumber(formData, "orderIndex", 0);
  if (!sectionId || !title) return err("Section id and title are required.");
  const api = await sessionApi();
  return mutate(
    () =>
      api.v1.admin.sections[":id"].$patch({
        param: { id: sectionId },
        json: { title, description: description || undefined, orderIndex },
      }),
    (d) => revalidateAssessments(d.templateId),
  );
}

export async function deleteAssessmentSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sectionId = getString(formData, "sectionId");
  if (!sectionId) return err("Section id is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.sections[":id"].$delete({ param: { id: sectionId } }),
    (d) => revalidateAssessments(d.templateId),
  );
}

// ─── Question mutations ─────────────────────────────────

export async function createAssessmentQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sectionId = getString(formData, "sectionId");
  const input = questionInput(formData);
  if (!sectionId || !input.questionKey || !input.prompt) return err("Section, question key, and prompt are required.");
  if (input.options === undefined) return err("Options must be valid JSON.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.sections[":id"].questions.$post({ param: { id: sectionId }, json: input }),
    (d) => revalidateAssessments(d.templateId),
  );
}

export async function updateAssessmentQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const questionId = getString(formData, "questionId");
  const input = questionInput(formData);
  if (!questionId || !input.questionKey || !input.prompt) return err("Question id, key, and prompt are required.");
  if (input.options === undefined) return err("Options must be valid JSON.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.questions[":id"].$patch({ param: { id: questionId }, json: input }),
    (d) => revalidateAssessments(d.templateId),
  );
}

export async function deleteAssessmentQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const questionId = getString(formData, "questionId");
  if (!questionId) return err("Question id is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.questions[":id"].$delete({ param: { id: questionId } }),
    (d) => revalidateAssessments(d.templateId),
  );
}

// ─── Rule mutations ─────────────────────────────────────

export async function createAssessmentRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const templateId = getString(formData, "templateId");
  const input = ruleInput(formData);
  if (!templateId || ruleIncomplete(input)) return err("All required rule fields must be provided.");
  const condition = parseJsonInput(input.conditionText);
  if (condition === undefined || condition === null) return err("Condition must be valid JSON.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.templates[":id"].rules.$post({ param: { id: templateId }, json: ruleBody(input, condition) }),
    () => revalidateAssessments(templateId),
  );
}

export async function updateAssessmentRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ruleId = getString(formData, "ruleId");
  const input = ruleInput(formData);
  if (!ruleId || ruleIncomplete(input)) return err("All required rule fields must be provided.");
  const condition = parseJsonInput(input.conditionText);
  if (condition === undefined || condition === null) return err("Condition must be valid JSON.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.rules[":id"].$patch({ param: { id: ruleId }, json: ruleBody(input, condition) }),
    (d) => revalidateAssessments(d.templateId),
  );
}

export async function deleteAssessmentRule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ruleId = getString(formData, "ruleId");
  if (!ruleId) return err("Rule id is required.");
  const api = await sessionApi();
  return mutate(
    () => api.v1.admin.rules[":id"].$delete({ param: { id: ruleId } }),
    (d) => revalidateAssessments(d.templateId),
  );
}

// ─── Read-only helpers ──────────────────────────────────

export async function getTemplateStatusCounts() {
  const api = await sessionApi();
  const res = await api.v1.admin.templates["status-counts"].$get();
  if (!res.ok) throw new AdminApiError("template status counts", res.status);
  return (await res.json()).data;
}

export async function getRecentAdminAuditEvents(limit = 20) {
  const api = await sessionApi();
  const res = await api.v1.admin.audit.$get({ query: { limit: String(limit) } });
  if (!res.ok) throw new AdminApiError("audit events", res.status);
  return reviveDates((await res.json()).data);
}

// ─── Assessment submissions ─────────────────────────────

export async function listAssessmentSubmissions(templateId?: string, page = 1) {
  const api = await sessionApi();
  const res = await api.v1.admin.submissions.$get({ query: { templateId: templateId || undefined, page: String(page) } });
  if (!res.ok) throw new AdminApiError("list submissions", res.status);
  return reviveDates((await res.json()).data);
}

export async function getAssessmentSubmissionDetail(assessmentId: string) {
  const api = await sessionApi();
  const res = await api.v1.admin.submissions[":id"].$get({ param: { id: assessmentId } });
  if (res.ok) return reviveDates((await res.json()).data);
  const status: number = res.status;
  if (status === 404 || status === 400) return null;
  throw new AdminApiError("submission detail", status);
}

export async function getSubmissionCountByTemplate(templateId: string) {
  const api = await sessionApi();
  const res = await api.v1.admin.templates[":id"]["submission-count"].$get({ param: { id: templateId } });
  if (!res.ok) throw new AdminApiError("submission count", res.status);
  return (await res.json()).data.count;
}

export async function listPublishedTemplatesForFilter() {
  const api = await sessionApi();
  const res = await api.v1.admin.templates.options.$get();
  if (!res.ok) throw new AdminApiError("template options", res.status);
  return (await res.json()).data;
}

// ─── Partners ───────────────────────────────────────────

export async function listAdminPartners() {
  const api = await sessionApi();
  const res = await api.v1.admin.partners.$get();
  if (!res.ok) throw new AdminApiError("list partners", res.status);
  return (await res.json()).data.partners;
}
