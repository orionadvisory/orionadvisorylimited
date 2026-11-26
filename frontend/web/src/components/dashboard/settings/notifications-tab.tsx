import { Bell } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";

const notificationItems = [
  { label: "Workflow updates", desc: "When a workflow step is completed" },
  { label: "Document ready", desc: "When a generated document is available" },
  { label: "Legal alerts", desc: "Risk alerts and time-sensitive reminders" },
  { label: "Product updates", desc: "New features and improvements" },
];

export default function NotificationsTab() {
  return (
    <BentoCard as="section" padding="lg" aria-labelledby="notifications-title" className="max-w-3xl">
      <BentoCardHeader
        title={<span id="notifications-title">Notification Preferences</span>}
        description="Choose what Orion tells you about"
        icon={
          <IconChip tone="ember">
            <Bell />
          </IconChip>
        }
      />
      <ul className="mt-5 space-y-2">
        {notificationItems.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-4 rounded-bento-sm px-4 py-3.5 transition-colors hover:bg-canvas"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="mt-0.5 text-xs text-mist">{item.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked="true"
              aria-label={item.label}
              className="focus-ring relative h-6 w-11 shrink-0 rounded-full bg-brand transition-colors hover:bg-brand-hover"
            >
              <span className="absolute right-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm" />
            </button>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}
