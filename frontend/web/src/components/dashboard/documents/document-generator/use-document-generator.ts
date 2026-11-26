"use client";

import { useEffect, useState } from "react";
import type { DocumentTemplate } from "@orion/core/documents/templates";

export interface GeneratedDoc {
  id: string;
  name: string;
  content: string;
  type: string;
  createdAt: string;
}

export interface RecommendedDoc {
  issueId: string;
  issueTitle: string;
  severity: string;
  templateId: string;
  templateName: string;
}

interface StartupContext {
  name: string;
  jurisdiction: string | null;
  stage: string | null;
}

export type GeneratorStep = "select" | "input" | "generating" | "view";

/** Map stored jurisdiction values to template jurisdiction option values */
const jurisdictionMap: Record<string, string> = {
  us_delaware: "delaware",
  us_other: "california",
  uk: "england_wales",
  nigeria: "nigeria",
  singapore: "singapore",
};

/** Drives the generator wizard: recommended fetch, step state, prefill and the generate call. */
export function useDocumentGenerator(onDocGenerated?: () => void) {
  const [step, setStep] = useState<GeneratorStep>("select");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDoc | null>(null);
  const [error, setError] = useState("");
  const [recommended, setRecommended] = useState<RecommendedDoc[]>([]);
  const [startupCtx, setStartupCtx] = useState<StartupContext | null>(null);

  useEffect(() => {
    fetch("/api/documents/recommended")
      .then((res) => res.json())
      .then((data) => {
        setRecommended(data.recommended || []);
        if (data.startup) setStartupCtx(data.startup);
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (fields: Record<string, string>) => {
    if (!selectedTemplate) return;
    setStep("generating");
    setError("");

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate.id, fields }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const doc = await res.json();
      setGeneratedDoc(doc);
      setStep("view");
      onDocGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("input");
    }
  };

  const selectTemplate = (t: DocumentTemplate) => {
    setSelectedTemplate(t);
    setStep("input");
  };

  const backToSelect = () => {
    setStep("select");
    setSelectedTemplate(null);
    setGeneratedDoc(null);
  };

  /** Build prefill from startup context */
  const buildPrefill = (template: DocumentTemplate) => {
    const prefill: Record<string, string> = {};
    if (!startupCtx) return prefill;
    for (const field of template.fields) {
      if (field.id === "company_name" || field.id === "disclosing_party" || field.id === "controller_name") {
        prefill[field.id] = startupCtx.name;
      }
      if (field.id === "jurisdiction" && startupCtx.jurisdiction) {
        const mapped = jurisdictionMap[startupCtx.jurisdiction];
        if (mapped) prefill[field.id] = mapped;
      }
    }
    return prefill;
  };

  return {
    step,
    selectedTemplate,
    generatedDoc,
    error,
    recommended,
    handleGenerate,
    selectTemplate,
    backToSelect,
    buildPrefill,
  };
}
