import { BadgeCheck } from "lucide-react";
import { ModulePage } from "@/components/dashboard/workspace/module-page";

export default function LicencesPage() {
  return <ModulePage title="Licences" accent="& renewals" icon={BadgeCheck} description="Track permits, registrations, insurance, contracts and other renewable records with evidence and reminder intervals." note="Recurrence is confirmed by you or a verified rule. Registration and annual returns are tracked as separate obligations." stats={[{label:"Active records",value:"—",hint:"Not available yet"},{label:"Expiring soon",value:"—",hint:"Not available yet"},{label:"Renewals in progress",value:"—",hint:"Not available yet"},{label:"Missing evidence",value:"—",hint:"Not available yet"}]} items={[{title:"Add your first renewal",detail:"Capture the issuing authority, reference, expiry, application deadline and evidence.",meta:"Custom renewal · Reminder-ready",status:"Missing information"},{title:"Reminder schedule",detail:"Choose from 90, 60, 30, 14, 7 and 1 day reminders once a date is confirmed.",meta:"Email + in-app",status:"Needs confirmation"}]} />;
}
