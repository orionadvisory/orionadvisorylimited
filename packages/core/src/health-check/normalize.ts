// The AI returns severity / resolutionPath as free-text JSON. Coerce those
// values to the exact DB enum members so inserts can never throw on a stray
// variant like "Medium", "moderate", or "self-serve".

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type ResolutionPath =
  | "self_serve"
  | "document_generation"
  | "expert_referral";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];
const RESOLUTIONS: ResolutionPath[] = [
  "self_serve",
  "document_generation",
  "expert_referral",
];

export function normalizeSeverity(value: unknown): Severity {
  const v = String(value ?? "")
    .toLowerCase()
    .trim();
  if ((SEVERITIES as string[]).includes(v)) return v as Severity;
  if (v === "moderate" || v === "med") return "medium";
  if (v === "urgent" || v === "severe") return "critical";
  if (v === "informational" || v === "none") return "info";
  return "medium";
}

export function normalizeResolutionPath(value: unknown): ResolutionPath {
  const v = String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
  if ((RESOLUTIONS as string[]).includes(v)) return v as ResolutionPath;
  if (v.includes("document") || v.includes("generate")) {
    return "document_generation";
  }
  if (v.includes("expert") || v.includes("referral") || v.includes("lawyer")) {
    return "expert_referral";
  }
  return "self_serve";
}
