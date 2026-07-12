"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, CheckCircle, LogOut,
  AlertTriangle, Send, Clock, User,
} from "lucide-react";
import {
  statusStyles, statusLabels, urgencyStyles,
  urgencyLabels, MATTER_STAGES, stageStepMap, TOTAL_STAGES,
} from "@/lib/utils";
import type { MatterStage, MatterStatus } from "@/types";

const BLOCKED_RELEASE_STAGES = ["hearing", "awaiting_judgment", "completed"];

interface MatterDetail {
  _id: string;
  referenceNumber: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    state?: string;
    preferredLanguage?: string;
  };
  type: string;
  description: string;
  urgency: string;
  status: string;
  stage: string;
  assignedLawyer?: { _id: string; name: string; specialisation: string };
  notes: { _id: string; authorName: string; content: string; createdAt: string }[];
  stageHistory: { stage: string; changedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function MatterDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const [matter, setMatter]   = useState<MatterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Stage update
  const [updating, setUpdating] = useState(false);

  // Notes
  const [note, setNote]             = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [noteError, setNoteError]   = useState("");

  // Release
  const [showRelease, setShowRelease]   = useState(false);
  const [releaseReason, setReleaseReason] = useState("");
  const [releaseError, setReleaseError]   = useState("");
  const [releasing, setReleasing]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/matters/${id}`);
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Matter not found."); setLoading(false); return; }
    setMatter(data.matter);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function updateStage(stage: MatterStage) {
    setUpdating(true);
    await fetch(`/api/matters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    setUpdating(false);
    load();
  }

  async function markComplete() {
    setUpdating(true);
    await fetch(`/api/matters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", stage: "completed" }),
    });
    setUpdating(false);
    load();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    setNoteError("");
    if (note.trim().length < 3) { setNoteError("Note must be at least 3 characters."); return; }
    setAddingNote(true);
    const res  = await fetch(`/api/matters/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    });
    const data = await res.json();
    setAddingNote(false);
    if (!res.ok) { setNoteError(data.error); return; }
    setNote("");
    load();
  }

  async function releaseMatter() {
    setReleaseError("");
    if (releaseReason.trim().length < 20) {
      setReleaseError("Please provide at least 20 characters explaining why.");
      return;
    }
    setReleasing(true);
    const res  = await fetch(`/api/matters/${id}/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: releaseReason }),
    });
    const data = await res.json();
    setReleasing(false);
    if (!res.ok) { setReleaseError(data.error); return; }
    router.push("/lawyer/matters");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading matter…
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="card text-center py-16">
        <p className="text-sm text-gray-400 mb-4">{error || "Matter not found."}</p>
        <Link href="/lawyer/matters" className="btn text-sm">← Back to matters</Link>
      </div>
    );
  }

  const stage       = matter.stage as string;
  const step        = stageStepMap[stage] ?? 1;
  const isCompleted = matter.status === "completed";
  const canRelease  = !BLOCKED_RELEASE_STAGES.includes(stage) && !isCompleted;

  return (
    <div className="max-w-3xl">
      {/* Back nav */}
      <Link href="/lawyer/matters"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to matters
      </Link>

      {/* Header */}
      <div className="card mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
              {matter.client.firstName} {matter.client.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {matter.referenceNumber}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {matter.type.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {matter.urgency !== "normal" && (
              <span className={"badge text-xs " + urgencyStyles[matter.urgency]}>
                {urgencyLabels[matter.urgency]}
              </span>
            )}
            <span className={"badge text-xs " + statusStyles[matter.status as MatterStatus]}>
              {statusLabels[matter.status as MatterStatus]}
            </span>
          </div>
        </div>

        {/* Client contact */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Email</p>
            <a href={`mailto:${matter.client.email}`}
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
              {matter.client.email}
            </a>
          </div>
          {matter.client.phone && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Phone</p>
              <a href={`tel:${matter.client.phone}`}
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                {matter.client.phone}
              </a>
            </div>
          )}
          {matter.client.state && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">State</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{matter.client.state}</p>
            </div>
          )}
          {matter.client.preferredLanguage && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Preferred language</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{matter.client.preferredLanguage}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(matter.createdAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Last updated</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(matter.updatedAt).toLocaleDateString("en-NG", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Matter description</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {matter.description}
          </p>
        </div>
      </div>

      {/* Stage progress */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Stage progress</h2>
          <span className="text-xs text-gray-400">{step} / {TOTAL_STAGES}</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {MATTER_STAGES.map(({ value, step: s }) => (
            <div key={value}
              className={"flex-1 h-2 rounded-full transition-all " +
                (s < step ? "bg-brand-600" : s === step ? "bg-brand-300" : "bg-gray-100 dark:bg-gray-800")} />
          ))}
        </div>

        {/* Stage checklist */}
        <div className="space-y-2 mb-5">
          {MATTER_STAGES.map(({ value, label, step: s }) => {
            const done    = s < step;
            const current = s === step;
            return (
              <div key={value} className="flex items-center gap-3">
                <div className={"w-5 h-5 rounded-full flex items-center justify-center shrink-0 " +
                  (done    ? "bg-brand-600" :
                   current ? "bg-brand-100 dark:bg-brand-900/40 border-2 border-brand-500" :
                   "bg-gray-100 dark:bg-gray-800")}>
                  {done    && <CheckCircle className="w-3 h-3 text-white" />}
                  {current && <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                </div>
                <span className={"text-sm " +
                  (done    ? "text-gray-400 dark:text-gray-600 line-through" :
                   current ? "text-gray-900 dark:text-gray-100 font-medium" :
                   "text-gray-400")}>
                  {label}
                </span>
                {current && (
                  <span className="ml-auto text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Stage actions */}
        {!isCompleted && (
          <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">Update stage:</span>
              <select className="input py-1 text-xs w-44" value={stage}
                disabled={updating}
                onChange={(e) => updateStage(e.target.value as MatterStage)}>
                {MATTER_STAGES.filter(s => s.value !== "completed").map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {canRelease && (
                <button onClick={() => setShowRelease(v => !v)}
                  className="btn text-xs gap-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="w-3.5 h-3.5" /> Release matter
                </button>
              )}
              <button onClick={markComplete} disabled={updating}
                className="btn btn-primary text-xs gap-1.5">
                {updating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle className="w-3.5 h-3.5" />}
                Mark complete
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Matter resolved
            </span>
          </div>
        )}

        {/* Release confirmation */}
        {showRelease && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Release this matter back to the open pool?
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  The client will be notified and another lawyer can claim it.
                  This cannot be undone.
                </p>
              </div>
            </div>
            <textarea className="input text-xs mb-2" rows={3}
              placeholder="Please explain why you are releasing this matter (min. 20 characters)..."
              value={releaseReason}
              onChange={(e) => setReleaseReason(e.target.value)}
              maxLength={500} />
            {releaseError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">{releaseError}</p>
            )}
            <div className="flex gap-2">
              <button onClick={releaseMatter} disabled={releasing}
                className="btn btn-danger text-xs gap-1.5 flex-1 justify-center">
                {releasing
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <LogOut className="w-3.5 h-3.5" />}
                Confirm release
              </button>
              <button onClick={() => { setShowRelease(false); setReleaseReason(""); setReleaseError(""); }}
                className="btn text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stage history */}
      {matter.stageHistory.length > 0 && (
        <div className="card mb-5">
          <h2 className="text-base font-medium mb-4">Stage history</h2>
          <div className="space-y-3">
            {[...matter.stageHistory].reverse().map((event, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                  {event.stage.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(event.changedAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="card">
        <h2 className="text-base font-medium mb-4">
          Case notes ({matter.notes.length})
        </h2>

        {/* Existing notes */}
        {matter.notes.length > 0 ? (
          <div className="space-y-3 mb-5">
            {[...matter.notes].reverse().map((n) => (
              <div key={n._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                    <User className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {n.authorName}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(n.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-7">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-5">
            No notes yet. Add your first case note below.
          </p>
        )}

        {/* Add note form */}
        {!isCompleted && (
          <form onSubmit={addNote} className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="label">Add a case note</label>
            <textarea className="input mb-2" rows={3}
              placeholder="Record consultation notes, document requests, court dates, or any relevant case details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000} />
            {noteError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">{noteError}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{note.length} / 1000</span>
              <button type="submit" disabled={addingNote}
                className="btn btn-primary text-xs gap-1.5">
                {addingNote
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />}
                Add note
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
