import {
  stageOptions,
  jurisdictionOptions,
  cofounderOptions,
  employeeOptions,
  industryOptions,
} from "@orion/core/health-check/questions";
import type { ProfileData } from "@orion/core/health-check/types";
import { ChoiceGroup, OptionButton, ToggleRow } from "./choice";

type SelectKey = "stage" | "jurisdiction" | "cofounders" | "employees" | "industry";

const GROUPS: { key: SelectKey; label: string; options: { value: string; label: string }[] }[] = [
  { key: "stage", label: "What stage is your startup?", options: stageOptions },
  { key: "jurisdiction", label: "Where is your company based?", options: jurisdictionOptions },
  { key: "cofounders", label: "How many co-founders?", options: cofounderOptions },
  { key: "employees", label: "Do you have employees or contractors?", options: employeeOptions },
  { key: "industry", label: "What industry?", options: industryOptions },
];

export function ProfileStep({
  profile,
  onChange,
}: {
  profile: Partial<ProfileData>;
  onChange: (updates: Partial<ProfileData>) => void;
}) {
  return (
    <div className="space-y-8">
      {GROUPS.map((group) => (
        <ChoiceGroup key={group.key} label={group.label}>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.options.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={profile[group.key] === opt.value}
                label={opt.label}
                onClick={() => onChange({ [group.key]: opt.value })}
              />
            ))}
          </div>
        </ChoiceGroup>
      ))}

      <ChoiceGroup label="Quick questions">
        <div className="space-y-2">
          <ToggleRow
            checked={!!profile.hasRevenue}
            onToggle={() => onChange({ hasRevenue: !profile.hasRevenue })}
            title="We have revenue"
          />
          <ToggleRow
            checked={!!profile.raisingFunding}
            onToggle={() => onChange({ raisingFunding: !profile.raisingFunding })}
            title="We are currently raising / planning to raise funding"
          />
        </div>
      </ChoiceGroup>
    </div>
  );
}
