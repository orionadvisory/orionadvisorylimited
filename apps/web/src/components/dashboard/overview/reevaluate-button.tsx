"use client";

import { useState } from "react";
import { Button } from "@orion/ui/components/ui/button";
import { Card } from "@orion/ui/components/ui/card";
import { Badge } from "@orion/ui/components/ui/badge";
import {
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

interface ReevalResult {
  overallScore: number;
  previousScore: number;
  scoreChange: number;
  riskLevel: string;
  commentary: string;
  summary: string;
  generatedDocCount: number;
}

export default function ReevaluateButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReevalResult | null>(null);
  const [error, setError] = useState("");

  const handleReevaluate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/health-check/reevaluate", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Re-evaluation failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const improved = result.scoreChange > 0;
    const unchanged = result.scoreChange === 0;
    const TrendIcon = improved ? TrendingUp : unchanged ? Minus : TrendingDown;
    const trendColor = improved
      ? "text-emerald-600"
      : unchanged
        ? "text-stone-500"
        : "text-rose-600";
    const trendBg = improved
      ? "bg-emerald-50 border-emerald-200"
      : unchanged
        ? "bg-stone-50 border-stone-200"
        : "bg-rose-50 border-rose-200";

    return (
      <Card className="overflow-hidden border-stone-200/80 bg-white/85 shadow-md shadow-stone-900/[0.04] backdrop-blur">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-semibold text-stone-950">
                Legal Health Re-evaluation
              </h3>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Score comparison */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-5">
            <div className="text-center">
              <p className="text-xs text-stone-500 mb-1">Previous</p>
              <p className="text-2xl font-bold text-stone-400">{result.previousScore}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-300" />
            <div className="text-center">
              <p className="text-xs text-stone-500 mb-1">New Score</p>
              <p className="text-2xl font-bold text-stone-950">{result.overallScore}</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${trendBg}`}>
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              <span className={`text-sm font-bold ${trendColor}`}>
                {result.scoreChange > 0 ? "+" : ""}
                {result.scoreChange}
              </span>
            </div>
          </div>

          {/* Commentary */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-4 mb-4">
            <p className="text-sm text-emerald-950 leading-relaxed">
              {result.commentary}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-500">
              Based on {result.generatedDocCount} document{result.generatedDocCount !== 1 ? "s" : ""} generated
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                Dismiss
              </Button>
              <Link href="/dashboard/documents">
                <Button size="sm">
                  Keep improving <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200/80 bg-white/85 shadow-md shadow-stone-900/[0.04] backdrop-blur">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-950">Re-evaluate Legal Health</p>
            <p className="text-xs text-stone-500">
              Run a fresh AI assessment including your generated documents
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleReevaluate}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analysing...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Re-evaluate
            </>
          )}
        </Button>
      </div>
      {error && (
        <div className="px-5 pb-4">
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}
    </Card>
  );
}
