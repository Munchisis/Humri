"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, UserCheck, Clock, RefreshCw } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Lawyer {
  _id: string;
  name: string;
  email: string;
  specialisation: string;
  barNumber: string;
  state: string;
  isApproved: boolean;
  emailVerified: boolean;
  activeMatters: number;
  completedMatters: number;
  proBonoHours: number;
  createdAt: string;
}

export default function AdminLawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"approved" | "pending">("approved");
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/admin/lawyers");
    const data = await res.json();
    setLawyers(data.lawyers ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setApproval(lawyerId: string, isApproved: boolean) {
    setActing(lawyerId);
    await fetch("/api/admin/lawyers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lawyerId, isApproved }),
    });
    setActing(null);
    load();
  }

  const displayed = lawyers.filter(l =>
    tab === "approved" ? l.isApproved : !l.isApproved
  );

  const pending = lawyers.filter(l => !l.isApproved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Lawyers</h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {lawyers.filter((l) => l.isApproved).length} active · {pending}{" "}
            pending approval
          </p>
        </div>
        <button
          onClick={load}
          className="btn text-sm gap-2 dark:hover:text-gray-600"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("approved")}
          className={
            "px-4 py-2 rounded-lg text-sm font-medium transition-all " +
            (tab === "approved"
              ? "bg-gray-900 text-white dark:border-gray-600 dark:border"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")
          }
        >
          <span className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Active lawyers ({lawyers.filter((l) => l.isApproved).length})
          </span>
        </button>
        <button
          onClick={() => setTab("pending")}
          className={
            "px-4 py-2 rounded-lg text-sm font-medium transition-all " +
            (tab === "pending"
              ? "bg-amber-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")
          }
        >
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending approval
            {pending > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                {pending}
              </span>
            )}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading lawyers…
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-sm text-gray-400">
            {tab === "pending"
              ? "No pending applications."
              : "No approved lawyers yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayed.map((l) => {
            const initials = getInitials(l.name);
            const colors = [
              "bg-brand-100 text-brand-800",
              "bg-purple-100 text-purple-800",
              "bg-amber-100 text-amber-800",
              "bg-teal-100 text-teal-800",
            ];
            const color = colors[l.name.charCodeAt(0) % colors.length];

            return (
              <div key={l._id} className="card flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 " +
                    color
                  }
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-200">
                        {l.name}
                      </div>
                      <div className="text-sm text-gray-500">{l.email}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {l.isApproved ? (
                        <button
                          onClick={() => setApproval(l._id, false)}
                          disabled={acting === l._id}
                          className="btn text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:hover:text-gray-600 dark:text-gray-200"
                        >
                          {acting === l._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => setApproval(l._id, true)}
                          disabled={acting === l._id}
                          className="btn btn-primary text-xs gap-1.5"
                        >
                          {acting === l._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                      {l.specialisation || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                      {l.state || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                      NBA: {l.barNumber || "—"}
                    </span>
                    {l.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Email verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Unverified email
                      </span>
                    )}
                  </div>

                  {l.isApproved && (
                    <div className="flex gap-6 mt-3 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-500">
                          {l.activeMatters}
                        </span>
                        <span className="text-gray-400 ml-1">active</span>
                      </div>
                      <div>
                        <span className="font-semibold text-green-700">
                          {l.completedMatters}
                        </span>
                        <span className="text-gray-400 ml-1">completed</span>
                      </div>
                      <div>
                        <span className="font-semibold text-purple-700">
                          {l.proBonoHours}
                        </span>
                        <span className="text-gray-400 ml-1">pro bono hrs</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-00">
                          {l.completedMatters + l.activeMatters > 0
                            ? Math.round(
                                (l.completedMatters /
                                  (l.completedMatters + l.activeMatters)) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                        <span className="text-gray-400 ml-1">
                          completion rate
                        </span>
                      </div>
                    </div>
                  )}

                  {!l.isApproved && (
                    <div className="mt-2 text-xs text-amber-600">
                      Applied{" "}
                      {new Date(l.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
