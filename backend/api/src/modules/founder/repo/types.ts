import type {
  DashboardDto,
  DraftDto,
  DraftPayloadDto,
  HealthCheckResultDto,
  IssueDto,
  ReferralDto,
  EntityDto,
  CreateEntityBodyDto,
  UpdateEntityBodyDto,
  ObligationDto,
  CreateObligationBodyDto,
  UpdateObligationBodyDto,
  WorkspaceAccessDto,
  WorkspaceMemberDto,
  AddMemberBodyDto,
  UpdateMemberBodyDto,
} from "@orion/contracts";

export type StartupRow = {
  id: string;
  name: string;
  stage: string | null;
  structure: string | null;
  primaryJurisdiction: string | null;
  riskScore: number | null;
};

export type TemplateBundle = {
  template: { id: string; name: string };
  sections: { id: string; title: string }[];
  questions: { id: string; sectionId: string; questionKey: string; prompt: string; domain: string | null }[];
};

export type GuestResult = HealthCheckResultDto & {
  completedAt: string;
  profile: Record<string, unknown>;
  documentsHeld: string[];
};

export type ReevaluationContext = {
  startupId: string;
  previousScore: number;
  profile: Record<string, unknown>;
  docsHeld: string[];
  generatedDocNames: string[];
  previousIssueCount: number;
};

export type DocumentListItem = {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string | null;
  source: "generated" | "uploaded";
  createdAt: Date;
};

export type ChatContext = {
  startup: StartupRow;
  issues: { title: string; severity: string; domain: string; isResolved: boolean }[];
  /** Oldest first. */
  history: { role: "user" | "assistant"; content: string }[];
};

/** Every founder-side database operation. Ownership is always scoped by `userId`. */
export interface FounderRepo {
  getDashboard(userId: string): Promise<DashboardDto | null>;

  listEntities(userId: string, includeArchived?: boolean): Promise<EntityDto[]>;
  createEntity(userId: string, input: CreateEntityBodyDto): Promise<EntityDto>;
  updateEntity(userId: string, entityId: string, input: UpdateEntityBodyDto): Promise<EntityDto | null>;
  listObligations(userId: string): Promise<ObligationDto[]>;
  createObligation(userId: string, input: CreateObligationBodyDto): Promise<ObligationDto | null>;
  updateObligation(userId: string, obligationId: string, input: UpdateObligationBodyDto): Promise<ObligationDto | null>;

  /** The caller's role and entity scope in their current workspace; null when they have none. */
  getWorkspaceAccess(userId: string): Promise<WorkspaceAccessDto | null>;
  listMembers(userId: string): Promise<WorkspaceMemberDto[]>;
  addMember(userId: string, input: AddMemberBodyDto): Promise<WorkspaceMemberDto>;
  /** Null when the member is not in the caller's workspace. */
  updateMember(userId: string, memberId: string, input: UpdateMemberBodyDto): Promise<WorkspaceMemberDto | null>;
  /** False when the member is not in the caller's workspace. */
  removeMember(userId: string, memberId: string): Promise<boolean>;

  listIssues(userId: string): Promise<IssueDto[]>;
  listReferrals(userId: string): Promise<ReferralDto[]>;
  /** Null unless the issue belongs to a startup owned by `userId`. */
  findIssueForUser(issueId: string, userId: string): Promise<{ id: string; title: string; startupId: string } | null>;
  createReferral(input: {
    userId: string;
    issueId: string;
    startupId: string;
    issueSummary: string;
    issueTitle: string;
  }): Promise<string>;

  getDraft(userId: string, templateId: string): Promise<DraftDto | null>;
  saveDraft(userId: string, templateId: string, payload: DraftPayloadDto): Promise<Date>;
  clearDraft(userId: string, templateId: string): Promise<void>;

  getOrCreateStartup(userId: string): Promise<StartupRow>;
  startAssessment(userId: string, templateId: string): Promise<string>;
  getTemplateBundle(templateId: string): Promise<TemplateBundle | null>;
  /** Null unless the upload belongs to `userId`. */
  findUploadForUser(uploadId: string, userId: string): Promise<{ storageKey: string; name: string } | null>;

  completeOnboarding(input: {
    userId: string;
    templateId: string;
    startupName: string;
    answers: Record<string, string | string[]>;
    result: HealthCheckResultDto;
  }): Promise<string>;
  userExists(userId: string): Promise<boolean>;
  persistGuestCheck(userId: string, result: GuestResult): Promise<{ assessmentId: string; startupId: string }>;

  getReevaluationContext(
    userId: string,
  ): Promise<ReevaluationContext | "no_startup" | "no_assessment" | "no_profile">;
  saveReevaluation(ctx: ReevaluationContext, result: HealthCheckResultDto): Promise<void>;

  listDocuments(userId: string): Promise<DocumentListItem[]>;
  listDocGenerationIssues(userId: string): Promise<{
    startup: { name: string; jurisdiction: string | null; stage: string | null } | null;
    issues: { id: string; title: string; severity: string }[];
  }>;
  createGeneratedDocument(input: {
    id: string;
    userId: string;
    startupId: string;
    name: string;
    type: string;
    templateId: string;
    templateName: string;
    fields: Record<string, string>;
    content: string;
    storageKey: string;
  }): Promise<{ id: string; name: string; type: string; createdAt: Date }>;
  /** A generated document or an upload, by id. Null unless it belongs to `userId`. */
  findDocumentForUser(id: string, userId: string): Promise<{ name: string; storageKey: string | null; content: string | null } | null>;
  createUpload(input: {
    id: string;
    userId: string;
    startupId: string;
    name: string;
    storageKey: string;
    mimeType: string;
    fileSize: number;
    domain: string | null;
    assessmentId: string | null;
    questionKey: string | null;
  }): Promise<void>;

  getChatContext(userId: string): Promise<ChatContext>;
  saveChatMessage(input: { userId: string; startupId: string; role: "user" | "assistant"; content: string }): Promise<void>;
}
