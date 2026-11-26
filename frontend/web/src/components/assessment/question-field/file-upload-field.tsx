"use client";

import { FileText, Loader2, Paperclip, Upload, X } from "lucide-react";
import { IconChip } from "@orion/ui/components/ui/bento-card";
import { cn } from "@orion/ui/utils";
import type { AnswerChangeHandler, Question } from "./types";
import { UPLOAD_ACCEPT } from "./styles";
import { useFileUpload } from "./use-file-upload";

export interface FileUploadFieldProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: AnswerChangeHandler;
  assessmentId?: string;
  /** Small "attach supporting document" pill used under every question. */
  compact?: boolean;
}

function UploadBar({ progress, className }: { progress: number; className?: string }) {
  return (
    <div className={cn("h-1 overflow-hidden rounded-full bg-line/70", className)} aria-hidden="true">
      <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  );
}

function UploadError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-xs text-ember-deep">
      {message}
    </p>
  );
}

function HiddenFileInput({ disabled, onFile }: { disabled: boolean; onFile: (f: File) => void }) {
  return (
    <input
      type="file"
      className="sr-only"
      accept={UPLOAD_ACCEPT}
      disabled={disabled}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFile(file);
      }}
    />
  );
}

export function FileUploadField({ question, value, onChange, assessmentId, compact = false }: FileUploadFieldProps) {
  const { parsed, uploading, uploadError, progress, handleFile, handleRemove } = useFileUpload({
    question,
    value,
    onChange,
    assessmentId,
    compact,
  });

  if (parsed) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft/60 py-2 pl-2 pr-3">
        <IconChip tone="white" size="sm">
          <FileText />
        </IconChip>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{parsed.fileName}</p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-brand">Attached</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${parsed.fileName}`}
          className="focus-ring grid size-8 place-items-center rounded-full text-mist transition-colors hover:bg-white hover:text-ember-deep"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div>
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed px-3.5 py-2 text-xs font-medium transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10",
            uploading
              ? "border-brand/40 bg-brand-soft/50 text-brand"
              : "border-line-strong bg-white/60 text-mist hover:border-brand hover:bg-white hover:text-brand"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              <span>Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <Paperclip className="size-3.5" aria-hidden="true" />
              <span>Attach supporting document</span>
            </>
          )}
          <HiddenFileInput disabled={uploading} onFile={handleFile} />
        </label>
        {uploading && <UploadBar progress={progress} className="mt-2 w-48" />}
        <UploadError message={uploadError} />
      </div>
    );
  }

  return (
    <div>
      <label
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10",
          uploading
            ? "border-brand/40 bg-brand-soft/40"
            : "border-line-strong bg-canvas/50 hover:border-brand hover:bg-brand-soft/30"
        )}
      >
        {uploading ? (
          <>
            <IconChip tone="teal" size="lg">
              <Loader2 className="animate-spin" />
            </IconChip>
            <span className="text-sm font-medium text-brand">Uploading… {progress}%</span>
            <UploadBar progress={progress} className="w-full max-w-xs" />
          </>
        ) : (
          <>
            <IconChip tone="white" size="lg" className="transition-transform duration-300 group-hover:-translate-y-0.5">
              <Upload />
            </IconChip>
            <span className="text-sm font-medium text-ink">Click to upload a file</span>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
              PDF, DOCX, PNG, JPG · up to 10MB
            </span>
          </>
        )}
        <HiddenFileInput disabled={uploading} onFile={handleFile} />
      </label>
      <UploadError message={uploadError} />
    </div>
  );
}
