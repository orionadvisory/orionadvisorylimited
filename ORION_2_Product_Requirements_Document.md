# Product Requirements Document

Business Health, Compliance & Investment Readiness Platform

Proposed development specification \| November 2026  
Initial jurisdictions: Nigeria and Delaware, United States  
Audience: Product, engineering, design and regulatory content teams

*Build your business. Stay organised. Stay compliant. Be investment-ready.*

# 1. Executive summary

ORION is a cloud-based business health, compliance and investment-readiness workspace for founders, growing businesses and investment managers without dedicated legal or compliance teams. It helps users understand obligations, prepare evidence, maintain ownership records, track deadlines and obtain professional support. Product promise: Know what applies. Understand what it means. Prepare what you need. Stay compliant. Get investment-ready.

# 2. Product objectives

Simplify compliance for non-specialists; reduce missed filings and renewals; manage multiple entities under one account; explain obligations in plain English; collect documents once and reuse them; maintain corporate ownership history; prepare for diligence; provide optional professional assistance and create recurring value. Every identified problem should lead to a practical next action.

# 3. Target users

Primary: startup founders, growing businesses, cross-border groups (especially Delaware parents and Nigerian subsidiaries), investment funds and advisers. Secondary: lawyers, accountants, corporate secretaries, fund administrators, compliance consultants, venture capital portfolio teams and corporate service providers.

# 4. Product architecture

Web-first SaaS with optional integrations. Shared workspace database powers Legal Health Check, Entity Management, Compliance Intelligence, Filing Assistant, Licences & Renewals, Ownership Intelligence, Document Vault, Investment Readiness, Professional Help and Notifications. Information is reused across modules subject to permissions. No mandatory external integrations.

# 5. End-to-end user journey

Create account → short health check → add entities → initial assessment and personalised calendar → confirm ownership and generate chart → investment-readiness assessment → complete actions and upload evidence progressively → receive reminders → request assistance as needed. Target meaningful value within five minutes without requiring document uploads.

# 6. Legal Health Check

## Onboarding

Target 8–10 questions and approximately five minutes. Use plain language, multiple choice, conditional follow-ups, “I don't know”, optional skips, automatic progress saving and editable answers. Reconcile with the existing ORION health check before implementation.

## Proposed questions

- Where is your business registered?

- What type of entity do you operate?

- What industry are you in?

- Do you have more than one company?

- Are shareholder and ownership records up to date?

- Do you have signed founder or shareholder agreements?

- Does the business own or have rights to its intellectual property?

- How do you manage tax and regulatory filings?

- Do you have employees or regulated activities?

- Are you planning to raise investment?

## Assessment and outputs

Assess formation, ownership, governance, IP, employment, contracts, tax, regulation, data protection, licensing and investment preparedness. Generate business health summary, prioritised actions (Urgent, Important, Recommended, Needs Confirmation), potential obligations, document requests, readiness recommendations and professional help. Unknowns remain unverified. Prefer actionable statuses over arbitrary numerical scores; any future score must use a transparent validated rubric distinguishing self-report, uploaded evidence and professional review.

# 7. Multi-entity management

One account can contain a Delaware C-Corp, three Nigerian subsidiaries, Delaware LLCs, LPs, GP entities, funds and adviser companies. Support adding, editing and archiving entities, parent/subsidiary relationships, entity and group views, permissions, documents and obligations.

## Entity profile

Registered and trading names; jurisdiction/state; registration number; incorporation date; legal type; registered address; industry and activities; financial year-end; tax ID and classification; regulatory registrations; employees/payroll; VAT status; registered agent or secretary; ownership relationships; licences. Collect only necessary fields at onboarding; ask for additional information when required. Distinguish legal form, tax treatment and regulated activity. Nigerian private/public companies limited by shares are initial types; expand only with validated rules.

# 8. Compliance intelligence and calendar

## Rules engine

Support rule-generated obligations, event-triggered reviews and user-managed deadlines. Evaluate jurisdiction, entity type, tax classification, industry, year-end, ownership, foreign subsidiaries, employees, registration, licences, thresholds, events and rule effective dates. Each rule records name, regulator, jurisdiction, applicability, calculation, frequency, effective date, official source, verification date, explanation, checklist, provider category and verified consequences. Rules must be configurable outside the UI.

## Initial Delaware and US coverage

C-Corps: Delaware annual report/franchise tax, IRS Form 1120, conditional Forms 5471 and 5472, estimated taxes and international reporting. LLCs/LPs: Delaware annual entity tax, Form 1065 for partnerships, Form 1120 for corporations, owner-level reporting for disregarded entities, qualifying foreign-owned disregarded entity Form 5472 with pro forma 1120, partner reporting and withholding where applicable. Do not infer tax treatment solely from legal form.

## Initial Nigerian coverage

CAC annual returns, Persons with Significant Control (PSC), corporate income tax, VAT, PAYE/payroll, withholding tax, transfer pricing, corporate secretarial filings, data protection and sector licences where applicable. CAC returns are distinct from tax returns. Collect AGM date where relevant; apply separately validated rules for AGM-exempt entities.

## Funds and advisers

Distinguish fund, GP, adviser/management company and related entities. Cover applicable Form ADV annual updating amendment, IARD renewal payments, Form PF, Form D, state securities notices, fund audits, investor reporting and tax filings. December renewal payments and March ADV deadlines are separate; use the official cycle and fiscal year. ADV generally belongs to adviser, D to issuer, PF only to qualifying advisers.

## Industry and deadline logic

Initial profiles: technology/SaaS, fintech, investment management, healthcare and general business. Confirm actual activities and licensing; industry alone does not establish applicability. Support fixed, monthly, quarterly, annual, year-end, incorporation, AGM, event and expiry-based deadlines, extensions and applicable holiday adjustments. Display Date Pending Confirmation when inputs are insufficient; never invent statutory dates.

## Calendar

Monthly and chronological views; upcoming, overdue, completed and confirmation-required tasks; group and entity scope. Filter by entity, jurisdiction, regulator, industry, type, assignee, status and date. Export CSV and ICS.

# 9. Filing assistant

Every obligation offers Understand This Filing, Prepare My Documents and Get Professional Help. Explain purpose, applicability, responsible entity, regulator, due date, required information, evidence, submission method, verified consequences and support options in plain English.

## Example preparation guides

- Form 1120: US corporate income tax return; EIN, financial statements, trial balance, income/expenses, balance sheet, tax adjustments and schedules.

- Form 5471: conditional US reporting about foreign corporations; US/foreign entity details, ownership, subsidiary accounts, intercompany transactions, capital and schedules.

- CAC annual returns: corporate registry update; registration details, address, directors/secretary where applicable, shareholders/capital, accounts/schedules, AGM or exemption and filing confirmation.

- Form ADV: adviser business and ownership disclosures; prior ADV, regulatory AUM, ownership/control, private funds, material changes, conflicts and disciplinary disclosures.

## Preparation workflow

Required, conditional and recommended checklist items; tick completion, upload or link existing evidence, assign responsibility, request missing documents, track progress and export preparation pack. Checklist completion is not filing submission or acceptance.

# 10. Licences, permits and custom renewals

Capture entity, name, issuing authority, reference number, category, issue date, expiry date, separate application deadline, recurrence, assignee, reminder intervals, documents and notes. Support regulatory licences, operating permits, certifications, data protection registrations, audits, insurance, contracts, registered agents and other custom dates.

NDPC registration/renewal and annual Compliance Audit Returns are separate obligations; do not assume identical deadlines or recurrence. User adds licence and evidence; calendar and reminders update; user completes renewal, uploads new certificate and confirms next expiry; preserve prior records. Recurrence must be confirmed by user or verified rule.

# 11. Ownership intelligence and corporate structure

## Register and chart

Record individual/corporate shareholders, parents, external investors, GPs/LPs, share or interest classes, shares/units, percentages, voting rights, effective dates, beneficial ownership information and evidence. Distinguish legal, economic, voting and beneficial ownership. Generate charts automatically from records, including names, jurisdictions, types, relationships, percentages, external holders and as-of date. Export group/entity charts in PDF, PNG and SVG; registers/history in CSV. Label self-reported versus verified information.

## Ownership transactions

Support transfers, issuances, allotments, buybacks, redemptions, acquisitions, partnership changes, beneficial ownership changes and corrections. Capture entity, affected holders, previous/new positions, effective date, transaction type, evidence, approval status, recorder/approver and notes. Evidence may include transfer instruments, subscription agreements, board/shareholder resolutions, updated registers, certificates, investment agreements and filing acknowledgements.

## Workflow and validation

Draft transaction → attach evidence → validate → authorised approval → effective-dated register and chart update → preserve history → generate compliance reviews. Support atomic multi-holder changes. Reject negative interests, flag totals over 100% within the relevant basis, incomplete records, self-ownership and circular structures; preserve classes and distinguish direct/indirect interests. Historical snapshots must be reproducible as of any date. Corrections remain auditable.

Example: Atlas Holdings owns 80% of Atlas Payments and an external investor owns 20%; a transfer changes positions to 70% and 30%. Preserve both snapshots. Trigger potential CAC PSC, register, allotment/transfer, Form 5471, related-party, adviser ownership and securities reviews; do not infer definitive filing requirements without sufficient facts. Advanced cap tables and complex indirect calculations are later-phase features.

# 12. Document vault and evidence management

Securely upload, categorise, search, download, version and link documents to entities and multiple workflows. Track issue/expiry dates, missing documents, permissions and activity. Categories: incorporation, registers, founder/shareholder agreements, resolutions, certificates, tax, accounts, licences, filings, employment, IP, contracts, privacy, investment and filing receipts. Collect once and reuse: subsidiary financial statements may support Nigerian tax, CAC, US Form 5471 and diligence. Evidence statuses: Not Provided, Uploaded, Awaiting Review, Reviewed, Expired, Superseded. Upload does not imply professional verification.

# 13. Investment readiness

Reuse health check, entity, ownership, compliance, governance and document records; no second long questionnaire. Assess corporate structure, founder/governance, IP, financial statements/model, commercial contracts, employment, regulatory and data protection readiness. Statuses: Ready for Review, Needs Attention, Missing Information, Not Yet Verified, Not Applicable. Explain each gap and link to a corrective action. Fundraising horizon (none, within 12 months, within six months, actively raising) changes priority, not legal requirements.

## Investor Readiness Pack

Export selected company overview, group chart, entity and shareholder information, available documents, compliance summary, outstanding diligence items, legal gaps, action plan and verification status. User controls inclusion and sharing. Future secure investor data room: selected access, expiry, download restrictions, logs and diligence requests. No guarantee of funding or investor approval.

# 14. Professional help and referrals

Contextual Get Help on obligations, checklists, health recommendations, ownership, renewals and readiness tasks. Assistance: applicability advice, review, preparation, filing, corporate secretarial, tax, licensing and investment readiness. Provider categories: lawyers, accountants, tax advisers, corporate secretaries, CAC-accredited agents, data protection specialists, adviser compliance specialists, fund administrators and licensing consultants.

Workflow: identify entity/obligation → select assistance → recommend category/provider → prepare request → user reviews sharing scope and consents → submit request or display contact → track status. MVP curated providers, manual matching, internal referral dashboard and basic request tracking; no full marketplace. Screen qualifications and jurisdiction expertise, disclose commercial referral arrangements and never automatically share confidential documents.

# 15. Notifications and reminders

MVP email and in-app; later Google/Outlook calendars, mobile push and optional messaging. Support 90, 60, 30, 14, 7, 1 day, due date and custom intervals. Notify responsible users, allow workspace/task preferences, deduplicate, recalculate on deadline change, stop completed reminders, flag overdue, optionally escalate, log delivery and retry failures. Backend scheduling must work when browser is closed.

# 16. Main dashboard

Show entities, upcoming/overdue/unconfirmed obligations, filings in progress, missing evidence, licence expirations, legal health, investment readiness, ownership changes and help requests. Prioritise three actionable next steps, e.g. confirm CAC return status, upload shareholder register, prepare US tax accounts. Group/entity filters update all relevant information. Statuses: Needs Confirmation, Upcoming, In Progress, Awaiting Documents, Ready for Filing, Submitted, Completed/Accepted, Overdue, Not Applicable. Separate preparation, submission and acceptance.

# 17. Cross-module workflows

Ownership change: approved register/chart update, history and evidence, compliance review, legal health and readiness updates, help. New subsidiary: profile, ownership prompt, potential obligations, confirmed calendar dates, document checklist, group chart and diligence gaps. Fundraising: reuse records, identify missing evidence, prioritise tasks and export selected pack. Licence renewal: entity, calendar, reminders, certificate, completion, history and regulatory readiness. Enter information once; update relevant modules automatically.

# 18. Team access and permissions

Workspace owner: full administration; administrator: entities/users/settings; compliance manager: assigned obligations; contributor: uploads/tasks; reviewer: authorised approvals; viewer: authorised read access; external adviser: explicitly scoped access. Users may belong to multiple workspaces. Entity-level permissions cover documents, ownership, obligations, exports, referrals and audit history. Nigerian accountant can access selected Nigerian companies without access to restricted US records. Enforce permissions server-side, including direct links and APIs.

# 19. Regulatory administration portal

Create/update rules, jurisdictions, entity types, industry profiles, applicability and date calculations, sources, explanations, checklists, regulatory changes, provider recommendations and referrals. Each rule has unique ID, version, source, effective date, last review, reviewer and publication status. Draft → Regulatory Review → Approved → Published → Superseded. Recalculate affected future obligations and reminders; retain historical rule versions. Qualified professional validation is required before production.

# 20. Suggested technical data model

Workspace; User; Membership; Entity; Entity Relationship; Shareholder; Ownership Interest; Ownership Transaction; Ownership Snapshot; Health Assessment; Assessment Action; Compliance Rule; Compliance Obligation; Checklist Item; Licence/Renewal; Document; Document Link; Investment Assessment; Reminder; Notification Log; Provider; Help Request; Audit Log.

Every entity belongs to a workspace; every obligation to an entity; documents have authorised scope; ownership history is preserved; obligations reference rule versions; reminders reference obligations; cross-module updates are consistent and auditable; customer data is isolated. Agree technology stack with developer based on existing ORION architecture.

# 21. Security, privacy and reliability

Secure authentication, role-based access, tenant and entity isolation, encryption in transit/at rest, secure storage, file validation and malware scanning, controlled download links, audit logs, backups, recovery, retention/deletion, export controls, privacy notices and explicit sharing consent. Support MFA, especially privileged users. Meet applicable privacy requirements. Background reminders, failed delivery logs, historical integrity, consistent transactions, tested recovery and authorised exports are required.

# 22. UX and design principles

Modern, mobile-responsive, accessible web UI; plain English, minimal onboarding, progressive data collection, clear navigation, next actions, simple uploads, statuses and contextual help. Explain why specialist inputs are needed. Navigation: Overview, Legal Health Check, My Entities, Compliance Calendar, Ownership & Structure, Licences & Renewals, Document Vault, Investment Readiness, Professional Help, Settings. Founders should understand priorities within seconds.

# 23. MVP development scope

- Phase 1 — Foundation: authentication, workspace, multi-entity profiles, permissions, shared database and secure document storage.

- Phase 2 — Health and compliance: short check, recommendations, rules database, Delaware/Nigeria and selected fund/adviser coverage, calendars, explanations, checklists and statuses.

- Phase 3 — Ownership and renewals: registers, charts and exports, transactions, evidence, history, review triggers, custom renewals and reminders.

- Phase 4 — Investment and help: assessment, gap analysis, prioritised actions, investor pack, contextual help, curated providers, referral workflow and administration.

All four phases are proposed MVP scope, delivered incrementally. Exclude direct regulatory submission, automated tax preparation, full integrations, AI extraction, advanced cap tables, complex indirect ownership, full marketplace, provider payments, native apps and advanced APIs initially.

# 24. Future development

Optional Xero/QuickBooks, Drive/SharePoint, Google/Outlook calendar integrations; AI document classification and expiry extraction; advanced beneficial ownership, cap tables and dilution; investor data rooms and diligence requests; provider portals, quotations and payments; additional jurisdictions; white-label professional services; VC portfolio dashboards; enterprise APIs and registry verification.

# 25. MVP acceptance criteria

- A — Onboarding: founder completes short check; useful assessment/actions and unknowns appear without uploads.

- B — Multi-entity: one Delaware parent and three Nigerian companies appear in one workspace with group and individual profiles, obligations and documents.

- C — Calendar: validated obligations and confirmed dates; unknowns flagged; Form 1120 explanation and CAC checklist accessible; preparation progress tracked.

- D — Licence: NDPC-related or other actual expiry entered with evidence; entity/group calendar updated; 30/14/7-day notifications delivered; changed date reschedules reminders.

- E — Ownership: four-entity chart generated and exported; transfer with evidence validated and approved; chart updated; previous snapshot accessible; compliance reviews generated.

- F — Investment: reuse existing records and evidence; identify missing diligence items; actions and exportable pack distinguish verification status.

- G — Help: identify suitable category, prepare contextual request, obtain sharing consent and track request; no unauthorised documents shared.

- H — Permissions: accountant accesses selected Nigerian entities only; restricted US data inaccessible via UI, links, exports and API.

- I — Rule change: version rule, identify affected future tasks, update reminders, preserve history and notify users where appropriate.

# 26. Product success metrics

Health Check completion; time to first useful recommendation; entities per workspace; calendar activation; completed/overdue obligations; checklist completion; renewals tracked; charts generated/exported; investor packs generated; help requests; returning active workspaces. Use metrics for improvement, not guarantees of compliance.

# 27. Developer deliverables

Technical architecture, database schema, permission model, rules engine design, user journey diagrams, wireframes, milestones, timeline/cost estimate, security/storage approach and testing/deployment plan. Demonstrate realistic founder scenarios. Approved PRD takes precedence over prototype discrepancies.

# 28. Product boundaries and open decisions

ORION organises obligations, validated information, preparation, evidence, user-provided records and referrals. It does not guarantee compliance or funding, invent deadlines, assume applicability, verify self-reports automatically, equate upload with filing, share confidential data without consent or substitute for professional judgment. Existing health check, technical architecture, regulatory content and scoring framework must be reconciled and validated before launch. Proposed phases, questions and MVP breadth require product-owner approval.

# 29. Final product vision

Legal Health Check brings founders in; Compliance Calendar brings them back; Ownership Intelligence organises corporate structure; Document Vault reduces duplication; Investment Readiness prepares for growth; Professional Help provides support when complexity increases. ORION gives founders the benefits of an organised legal and compliance function before they can afford to build one internally.
