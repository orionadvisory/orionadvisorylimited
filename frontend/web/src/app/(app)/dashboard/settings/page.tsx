import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import SettingsPanel from "@/components/dashboard/settings/settings-panel";
import { getDashboardData } from "@/app/actions/dashboard";
import { getEntities } from "@/app/actions/entities";
import { getMembers, getWorkspaceAccess } from "@/app/actions/workspace";

export default async function SettingsPage() {
  const [data, access] = await Promise.all([getDashboardData(), getWorkspaceAccess()]);
  const canManageTeam = access?.permissions.includes("members:manage") ?? false;
  const [members, entities] = canManageTeam ? await Promise.all([getMembers(), getEntities()]) : [[], []];
  const team = {
    access,
    members,
    entities: entities.map(({ id, name, jurisdiction }) => ({ id, name, jurisdiction })),
  };

  const userInfo = data
    ? { name: data.user.name, email: data.user.email }
    : { name: "", email: "" };

  const startupInfo = data?.startup
    ? {
        name: data.startup.name,
        stage: data.startup.stage,
        structure: data.startup.structure,
        primaryJurisdiction: data.startup.primaryJurisdiction,
      }
    : null;

  const initials = userInfo.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <Topbar title="Settings" userInitials={initials} />
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <PageHero
          kicker="Account · Settings"
          title={
            <>
              Your <em>settings</em>
            </>
          }
          description="Manage your profile, startup details, team access, billing and notifications."
        />
        <SettingsPanel user={userInfo} startup={startupInfo} team={team} />
      </div>
    </div>
  );
}
