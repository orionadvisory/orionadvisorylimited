import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import DocumentList from "@/components/dashboard/documents/document-list";

export default function DocumentsPage() {
  return (
    <div>
      <Topbar title="Documents" subtitle="Generated and stored legal documents" />
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <PageHero
          kicker="Workspace · Documents"
          title={
            <>
              Your <em>documents</em>
            </>
          }
          description="Every agreement Orion has drafted for you and every file you've uploaded — searchable, viewable and ready to download."
        />
        <DocumentList />
      </div>
    </div>
  );
}
