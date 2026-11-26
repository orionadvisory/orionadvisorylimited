import { Topbar } from "@/components/layout/topbar";
import AiChat from "@/components/dashboard/ai/ai-chat";

export default function AIPage() {
  return (
    <div className="flex h-screen flex-col supports-[height:100dvh]:h-dvh">
      <Topbar title="AI Assistant" subtitle="Orion Legal Co-pilot" />
      <AiChat />
    </div>
  );
}
