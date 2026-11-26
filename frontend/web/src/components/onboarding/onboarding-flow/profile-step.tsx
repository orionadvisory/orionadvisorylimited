"use client";

import { Building2 } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import {
  stageOptions,
  jurisdictionOptions,
  cofounderOptions,
  employeeOptions,
  industryOptions,
} from "@orion/core/health-check/questions";
import type { ProfileData } from "@orion/core/health-check/types";
import { fieldInputClass, fieldLabelClass } from "@/components/assessment/question-field/styles";
import { CheckTile, OptionGroup } from "./option-tiles";

interface ProfileStepProps {
  companyName: string;
  onCompanyNameChange: (name: string) => void;
  profile: Partial<ProfileData>;
  onProfileChange: (updates: Partial<ProfileData>) => void;
}

/** Step 1: company name + profile questions as bento option tiles. */
export function ProfileStep({ companyName, onCompanyNameChange, profile, onProfileChange }: ProfileStepProps) {
  return (
    <>
      <header className="mb-8">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">
          Step 01 <span className="text-mist">/ 02 · Your startup</span>
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink text-balance sm:text-5xl">
          Tell us about your <em className="text-brand">startup</em>
        </h1>
        <p className="mt-4 max-w-2xl border-l-2 border-brand/40 pl-4 text-sm leading-relaxed text-mist">
          This helps us tailor your legal health assessment.
        </p>
      </header>

      <div className="space-y-4">
        <BentoCard>
          <BentoCardHeader
            title="Company"
            description="As it appears on your incorporation documents"
            icon={
              <IconChip tone="teal">
                <Building2 />
              </IconChip>
            }
          />
          <label className="mt-5 block">
            <span className={fieldLabelClass}>Company name</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              placeholder="e.g. Acme Inc"
              className={fieldInputClass}
            />
          </label>
        </BentoCard>

        <BentoCard className="space-y-8">
          <OptionGroup
            label="What stage is your startup?"
            options={stageOptions}
            value={profile.stage}
            onSelect={(stage) => onProfileChange({ stage })}
          />
          <OptionGroup
            label="Where is your company based?"
            options={jurisdictionOptions}
            value={profile.jurisdiction}
            onSelect={(jurisdiction) => onProfileChange({ jurisdiction })}
          />
          <OptionGroup
            label="How many co-founders?"
            options={cofounderOptions}
            value={profile.cofounders}
            onSelect={(cofounders) => onProfileChange({ cofounders })}
          />
          <OptionGroup
            label="Do you have employees or contractors?"
            options={employeeOptions}
            value={profile.employees}
            onSelect={(employees) => onProfileChange({ employees })}
          />
          <OptionGroup
            label="What industry?"
            options={industryOptions}
            value={profile.industry}
            onSelect={(industry) => onProfileChange({ industry })}
          />
        </BentoCard>

        <BentoCard>
          <p className="mb-3 text-sm font-semibold text-ink">Quick questions</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <CheckTile
              checked={!!profile.hasRevenue}
              label="We have revenue"
              onClick={() => onProfileChange({ hasRevenue: !profile.hasRevenue })}
            />
            <CheckTile
              checked={!!profile.raisingFunding}
              label="We are currently raising / planning to raise funding"
              onClick={() => onProfileChange({ raisingFunding: !profile.raisingFunding })}
            />
          </div>
        </BentoCard>
      </div>
    </>
  );
}
