"use client";

import { useState } from "react";
import { PLACEHOLDER_WORKFLOWS } from "@/lib/data/workflows";
import { JourneyCard } from "./journey-card";
import { WorkflowCard } from "./workflow-card";

export default function WorkflowList() {
  const [expanded, setExpanded] = useState<string>("wf_01");

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-8">
        {PLACEHOLDER_WORKFLOWS.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            expanded={expanded === workflow.id}
            onToggle={() => setExpanded(expanded === workflow.id ? "" : workflow.id)}
          />
        ))}
      </div>
      <JourneyCard workflows={PLACEHOLDER_WORKFLOWS} className="xl:sticky xl:top-24 xl:col-span-4" />
    </div>
  );
}
