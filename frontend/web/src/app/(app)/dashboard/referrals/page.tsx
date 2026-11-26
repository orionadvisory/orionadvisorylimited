import { Topbar } from "@/components/layout/topbar";
import ReferralPanel from "@/components/dashboard/referrals/referral-panel";

export default function ReferralsPage() {
  return (
    <div>
      <Topbar title="Expert Referrals" subtitle="Get matched with qualified legal professionals" />
      {/* PageHero lives inside ReferralPanel so its headline numerals can use the client-loaded referrals. */}
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <ReferralPanel />
      </div>
    </div>
  );
}
