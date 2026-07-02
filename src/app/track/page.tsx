"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Scale,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import { MATTER_STAGES, stageStepMap, TOTAL_STAGES } from "@/lib/utils";
import type { MatterStatus, MatterStage, MatterUrgency } from "@/types";

interface TrackResult {
  referenceNumber: string;
  type: string;
  urgency: MatterUrgency;
  status: MatterStatus;
  stage: MatterStage;
  submittedAt: string;
  lastUpdated: string;
}

const statusMeta: Record<
  MatterStatus,
  { label: string; color: string; desc: string }
> = {
  unassigned: {
    label: "Awaiting assignment",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    desc: "Your matter has been received and is being reviewed by our admin team.",
  },
  assigned: {
    label: "Lawyer assigned",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    desc: "A volunteer lawyer has been assigned and will contact you shortly.",
  },
  in_progress: {
    label: "In progress",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    desc: "Your lawyer is actively working on your matter.",
  },
  under_review: {
    label: "Under review",
    color: "text-teal-700 bg-teal-50 border-teal-200",
    desc: "Your matter is currently under legal review.",
  },
  completed: {
    label: "Completed",
    color: "text-green-700 bg-green-50 border-green-200",
    desc: "Your matter has been resolved. We hope we were able to help.",
  },
  archived: {
    label: "Archived",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    desc: "This matter has been archived.",
  },
};

function TrackForm() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState(searchParams.get("ref") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  useEffect(() => {
    if (searchParams.get("ref")) handleSearch();
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ref.trim()) {
      setError("Please enter your reference number.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    const res = await fetch(
      "/api/matters/track?ref=" + encodeURIComponent(ref.trim().toUpperCase()),
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setResult(data);
  }

  const currentStep = result ? (stageStepMap[result.stage] ?? 1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-100 bg-white dark:bg-gray-800 dark:border-none">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-brand-100" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              HumRig
            </span>
          </Link>
          <Link
            href="/submit"
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            Submit a new matter
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-medium text-gray-900 mb-2 dark:text-gray-200">
            Track your matter
          </h1>
          <p className="text-sm text-gray-500">
            Enter the reference number from your submission confirmation.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9 font-mono tracking-wider uppercase"
              placeholder="e.g. LG-2026-00847"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" /> Track
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    Reference number
                  </div>
                  <div className="text-xl font-mono font-semibold text-gray-900 tracking-wider dark:text-gray-300">
                    {result.referenceNumber}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 capitalize ">
                    {result.type.replace(/_/g, " ")}
                  </div>
                </div>
                <span
                  className={
                    "badge text-sm px-3 py-1 " + statusMeta[result.status].color
                  }
                >
                  {statusMeta[result.status].label}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 mb-5">
                {statusMeta[result.status].desc}
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>
                    Step {currentStep} of {TOTAL_STAGES}
                  </span>
                </div>
                <div className="flex gap-1 mb-3">
                  {MATTER_STAGES.map(({ value, step }) => (
                    <div
                      key={value}
                      className={
                        "flex-1 h-2 rounded-full " +
                        (step < currentStep
                          ? "bg-brand-600 dark:bg-brand-400/80 "
                          : step === currentStep
                            ? "bg-brand-300"
                            : "bg-gray-100")
                      }
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Intake</span>
                  <span className="font-medium text-brand-400">
                    {MATTER_STAGES.find((s) => s.value === result.stage)?.label}
                  </span>
                  <span>Completed</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-sm font-medium mb-4">Matter stages</h2>
              <div className="space-y-3">
                {MATTER_STAGES.map(({ value, label, step }) => {
                  const done = step < currentStep,
                    current = step === currentStep;
                  return (
                    <div key={value} className="flex items-center gap-3">
                      <div
                        className={
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 " +
                          (done
                            ? "bg-brand-600"
                            : current
                              ? "bg-brand-100 border-2 border-brand-600"
                              : "bg-gray-100")
                        }
                      >
                        {done && (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        )}
                        {current && (
                          <div className="w-2 h-2 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <span
                        className={
                          "text-sm " +
                          (done
                            ? "text-gray-400 line-through"
                            : current
                              ? "text-gray-900 font-medium dark:text-gray-300"
                              : "text-gray-400")
                        }
                      >
                        {label}
                      </span>
                      {current && (
                        <span className="text-xs bg-brand-600 text-brand-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card grid grid-cols-2 gap-4 text-sm">
              {[
                ["Submitted", result.submittedAt],
                ["Last updated", result.lastUpdated],
              ].map(([label, date]) => (
                <div key={label}>
                  <div className="flex items-center gap-2 text-gray-400 mb-1 dark:text-brand-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-400">
                    {new Date(date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>

            {result.status === "completed" && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-800 mb-0.5">
                    Matter resolved
                  </div>
                  <div className="text-sm text-green-700">
                    Your matter has been concluded. For a new issue,{" "}
                    <Link href="/submit" className="underline">
                      submit a new matter
                    </Link>
                    .
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackForm />
    </Suspense>
  );
}
