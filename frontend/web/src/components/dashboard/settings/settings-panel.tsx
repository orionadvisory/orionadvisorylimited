"use client";

import { useState } from "react";
import type { WorkspaceAccessDto, WorkspaceMemberDto } from "@orion/contracts";
import { Bell, Building2, CreditCard, UserRound, Users } from "lucide-react";
import { cn } from "@orion/ui/utils";
import ProfileTab from "./profile-tab";
import OrganizationTab from "./organization-tab";
import BillingTab from "./billing-tab";
import NotificationsTab from "./notifications-tab";
import TeamTab from "./team-tab";
import type { EntityOption } from "./team-tab/roles";

const tabs = ["Profile", "Organization", "Team", "Billing", "Notifications"];

const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Profile: UserRound,
  Organization: Building2,
  Team: Users,
  Billing: CreditCard,
  Notifications: Bell,
};

interface SettingsPanelProps {
  user: { name: string; email: string };
  startup: {
    name: string;
    stage: string | null;
    structure: string | null;
    primaryJurisdiction: string | null;
  } | null;
  team: { access: WorkspaceAccessDto | null; members: WorkspaceMemberDto[]; entities: EntityOption[] };
}

export default function SettingsPanel({ user, startup, team }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div>
      <div className="-mx-4 mb-6 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Settings sections"
          className="inline-flex gap-1 rounded-full border border-line bg-white p-1 shadow-bento"
        >
          {tabs.map((tab) => {
            const Icon = tabIcons[tab];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`settings-tab-${tab}`}
                aria-selected={active}
                aria-controls="settings-tabpanel"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "focus-ring flex h-10 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-4 text-sm font-medium transition-colors duration-200",
                  active ? "bg-ink text-cloud" : "text-ink-soft hover:bg-canvas hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full transition-colors",
                    active ? "bg-white/10 text-aurora" : "bg-canvas text-mist"
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id="settings-tabpanel" aria-labelledby={`settings-tab-${activeTab}`}>
        {activeTab === "Profile" && <ProfileTab user={user} />}
        {activeTab === "Organization" && <OrganizationTab startup={startup} />}
        {activeTab === "Team" && (
          <TeamTab access={team.access} members={team.members} entities={team.entities} currentUserEmail={user.email} />
        )}
        {activeTab === "Billing" && <BillingTab />}
        {activeTab === "Notifications" && <NotificationsTab />}
      </div>
    </div>
  );
}
