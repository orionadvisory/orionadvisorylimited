import type { ChatContext, TemplateBundle } from "./repo";

/**
 * Prompts moved verbatim from the old Next route handlers so model behaviour is unchanged.
 */

type Answers = Record<string, string | string[]>;

const answered = (answers: Answers, key: string) => {
  const v = answers[key];
  return Array.isArray(v) ? v.length > 0 : !!v;
};

/** The founder's answers, grouped by section, as a readable brief for the model. */
export function buildAssessmentBrief(bundle: TemplateBundle, answers: Answers): { brief: string; domains: string[] } {
  const bySection = new Map<string, TemplateBundle["questions"]>();
  for (const q of bundle.questions) {
    const list = bySection.get(q.sectionId) ?? [];
    list.push(q);
    bySection.set(q.sectionId, list);
  }

  let brief = "";
  for (const section of bundle.sections) {
    const questions = (bySection.get(section.id) ?? []).filter((q) => answered(answers, q.questionKey));
    if (questions.length === 0) continue;
    brief += `\n═══════════════════════════════════════\n${section.title.toUpperCase()}\n═══════════════════════════════════════\n`;
    for (const q of questions) {
      const v = answers[q.questionKey];
      brief += `Q: ${q.prompt}\nA: ${Array.isArray(v) ? v.join(", ") : v}\n`;
      const followUp = answers[`${q.questionKey}__followup`];
      if (typeof followUp === "string" && followUp) brief += `Additional details: ${followUp}\n`;
      brief += `\n`;
    }
  }

  const domains = [
    ...new Set(
      bundle.questions
        .filter((q) => answered(answers, q.questionKey))
        .map((q) => q.domain)
        .filter((d): d is string => !!d),
    ),
  ];
  return { brief, domains };
}

export const ASSESSMENT_SYSTEM_PROMPT =
  "You are a senior legal advisory AI embedded in a startup legal platform. You assess startup legal health based on structured questionnaire responses. You MUST respond with valid JSON only — no markdown, no code fences, no commentary before or after the JSON.";

export function buildAssessmentPrompt(brief: string, fileContext: string, domains: string[]): string {
  return `
YOU ARE A SENIOR LEGAL ADVISORY TEAM WITH 50 YEARS OF COMBINED EXPERIENCE IN STARTUP LAW.

You have been retained to perform a comprehensive legal health assessment for a startup. Below is the structured intake questionnaire completed by the founder. Analyse every answer carefully and deliver your assessment.

${brief}
${fileContext}
═══════════════════════════════════════
LEGAL DOMAINS COVERED
═══════════════════════════════════════
${domains.join(", ")}

═══════════════════════════════════════
YOUR ASSESSMENT INSTRUCTIONS
═══════════════════════════════════════

Deliver your response as valid JSON matching this exact structure:

{
  "overallScore": <number 0-100, higher = healthier>,
  "riskLevel": "<critical|high|medium|low|info>",
  "summary": "<2-3 sentence executive summary of the startup's legal health>",
  "domainScores": {
    "<domain>": { "score": <0-100>, "issues": <count> }
  },
  "issues": [
    {
      "id": "<unique_id>",
      "domain": "<domain>",
      "title": "<concise issue title>",
      "description": "<2-3 sentence explanation of WHY this matters, written for a founder, not a lawyer>",
      "severity": "<critical|high|medium|low|info>",
      "resolutionPath": "<self_serve|document_generation|expert_referral>",
      "recommendation": {
        "title": "<action title>",
        "description": "<specific, actionable next step>"
      }
    }
  ],
  "priorityActions": [
    "<top 3-5 things this startup should do FIRST, in priority order>"
  ]
}

ASSESSMENT RULES:
1. Score based on the COMBINATION of all answers — identify gaps, missing documents, compliance issues, and structural risks.
2. Identify issues BEYOND just what's explicitly stated — flag risks based on the startup's profile (e.g., "You're raising funding without a clean cap table" or "Your jurisdiction requires specific compliance").
3. Severity must be honest — don't inflate to scare, don't downplay to comfort.
4. resolutionPath: "document_generation" if we can generate the doc, "self_serve" if the founder can handle it, "expert_referral" if it needs a lawyer.
5. Include ALL relevant domains in domainScores, even if score is 100.
6. priorityActions should be ordered by urgency and impact.
7. Write for founders — plain language, no jargon, explain why things matter.
8. If an answer is "No" to a question about having a document or compliance item, that's a gap — assess accordingly.
9. If documents were uploaded, analyse their content — flag missing clauses, non-standard terms, compliance gaps, or structural issues. Reference specific findings from the documents in your assessment.

Return ONLY the JSON object. No markdown, no code fences, no commentary.`;
}

export const REEVALUATION_SYSTEM_PROMPT =
  "You are a senior legal advisory AI embedded in a startup legal platform. You are performing a RE-EVALUATION of a startup's legal health after they've taken action. Respond with valid JSON only — no markdown, no code fences, no commentary before or after the JSON.";

export const DOCUMENT_SYSTEM_PROMPT =
  "You are a legal document generation engine for a startup legal platform. You generate professional, jurisdiction-appropriate legal documents based on templates and user inputs. Output only the document text in markdown format — no preamble, no commentary.";

export function buildDocumentPrompt(promptInstructions: string, fieldSummary: string): string {
  return `${promptInstructions}

DOCUMENT DETAILS:
${fieldSummary}

Generate the full document text now. Use professional legal language but keep it readable. Format with clear section headers (use markdown ## for sections). Do not include signature lines or execution blocks.`;
}

export const CHAT_SYSTEM_PROMPT = `You are Orion, an AI legal co-pilot for startup founders. You are embedded in a legal health platform.

RULES — follow these exactly:
1. You explain legal concepts in plain, founder-friendly language.
2. You NEVER claim to provide legal advice. Every response must end with a brief disclaimer.
3. You suggest concrete next steps the founder can take.
4. For high-risk or complex matters (litigation, tax disputes, regulatory investigations), you MUST recommend speaking to a qualified lawyer.
5. You are aware of the founder's startup profile and any legal issues flagged by the platform. Use this context to give relevant, specific answers.
6. Keep responses concise — founders are busy. Use bullet points and bold for key terms.
7. If asked about something outside your knowledge, say so honestly.
8. You cover: incorporation, equity, governance, employment, IP, contracts, data privacy, regulation, tax, and investment readiness.

DISCLAIMER (include a version of this at the end of every response):
"This is general guidance, not legal advice. For binding decisions, consult a licensed attorney in your jurisdiction."`;

export function buildChatContext({ startup, issues }: Pick<ChatContext, "startup" | "issues">): string {
  const active = issues.filter((i) => !i.isResolved);
  let context = `STARTUP CONTEXT:\n- Company: ${startup.name}`;
  if (startup.stage) context += `\n- Stage: ${startup.stage}`;
  if (startup.structure) context += `\n- Structure: ${startup.structure}`;
  if (startup.primaryJurisdiction) context += `\n- Jurisdiction: ${startup.primaryJurisdiction}`;
  if (startup.riskScore !== null) context += `\n- Legal Health Score: ${startup.riskScore}/100`;
  if (active.length > 0) {
    context += `\n\nACTIVE LEGAL ISSUES (${active.length}):`;
    for (const issue of active.slice(0, 10)) {
      context += `\n- [${issue.severity.toUpperCase()}] ${issue.title} (${issue.domain})`;
    }
  } else {
    context += `\n\nNo active legal issues flagged.`;
  }
  return context;
}
