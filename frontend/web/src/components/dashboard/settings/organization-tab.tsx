import { Building2 } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { SaveButton, SettingsField, SettingsSelect } from "./settings-field";

interface OrganizationTabProps {
  startup: {
    name: string;
    stage: string | null;
    structure: string | null;
    primaryJurisdiction: string | null;
  } | null;
}

export default function OrganizationTab({ startup }: OrganizationTabProps) {
  return (
    <BentoCard as="section" padding="lg" aria-labelledby="startup-profile-title" className="max-w-3xl">
      <BentoCardHeader
        title={<span id="startup-profile-title">Startup Profile</span>}
        description="Orion tailors documents and risk checks to these details"
        icon={
          <IconChip tone="gold">
            <Building2 />
          </IconChip>
        }
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <SettingsField label="Company Name" defaultValue={startup?.name || ""} className="sm:col-span-2" />
        <SettingsSelect label="Stage" defaultValue={startup?.stage || ""}>
          <option value="">Select stage</option>
          <option value="idea">Idea</option>
          <option value="pre_seed">Pre-seed</option>
          <option value="seed">Seed</option>
          <option value="series_a">Series A</option>
          <option value="series_b">Series B+</option>
        </SettingsSelect>
        <SettingsSelect label="Entity Structure" defaultValue={startup?.structure || ""}>
          <option value="">Select structure</option>
          <option value="UK Ltd">UK Ltd</option>
          <option value="Delaware C-Corp">Delaware C-Corp</option>
          <option value="Wyoming LLC">Wyoming LLC</option>
          <option value="Nigerian RC">Nigerian RC</option>
          <option value="Free Zone Entity">Free Zone Entity</option>
        </SettingsSelect>
        <SettingsField
          label="Jurisdiction"
          defaultValue={startup?.primaryJurisdiction || ""}
          className="sm:col-span-2"
        />
      </div>
      <div className="mt-6 border-t border-line pt-6">
        <SaveButton />
      </div>
    </BentoCard>
  );
}
