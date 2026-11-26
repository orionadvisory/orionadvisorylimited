"use client";

import { Info } from "lucide-react";
import { PaperDocument } from "../paper-document";
import { GeneratingState } from "./generating-state";
import { InputForm } from "./input-form";
import { TemplateGallery } from "./template-gallery";
import { type GeneratedDoc, useDocumentGenerator } from "./use-document-generator";

function downloadGenerated(doc: GeneratedDoc) {
  const blob = new Blob([doc.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.name.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DocumentGenerator({ onDocGenerated }: { onDocGenerated?: () => void }) {
  const { step, selectedTemplate, generatedDoc, error, recommended, handleGenerate, selectTemplate, backToSelect, buildPrefill } =
    useDocumentGenerator(onDocGenerated);

  if (step === "generating") {
    return <GeneratingState templateName={selectedTemplate?.name} />;
  }

  if (step === "view" && generatedDoc) {
    return (
      <PaperDocument
        name={generatedDoc.name}
        meta={`${generatedDoc.type} · Generated just now`}
        content={generatedDoc.content}
        sourceLabel="Generated"
        backLabel="Generate another"
        onBack={backToSelect}
        onDownload={() => downloadGenerated(generatedDoc)}
        footer={
          <div className="mt-4 flex items-start gap-3 rounded-bento-sm border border-gold/20 bg-gold-soft px-4 py-3.5">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
            <p className="text-xs leading-5 text-gold-deep">
              This document was AI-generated and should be reviewed by a qualified legal professional before execution.
              Orion does not provide legal advice.
            </p>
          </div>
        }
      />
    );
  }

  if (step === "input" && selectedTemplate) {
    return (
      <InputForm
        key={selectedTemplate.id}
        template={selectedTemplate}
        onBack={backToSelect}
        onGenerate={handleGenerate}
        prefill={buildPrefill(selectedTemplate)}
        error={error}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">Template gallery</p>
        <h2 className="mt-2 font-display text-3xl leading-[1.05] tracking-tight text-ink sm:text-4xl">
          What shall we <em className="text-brand">draft</em> today?
        </h2>
        <p className="mt-2 max-w-xl text-sm text-mist">
          Choose a template and fill in the details. Orion generates a professional legal document from your startup
          profile.
        </p>
      </div>
      <TemplateGallery onSelect={selectTemplate} recommended={recommended} />
    </div>
  );
}
