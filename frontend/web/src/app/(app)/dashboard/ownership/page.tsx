import { Network } from "lucide-react";
import { ModulePage } from "@/components/dashboard/workspace/module-page";

export default function OwnershipPage() {
  return <ModulePage title="Ownership" accent="& structure" icon={Network} description="Build an effective-dated register and group chart that distinguishes legal, economic, voting and beneficial ownership." note="Ownership remains self-reported until supporting evidence is reviewed. Historical snapshots will remain reproducible." stats={[{label:"Recorded holders",value:"—",hint:"Not available yet"},{label:"Direct interests",value:"—",hint:"Not available yet"},{label:"Pending approval",value:"—",hint:"Not available yet"},{label:"Verification",value:"—",hint:"Not available yet"}]} items={[{title:"Create the opening register",detail:"Record founders, corporate shareholders and external investors as of the chosen effective date.",meta:"Opening snapshot · Self-reported",status:"Missing information"},{title:"Generate group chart",detail:"A chart becomes available when entity relationships and ownership interests are recorded.",meta:"PDF · PNG · SVG",status:"Needs confirmation"}]} />;
}
