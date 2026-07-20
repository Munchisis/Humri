"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, Mail, Clock } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface LawyerReport {
  _id: string;
  name: string;
  email: string;
  specialisation: string;
  state: string;
  emailVerified: boolean;
  activeMatters: number;
  completedMatters: number;
  totalClaimed: number;
  lastActive: string;
  daysSinceActive: number;
  isInactive: boolean;
  joinedAt: string;
}

const AVATAR_COLORS = [
  "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
];

function activityBadge(days: number, totalClaimed: number) {
  if (totalClaimed === 0 && days > 7) {
    return <span className="badge bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-xs">Never claimed</span>;
  }
  if (days > 30) {
    return <span className="badge bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 text-xs">Inactive {days}d</span>;
  }
  if (days > 14) {
    return <span className="badge bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 text-xs">Quiet {days}d</span>;
  }
  return <span className="badge bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 text-xs">Active</span>;
}

function LawyerCard({ lawyer }: { lawyer: LawyerReport }) {
  const avatarColor = AVATAR_COLORS[lawyer.name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={"card " + (lawyer.isInactive ? "border-amber-200 dark:border-amber-800" : "")}>
      <div className="flex items-start gap-4">
        <div className={"w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 " + avatarColor}>
          {getInitials(lawyer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{lawyer.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lawyer.specialisation || "—"} · {lawyer.state || "—"}
              </div>
            </div>
            {activityBadge(lawyer.daysSinceActive, lawyer.totalClaimed)}
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last active: <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                {lawyer.daysSinceActive === 0 ? "Today" : `${lawyer.daysSinceActive}d ago`}
              </span>
            </div>
            <div>
              Active matters: <span className="font-medium text-gray-700 dark:text-gray-300">{lawyer.activeMatters}</span>
            </div>
            <div>
              Completed: <span className="font-medium text-green-700 dark:text-green-400">{lawyer.completedMatters}</span>
            </div>
            <div>
              Total claimed: <span className="font-medium text-gray-700 dark:text-gray-300">{lawyer.totalClaimed}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <a href={`mailto:${lawyer.email}`}
              className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline">
              <Mail className="w-3 h-3" /> {lawyer.email}
            </a>
            {!lawyer.emailVerified && (
              <span className="badge bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 text-xs">
                Unverified email
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400 mt-2">
            Joined {new Date(lawyer.joinedAt).toLocaleDateString("en-NG", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InactiveLawyersPage() {
  const [data, setData]       = useState<{ inactive: LawyerReport[]; active: LawyerReport[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"inactive" | "all">("inactive");

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/admin/inactive-lawyers");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const displayed = data
    ? tab === "inactive"
      ? data.inactive
      : [...data.inactive, ...data.active]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Lawyer activity report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {data
              ? `${data.inactive.length} inactive · ${data.total} total approved lawyers`
              : "Loading…"}
          </p>
        </div>
        <button onClick={load} className="btn text-sm gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Definition */}
      <div className="card mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">Inactive definition: </span>
            A lawyer is flagged as inactive if they have had no matter activity for more than 30 days,
            or if they have been approved for more than 7 days without ever claiming a matter.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "inactive", label: `Needs attention (${data?.inactive.length ?? 0})` },
          { key: "all",      label: `All lawyers (${data?.total ?? 0})`               },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as typeof tab)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " +
              (tab === key
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading report…
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">All lawyers are active</p>
          <p className="text-xs text-gray-400">No inactivity issues to report.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(lawyer => (
            <LawyerCard key={lawyer._id} lawyer={lawyer} />
          ))}
        </div>
      )}
    </div>
  );
}
