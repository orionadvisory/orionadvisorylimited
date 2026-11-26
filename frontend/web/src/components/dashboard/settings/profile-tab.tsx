import { KeyRound, UserRound } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { SaveButton, SettingsField } from "./settings-field";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ProfileTabProps {
  user: { name: string; email: string };
}

export default function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
      <BentoCard as="section" padding="lg" aria-labelledby="profile-title" className="xl:col-span-8">
        <BentoCardHeader
          title={<span id="profile-title">Profile Information</span>}
          description="How you appear across your Orion workspace"
          icon={
            <IconChip tone="teal">
              <UserRound />
            </IconChip>
          }
        />

        <div className="mt-6 flex items-center gap-4 rounded-bento-sm bg-canvas p-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-ink">
            <span className="font-display text-2xl text-aurora">{getInitials(user.name)}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-2xl leading-tight text-ink">{user.name}</p>
            <button
              type="button"
              className="focus-ring mt-0.5 rounded-full text-xs font-medium text-brand underline-offset-4 hover:underline"
            >
              Change avatar
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SettingsField label="Full Name" defaultValue={user.name} />
          <SettingsField
            label="Email Address"
            defaultValue={user.email}
            readOnly
            hint="Contact support to change your email address"
          />
        </div>
        <div className="mt-6 border-t border-line pt-6">
          <SaveButton />
        </div>
      </BentoCard>

      <BentoCard as="section" variant="tinted-teal" aria-labelledby="security-title" className="xl:col-span-4">
        <BentoCardHeader
          title={<span id="security-title">Security</span>}
          description="Your sign-in credentials"
          icon={
            <IconChip tone="white" className="border-transparent">
              <KeyRound />
            </IconChip>
          }
        />
        <SettingsField label="Password" defaultValue="••••••••••" readOnly className="mt-5" />
      </BentoCard>
    </div>
  );
}
