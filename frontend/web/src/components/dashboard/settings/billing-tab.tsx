import { CreditCard, Gem, Plus } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";

export default function BillingTab() {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <BentoCard as="section" variant="ink" padding="lg" aria-labelledby="plan-title">
        <div className="flex items-center gap-3">
          <IconChip tone="on-ink">
            <Gem />
          </IconChip>
          <h2 id="plan-title" className="text-base font-semibold tracking-tight text-[#f4efe6]">
            Current Plan
          </h2>
        </div>
        <p className="mt-8 font-display text-4xl leading-tight tracking-tight text-[#f4efe6]">
          No active plan
        </p>
        <p className="mt-2 text-sm text-[#b9c4bf]">Subscribe to unlock full legal operations</p>
        <button
          type="button"
          className="focus-ring mt-6 inline-flex items-center rounded-full bg-aurora px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white focus-visible:outline-aurora"
        >
          Upgrade
        </button>
      </BentoCard>

      <BentoCard as="section" padding="lg" aria-labelledby="payment-title">
        <BentoCardHeader
          title={<span id="payment-title">Payment Method</span>}
          icon={
            <IconChip tone="canvas">
              <CreditCard />
            </IconChip>
          }
        />
        <div className="mt-6 flex flex-col items-start gap-4 rounded-bento-sm border border-dashed border-line-strong bg-canvas p-5">
          <p className="font-display text-xl leading-snug text-ink-soft">No payment method on file.</p>
          <button
            type="button"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
          >
            <Plus className="size-4" aria-hidden="true" /> Add Payment Method
          </button>
        </div>
      </BentoCard>
    </div>
  );
}
