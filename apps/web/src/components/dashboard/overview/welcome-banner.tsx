import { Building2, MapPin, ShieldCheck, TrendingUp } from "lucide-react";

const stageLabels: Record<string, string> = {
  idea: "Idea stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth: "Growth",
};

interface WelcomeBannerProps {
  firstName: string;
  startupName: string | null;
  jurisdiction: string | null;
  stage: string | null;
  riskScore: number | null;
}

export default function WelcomeBanner({
  firstName,
  startupName,
  jurisdiction,
  stage,
  riskScore,
}: WelcomeBannerProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const details = [startupName, stage ? stageLabels[stage] || stage : null, jurisdiction]
    .filter(Boolean)
    .join(" / ");

  const scoreTone =
    riskScore === null
      ? "text-stone-400"
      : riskScore >= 75
        ? "text-emerald-300"
        : riskScore >= 50
          ? "text-amber-300"
          : "text-rose-300";

  return (
    <div className="relative overflow-hidden rounded-lg border border-stone-800/10 bg-[#17201c] p-5 text-white shadow-xl shadow-stone-900/10 sm:p-6 lg:p-7">
      <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-amber-200/10 blur-3xl" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
        <div>
          <p className="text-sm font-medium text-emerald-100/80 mb-2">{greeting}</p>
          <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-[#fffaf1] sm:text-3xl">
            {firstName}, here&apos;s your startup at a glance
          </h2>
          {details && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">{details}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {startupName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-stone-200">
                <Building2 className="h-3.5 w-3.5 text-emerald-200" />
                {startupName}
              </span>
            )}
            {stage && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-stone-200">
                <TrendingUp className="h-3.5 w-3.5 text-amber-200" />
                {stageLabels[stage] || stage}
              </span>
            )}
            {jurisdiction && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-stone-200">
                <MapPin className="h-3.5 w-3.5 text-stone-300" />
                {jurisdiction}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-inner shadow-white/5">
          <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
            <div className="flex items-center gap-2 lg:mb-4 lg:justify-end">
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              <div className="text-xs font-medium text-stone-300">Legal Health Score</div>
            </div>
            <div className={`text-5xl font-semibold leading-none ${scoreTone}`}>{riskScore ?? "--"}</div>
          </div>
          {riskScore !== null && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all"
                style={{ width: `${riskScore}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
