import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@orion/ui/components/ui/card";
import { Badge } from "@orion/ui/components/ui/badge";
import { FileText, ArrowRight, Plus, Upload, Sparkles } from "lucide-react";
import { Button } from "@orion/ui/components/ui/button";

interface RecentDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  source?: "generated" | "uploaded";
  createdAt: Date;
}

export default function RecentDocuments({ docs }: { docs: RecentDoc[] }) {
  return (
    <Card className="border-stone-200/80 bg-white/85 shadow-md shadow-stone-900/[0.04] backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-stone-950">Recent Documents</CardTitle>
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="text-stone-600 hover:bg-stone-100 hover:text-stone-950">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50/60 py-8 text-center">
            <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-600">No documents yet</p>
            <p className="text-xs text-stone-500 mt-1">
              Generate your first legal document to get started
            </p>
            <Link href="/dashboard/documents">
              <Button size="sm" className="mt-3">
                <Plus className="w-3.5 h-3.5" /> Generate Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => {
              return (
                <Link
                  key={doc.id}
                  href="/dashboard/documents"
                  className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-stone-200 hover:bg-stone-50/80"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    doc.source === "uploaded" ? "bg-emerald-50" : "bg-amber-50"
                  }`}>
                    {doc.source === "uploaded" ? (
                      <Upload className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-950 truncate group-hover:text-emerald-700 transition-colors">
                      {doc.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {doc.type} / {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={doc.source === "uploaded" ? "success" : "info"}>
                    {doc.source === "uploaded" ? "Uploaded" : "Generated"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
