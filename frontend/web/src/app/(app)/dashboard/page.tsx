import { AlertTriangle, FileText, ShieldAlert } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { Topbar } from "@/components/layout/topbar";
import { OverviewHeader } from "@/components/dashboard/overview/overview-header";
import { HealthScoreCard } from "@/components/dashboard/overview/health-score-card";
import { StatTile } from "@/components/dashboard/overview/stat-tile";
import { NextStepsCard } from "@/components/dashboard/overview/next-steps-card";
import RecentDocuments from "@/components/dashboard/overview/recent-documents";
import QuickActions from "@/components/dashboard/overview/quick-actions";
import {
  buildNextSteps,
  severityBreakdown,
  weakestDomains,
} from "@/components/dashboard/overview/overview-model";
import { getDashboardData } from "@/app/actions/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const userName = data?.user.name || "User";
  const firstName = userName.split(" ")[0];
  const initials = userName
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const startup = data?.startup;
  const stats = data?.stats || {
    documentCount: 0,
    issueCount: 0,
    resolvedCount: 0,
    criticalCount: 0,
  };

  const issues = data?.issues || [];
  const recentDocs = data?.recentDocs || [];
  const healthCheck = data?.healthCheck ?? null;
  const score = healthCheck?.overallScore ?? startup?.riskScore ?? null;

  return (
    <div>
      <Topbar
        title="Overview"
        subtitle={startup?.name || "My Startup"}
        userInitials={initials}
        userName={userName}
        userEmail={data?.user.email || ""}
        startupName={startup?.name}
        startupStage={startup?.stage}
      />
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <OverviewHeader
          firstName={firstName}
          startupName={startup?.name || null}
          stage={startup?.stage || null}
          jurisdiction={startup?.primaryJurisdiction || null}
          breakdown={severityBreakdown(issues)}
          hasHealthCheck={healthCheck !== null}
          resolvedCount={stats.resolvedCount}
          domainsAssessed={healthCheck ? Object.keys(healthCheck.domainScores).length : 0}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <HealthScoreCard
            className="xl:col-span-5 xl:row-span-2"
            score={score}
            riskLevel={healthCheck?.riskLevel ?? null}
            summary={healthCheck?.summary ?? null}
            completedAt={healthCheck?.completedAt ?? null}
            domains={weakestDomains(healthCheck)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:col-span-7">
            <StatTile
              variant="tinted-gold"
              label="Open issues"
              value={stats.issueCount}
              sub={stats.issueCount === 0 ? "All clear" : "Across your legal domains"}
              icon={<AlertTriangle />}
              href="/dashboard/ai"
              linkLabel="Get help with open issues"
              chip={
                stats.resolvedCount > 0 ? (
                  <Chip tone="teal">{stats.resolvedCount} resolved</Chip>
                ) : undefined
              }
            />
            <StatTile
              variant="tinted-ember"
              label="Critical & high"
              value={stats.criticalCount}
              sub={stats.criticalCount === 0 ? "Nothing urgent" : "Tackle these first"}
              icon={<ShieldAlert />}
              href="/dashboard/referrals"
              linkLabel="Talk to a legal expert about critical issues"
            />
            <StatTile
              variant="tinted-teal"
              label="Documents"
              value={stats.documentCount}
              sub={stats.documentCount === 0 ? "Generate your first" : "Generated & uploaded"}
              icon={<FileText />}
              href="/dashboard/documents"
              linkLabel="Open documents"
            />
          </div>

          <NextStepsCard
            className="xl:col-span-7"
            model={buildNextSteps(healthCheck, issues)}
            hasHealthCheck={healthCheck !== null}
          />

          <RecentDocuments docs={recentDocs} className="xl:col-span-7" />
          <QuickActions className="xl:col-span-5" />
        </div>
      </div>
    </div>
  );
}
