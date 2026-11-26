import type { WorkspaceAccessDto, WorkspaceMemberDto } from "@orion/contracts";
import { Users } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { AddMemberForm } from "./add-member-form";
import { MemberRow } from "./member-row";
import { roleLabel, type EntityOption } from "./roles";

export default function TeamTab({
  access,
  members,
  entities,
  currentUserEmail,
}: {
  access: WorkspaceAccessDto | null;
  members: WorkspaceMemberDto[];
  entities: EntityOption[];
  currentUserEmail: string;
}) {
  const canManage = access?.permissions.includes("members:manage") ?? false;

  return (
    <BentoCard as="section" padding="none" aria-labelledby="team-title" className="max-w-4xl overflow-hidden">
      <div className="p-5 sm:p-6">
        <BentoCardHeader
          title={<span id="team-title">Team access</span>}
          description={access ? `${access.workspaceName} · You are ${roleLabel(access.role).toLowerCase()}` : "Complete your company profile to invite your team"}
          icon={<IconChip tone="teal"><Users /></IconChip>}
        />
      </div>

      {!access ? null : !canManage ? (
        <p className="border-t border-line px-6 py-8 text-sm text-ink-soft">
          Only owners and administrators can manage the team. Ask one of them if you need different access.
        </p>
      ) : (
        <>
          <div className="divide-y divide-line border-t border-line">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                actorRole={access.role}
                isSelf={member.email === currentUserEmail}
                entities={entities}
              />
            ))}
          </div>
          <div className="border-t border-line p-5 sm:p-6">
            <AddMemberForm actorRole={access.role} entities={entities} />
          </div>
        </>
      )}
    </BentoCard>
  );
}
