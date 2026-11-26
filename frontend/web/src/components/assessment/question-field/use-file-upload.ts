"use client";

import { useState } from "react";
import type { AnswerChangeHandler, Question, UploadValue } from "./types";

interface UseFileUploadArgs {
  question: Question;
  value: string | string[] | undefined;
  onChange: AnswerChangeHandler;
  assessmentId?: string;
  compact: boolean;
}

/**
 * Upload state for an assessment file field. Files are posted as FormData to
 * /api/documents/upload (the server proxies to R2, avoiding CORS). The
 * attachment answer for a compact (per-question) uploader is stored under
 * `{questionKey}__file`; a primary file_upload question uses its own key.
 */
export function useFileUpload({ question, value, onChange, assessmentId, compact }: UseFileUploadArgs) {
  const answerKey = compact ? `${question.questionKey}__file` : question.questionKey;

  const parsed: UploadValue | null = (() => {
    if (!value || typeof value !== "string") return null;
    try {
      return JSON.parse(value) as UploadValue;
    } catch {
      return null;
    }
  })();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (question.domain) formData.append("domain", question.domain);
      if (assessmentId) formData.append("assessmentId", assessmentId);
      formData.append("questionKey", question.questionKey);

      setProgress(30);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { uploadId, storageKey, fileName: savedName } = await res.json();
      setProgress(100);

      onChange(answerKey, JSON.stringify({ uploadId, fileName: savedName || file.name, storageKey }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(answerKey, "");
    setProgress(0);
  };

  return { parsed, uploading, uploadError, progress, handleFile, handleRemove };
}
