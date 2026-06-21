# How Orion Works — A Plain-English Explainer

> For non-technical team members. No code knowledge needed.
> This explains the journey from a founder taking the assessment, through the "rules engine," to the AI delivering a legal health report.

---

## 1. The Big Picture (in one paragraph)

Orion is a **legal health check for startups**. A founder answers a questionnaire about their company. Orion's software takes those answers, organises them neatly into a structured "brief" (this is the **rules engine**), and hands that brief to an **AI** that has been told to behave like a senior legal team with 50 years of experience. The AI reads the brief and writes back a **report**: an overall score out of 100, a risk level, a list of legal issues, and a prioritised to-do list. That report is shown to the founder and (if they have an account) saved so it powers their dashboard.

```
Founder answers questions
          │
          ▼
   RULES ENGINE  ──►  organises answers into a clean, structured brief
          │
          ▼
      AI (acts as a 50-year legal team)  ──►  reads brief, writes the report
          │
          ▼
   REPORT (score + issues + actions)  ──►  shown to founder + saved to dashboard
```

---

## 2. Step One — The Assessment (the questionnaire)

There are two front doors into the same questionnaire:

- **Guest Health Check** (`/health-check`) — anyone can take it, no sign-up. Results are saved in the browser only.
- **Onboarding** (`/onboarding`) — for people who create an account. Same questions, but the results are saved to their account and feed the dashboard.

**What the questionnaire looks like:** ~52 questions split across 6 themed sections, for example:

1. Formation Details
2. Regulatory & Compliance
3. Tax & Employee Filings
4. Contracts & Fundraising
5. IP, IT & Data Protection
6. Litigation & Arbitration

**Important design choice — the questions are NOT hard-coded.** They live in the database and can be edited by an admin in the Assessment Builder (`/admin/assessments`). This means the legal team can add, remove, or reword questions **without a developer**. Each question stores a few useful things behind the scenes:

| Property | What it means in plain English |
|---|---|
| **Prompt** | The actual question the founder reads |
| **Input type** | How they answer — dropdown, multi-select, text box, file upload |
| **Domain** | Which area of law it belongs to (e.g. "equity", "ip", "tax") |
| **Required** | Whether they must answer it |
| **Conditional logic ("showIf")** | Whether the question only appears based on a previous answer |

**Conditional questions ("showIf"):** Some questions only show up when relevant. For example, a question about employee stock options only appears *if* the founder earlier said "Yes, we have an ESOP." This keeps the form short and relevant rather than asking everyone everything.

**File uploads:** For some questions, founders can upload an actual document (e.g. their shareholders' agreement). Orion reads the text out of that file so the AI can analyse the real contents — not just whether the document exists.

---

## 3. Step Two — The Rules Engine (explained simply)

This is the part people most often misunderstand, so here it is clearly:

> **The rules engine does NOT score the startup. It does NOT decide what's risky. Its only job is to take the founder's raw answers and turn them into a clean, well-organised brief for the AI to read.**

Think of the rules engine like a **paralegal preparing a file before the senior lawyers walk in**. The paralegal doesn't make the legal judgement — they just gather everything, label it, sort it, and lay it out so the experts can work fast and miss nothing.

Concretely, the rules engine:

1. **Collects** every question and the founder's answer for it.
2. **Groups** them by section (Formation, Tax, IP, etc.).
3. **Skips** questions the founder didn't answer, so the brief isn't cluttered.
4. **Attaches uploaded documents** — it pulls the text out of any uploaded file and places it under the relevant question.
5. **Lists the legal domains** that the answers touched, so the AI knows which areas to score.
6. **Formats everything** into a tidy, readable document with clear headers.

The result is a structured brief that looks roughly like this:

```
═══════════════════════════════════════
FORMATION DETAILS
═══════════════════════════════════════
Q: Is your company formally incorporated?
A: Yes

Q: Do you have a founders' agreement in place?
A: No

═══════════════════════════════════════
CONTRACTS AND FUNDRAISING
═══════════════════════════════════════
Q: Are you currently raising funding?
A: Yes
...
```

That's it. No scoring, no AI yet — just organised facts.

### What about the "Rules" admins can create?

The database also has a **rules table** where admins can define named rules (a condition + a severity + a recommended action + a priority). Think of these as the legal team's **reusable playbook entries** — e.g. "if raising funding AND no cap table → high severity → recommend generating a cap table." These give the system a structured library of known risk patterns that the legal team controls. The day-to-day scoring, however, is delivered by the AI reading the brief — the rules library is the human-curated backbone behind it, not a mechanical calculator that replaces the AI's judgement.

---

## 4. Step Three — The Prompt (what we tell the AI)

A **prompt** is simply the set of instructions we give the AI. Orion's prompt is carefully written so the AI behaves like an expert and returns something the app can use. It has four parts:

**Part 1 — Who the AI is (the role):**

> "YOU ARE A SENIOR LEGAL ADVISORY TEAM WITH 50 YEARS OF COMBINED EXPERIENCE IN STARTUP LAW."

This single line is powerful — it tells the AI to think and write like a seasoned legal team, not a generic chatbot.

**Part 2 — The evidence:** The structured brief from the rules engine (all the questions, answers, and uploaded document contents) is pasted in.

**Part 3 — The exact format we want back:** We tell the AI to reply **only as structured data (JSON)** with specific fields, so the app can reliably read it. The fields are:

- `overallScore` — a number 0–100 (higher = healthier)
- `riskLevel` — critical / high / medium / low / info
- `summary` — a 2–3 sentence plain-English overview
- `domainScores` — a score per legal area (equity, tax, IP, etc.)
- `issues` — a list of specific problems found, each with a title, why-it-matters explanation, severity, and a recommended action
- `priorityActions` — the top 3–5 things to do first, in order

**Part 4 — The house rules:** A list of instructions that shape the AI's judgement, including:

- Score based on the **combination** of answers (a solo pre-seed founder missing bylaws is less serious than a 4-person seed-stage team missing a founders' agreement).
- Spot risks **beyond** the obvious missing documents.
- Be **honest** about severity — don't exaggerate to scare, don't soften to comfort.
- Label each issue with how it can be fixed: **self-serve**, **generate a document on Orion**, or **refer to a human lawyer**.
- **Write for founders** — plain language, explain *why* each thing matters.
- If a document was uploaded, **read it** and flag missing clauses or odd terms.

The AI used is OpenAI's `gpt-4o-mini`, set to a low "temperature" (0.4) — meaning it stays focused and consistent rather than creative and unpredictable, which is what you want for legal analysis.

---

## 5. Step Four — The Report (what comes back)

The AI returns its analysis as structured data. Orion then:

1. **Reads and cleans it** (strips any stray formatting).
2. **Adds metadata** — when it was completed, how many questions were answered, which template was used.
3. **Shows it to the founder** — the score, risk level, summary, the issue list, and the priority actions.

**If the founder has an account, Orion also saves everything:**

- Updates their **startup record** with the new health score.
- Saves an **assessment record** (score + risk level + date).
- Stores **both the raw answers and the AI's analysis** side-by-side (useful for audit and history).
- Creates a row for **each legal issue** found, plus a linked **recommendation** with a priority (critical issues float to the top).

This is what makes the **dashboard** come alive immediately after signup — the score, alerts, and recommended actions all come from this saved report.

---

## 6. How the AI Works With Uploaded Files

For some questions, a founder can upload a real document instead of (or alongside) just saying "yes, we have it." This is where Orion goes beyond a tick-box checklist — it actually **reads the document and analyses its contents.** Here's the journey of a file:

**Step 1 — The founder uploads.** When they attach a file to a question, it's stored securely in Orion's document storage (Cloudflare R2). The questionnaire just remembers a small reference: the file's name and where it's stored.

**Step 2 — Orion pulls the text out.** The AI can't "open" a file the way a person does — it needs plain text. So before the AI is involved, Orion runs each file through a **text extractor** that handles different file types:

| File type | What happens |
|---|---|
| **PDF** | Text is read out of the pages |
| **Word (.docx)** | Text is extracted |
| **Excel (.xlsx / .xls)** | Each sheet is converted to a readable table |
| **CSV** | Read directly |
| **Plain text / Markdown (.txt, .md)** | Read directly |
| **Old Word (.doc)** | Not supported — founder is asked to convert to .docx |
| **Images (.png, .jpg)** | Stored, but the picture's contents are **not** read |

To keep things fast and within the AI's limits, only the **first portion of each document** (roughly the first 8,000 characters — several pages) is extracted. For most startup legal documents the key terms are near the front, but it's worth knowing very long documents aren't read end-to-end.

**Step 3 — The text is added to the brief.** The rules engine places each document's extracted text **under the question it belongs to**, clearly labelled — so the AI knows, for example, that this block of text is "the shareholders' agreement they uploaded for the equity question." In the brief it looks like:

```
═══════════════════════════════════════
UPLOADED DOCUMENTS
═══════════════════════════════════════
Document for: "Do you have a shareholders' agreement?"
File: shareholders-agreement-v2.pdf
Content:
THIS AGREEMENT is made between... [the actual text of the document]
```

**Step 4 — The AI analyses the actual contents.** Because of a specific instruction in the prompt, the AI doesn't just confirm the document exists — it **inspects what's inside**: flagging missing clauses, non-standard or risky terms, compliance gaps, and structural problems, and it references specific findings from the document in its report.

> **Why this matters in plain English:** A checklist can only tell you *whether* a founder has a contract. Orion can tell you whether that contract is actually *good* — whether it's missing the clauses it should have, or contains terms that could cause problems later. That's the difference between "you have a founders' agreement ✓" and "your founders' agreement has no vesting schedule, which is a real risk."

**A note on images:** If someone uploads a photo or screenshot of a document, Orion currently stores it but does **not** read the text inside the image. For analysis, documents should be uploaded as PDF, Word, or another text-based format.

---

## 7. Bonus — Re-evaluation (tracking progress)

Founders can **re-take** the health check later (`/health-check/reevaluate`). This uses an enhanced version of the same prompt that *also* tells the AI:

- The founder's **previous score** and previous issue count.
- Any **documents they've since generated** on Orion (these now count as "documents they have").

The AI then re-scores everything and adds two extra things to the report:

- `scoreChange` — how much the score moved (e.g. +15).
- `commentary` — an encouraging or direct note from the "legal team" on their progress, referencing the specific documents they completed.

This turns Orion from a one-time checkup into an **ongoing progress tracker**.

---

## 8. Quick Glossary

| Term | Plain meaning |
|---|---|
| **Assessment / Health Check** | The questionnaire a founder fills in |
| **Template** | The set of questions, stored in the database, editable by admins |
| **Rules Engine** | The software that organises raw answers into a clean brief for the AI (it does not score) |
| **Domain** | An area of law (e.g. equity, IP, tax, contracts) |
| **Prompt** | The instructions we give the AI, including the brief and the role it should play |
| **AI / LLM** | The "50-year legal team" that reads the brief and writes the report |
| **JSON** | A strict data format the AI replies in, so the app can read it reliably |
| **Score** | 0–100 rating of legal health; higher is better |
| **Severity** | How serious an issue is: critical / high / medium / low / info |
| **Resolution path** | How an issue gets fixed: self-serve, generate a document, or see a lawyer |
| **Re-evaluation** | Re-taking the check later to track improvement over time |

---

## 9. The Whole Flow, End to End

```
1. Founder opens /health-check or /onboarding
2. Answers ~52 questions across 6 sections (some questions appear conditionally)
3. Optionally uploads real documents
        │
        ▼
4. RULES ENGINE organises everything into a structured brief
   (groups by section, skips blanks, pulls text out of uploads,
    lists the legal domains touched)
        │
        ▼
5. PROMPT is assembled: "You are a 50-year legal team" + the brief
   + "reply in this exact format" + house rules
        │
        ▼
6. AI reads it and writes back: score, risk level, summary,
   per-domain scores, issues, and priority actions
        │
        ▼
7. Orion shows the report to the founder
8. If logged in: saves score, assessment, issues & recommendations
   → powers the dashboard
        │
        ▼
9. Later: founder generates documents, then RE-EVALUATES
   → AI compares to last time, scores the progress, comments
```

**The key insight to remember:** the rules engine is the *organiser*, the AI is the *expert*. The software prepares the file; the AI makes the legal judgement.
