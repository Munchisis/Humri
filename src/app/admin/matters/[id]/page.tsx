"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, CheckCircle, User,
  Clock, AlertTriangle, UserCheck, RefreshCw,
} from "lucide-react";
import {
  statusStyles, statusLabels, urgencyStyles,
  urgencyLabels, MATTER_STAGES, stageStepMap, TOTAL_STAGES,
} from "@/lib/utils";
import type { MatterStatus, MatterStage } from "@/types";

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
  assignedLawyer?: { _id: string; name: string; email: string; specialisation: string };
  notes: { _id: string; authorName: string; content: string; createdAt: string }[];
  stageHistory: { stage: string; changedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

interface Lawyer {
  _id: string;
  name: string;
  specialisation: string;
}

export default function AdminMatterDetailPage() {
  const params = useParams();
  const id     = params.id as string;

  const [matter, setMatter]   = useState<MatterDetail | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [updating, setUpdating] = useState(false);
  const [saved, setSaved]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [mRes, lRes] = await Promise.all([
      fetch(`/api/matters/${id}`),
      fetch("/api/admin/lawyers?approved=true"),
    ]);
    const [mData, lData] = await Promise.all([mRes.json(), lRes.json()]);
    if (!mRes.ok) { setError(mData.error ?? "Matter not found."); setLoading(false); return; }
    setMatter(mData.matter);
    setLawyers(lData.lawyers ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(body: Record<string, string>) {
    setUpdating(true);
    setSaved("");
    const res  = await fetch(`/api/matters/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    setUpdating(false);
    if (res.ok) { setSaved("Saved"); load(); }
    else setSaved(data.error ?? "Failed to update.");
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading matter…
    </div>
  );

  if (error || !matter) return (
    <div className="card text-center py-16">
      <p className="text-sm text-gray-400 mb-4">{error || "Matter not found."}</p>
      <Link href="/admin/matters" className="btn text-sm">← Back to matters</Link>
    </div>
  );

  const stage       = matter.stage as string;
  const step        = stageStepMap[stage] ?? 1;
  const isCompleted = matter.status === "completed";

  return (
    <div className="max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/matters"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to all matters
        </Link>
        <button onClick={load} className="btn text-xs gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="card">
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
                  <p className="text-xs text-gray-400 mb-0.5">Language</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{matter.client.preferredLanguage}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(matter.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Last updated</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(matter.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Matter description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {matter.description}
              </p>
            </div>
          </div>

          {/* Stage progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium">Stage progress</h2>
              <span className="text-xs text-gray-400">{step} / {TOTAL_STAGES}</span>
            </div>

            <div className="flex gap-1 mb-4">
              {MATTER_STAGES.map(({ value, step: s }) => (
                <div key={value}
                  className={"flex-1 h-2 rounded-full " +
                    (s < step ? "bg-brand-600" : s === step ? "bg-brand-300" : "bg-gray-100 dark:bg-gray-800")} />
              ))}
            </div>

            <div className="space-y-2 mb-5">
              {MATTER_STAGES.map(({ value, label, step: s }) => {
                const done    = s < step;
                const current = s === step;
                return (
                  <div key={value} className="flex items-center gap-3">
                    <div className={"w-5 h-5 rounded-full flex items-center justify-center shrink-0 " +
                      (done ? "bg-brand-600" : current ? "bg-brand-100 dark:bg-brand-900/40 border-2 border-brand-500" : "bg-gray-100 dark:bg-gray-800")}>
                      {done    && <CheckCircle className="w-3 h-3 text-white" />}
                      {current && <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                    </div>
                    <span className={"text-sm " +
                      (done ? "text-gray-400 dark:text-gray-600 line-through" : current ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400")}>
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

            {/* Admin stage override */}
            {!isCompleted && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 shrink-0">Override stage:</span>
                <select className="input py-1 text-xs w-44" value={stage} disabled={updating}
                  onChange={(e) => patch({ stage: e.target.value })}>
                  {MATTER_STAGES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {saved && (
                  <span className={"text-xs font-medium " +
                    (saved === "Saved" ? "text-green-600" : "text-red-600")}>
                    {saved}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stage history */}
          {matter.stageHistory.length > 0 && (
            <div className="card">
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
            {matter.notes.length === 0 ? (
              <p className="text-sm text-gray-400">No notes added yet.</p>
            ) : (
              <div className="space-y-3">
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
            )}
          </div>
        </div>

        {/* Right column — admin controls */}
        <div className="space-y-5">

          {/* Status control */}
          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Status
            </h2>
            <select className="input text-sm" value={matter.status} disabled={updating}
              onChange={(e) => patch({ status: e.target.value })}>
              {(["unassigned","assigned","in_progress","under_review","completed","archived"] as MatterStatus[]).map(s => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>

          {/* Lawyer assignment */}
          <div className="card">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Assigned lawyer
            </h2>
            {matter.assignedLawyer ? (
              <div className="flex items-start gap-3 mb-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-brand-200 dark:bg-brand-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-brand-700 dark:text-brand-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {matter.assignedLawyer.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {matter.assignedLawyer.specialisation}
                  </p>
                  <a href={`mailto:${matter.assignedLawyer.email}`}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                    {matter.assignedLawyer.email}
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Unassigned
              </div>
            )}
            <label className="label">Reassign to</label>
            <select className="input text-sm" disabled={updating}
              value={matter.assignedLawyer?._id ?? ""}
              onChange={(e) => { if (e.target.value) patch({ assignedLawyer: e.target.value }); }}>
              <option value="">— Select lawyer —</option>
              {lawyers.map(l => (
                <option key={l._id} value={l._id}>{l.name} · {l.specialisation}</option>
              ))}
            </select>
            {saved && (
              <p className={"text-xs mt-2 font-medium " + (saved === "Saved" ? "text-green-600" : "text-red-600")}>
                {saved}
              </p>
            )}
          </div>

          {/* Quick actions */}
          {!isCompleted && (
            <div className="card">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Quick actions
              </h2>
              <div className="space-y-2">
                <button onClick={() => patch({ status: "completed", stage: "completed" })}
                  disabled={updating}
                  className="btn btn-primary w-full justify-center text-xs gap-1.5">
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Mark as completed
                </button>
                <button onClick={() => patch({ status: "archived" })}
                  disabled={updating}
                  className="btn w-full justify-center text-xs gap-1.5 text-gray-500">
                  Archive matter
                </button>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="card text-xs text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Submitted</span>
              <span>{new Date(matter.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between">
              <span>Last updated</span>
              <span>{new Date(matter.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
