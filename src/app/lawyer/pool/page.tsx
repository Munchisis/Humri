"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Inbox,
  AlertTriangle,
  CheckCircle,
  Filter,
} from "lucide-react";
import { urgencyStyles, urgencyLabels } from "@/lib/utils";
import { MATTER_TYPES } from "@/types";
import type { IMatter, MatterUrgency } from "@/types";

const URGENCY_OPTIONS: MatterUrgency[] = ["normal", "urgent", "critical"];

export default function MatterPoolPage() {
  const [matters, setMatters] = useState<IMatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "unassigned" });
    if (filterType) params.set("type", filterType);
    if (filterUrgency) params.set("urgency", filterUrgency);
    const res = await fetch("/api/matters?" + params);
    const data = await res.json();
    setMatters(data.matters ?? []);
    setLoading(false);
  }, [filterType, filterUrgency]);

  useEffect(() => {
    load();
  }, [load]);

  async function claimMatter(matterId: string) {
    setClaiming(matterId);
    setError(null);
    const res = await fetch(`/api/matters/${matterId}/claim`, {
      method: "POST",
    });
    const data = await res.json();
    setClaiming(null);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setClaimed(matterId);
    setTimeout(() => {
      setClaimed(null);
      load();
    }, 1500);
  }

  const urgencyOrder: Record<string, number> = {
    critical: 0,
    urgent: 1,
    normal: 2,
  };
  const sorted = [...matters].sort(
    (a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium">Open matters</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse unassigned matters and claim one to take it on. Once claimed it
          moves to your dashboard.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            className="input w-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All types</option>
            {MATTER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            className="input w-auto"
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
          >
            <option value="">All urgency</option>
            {URGENCY_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {urgencyLabels[u]}
              </option>
            ))}
          </select>
          {(filterType || filterUrgency) && (
            <button
              className="text-xs text-gray-400 hover:text-gray-700"
              onClick={() => {
                setFilterType("");
                setFilterUrgency("");
              }}
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {sorted.length} open matter{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading open matters…
        </div>
      ) : sorted.length === 0 ? (
        <div className="card text-center py-16">
          <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            No open matters right now. Check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((m) => {
            const isClaiming = claiming === m._id;
            const isClaimed = claimed === m._id;
            return (
              <div
                key={m._id}
                className={
                  "card transition-all " +
                  (isClaimed ? "border-green-300 bg-green-50" : "")
                }
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-200 ">
                      {m.client.firstName} {m.client.lastName.charAt(0)}.
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className="capitalize">
                        {m.type.replace(/_/g, " ")}
                      </span>
                      {m.client.state && (
                        <>
                          <span>·</span>
                          <span>{m.client.state}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>
                        Submitted{" "}
                        {new Date(m.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  {m.urgency !== "normal" && (
                    <span
                      className={
                        "badge text-xs shrink-0 " + urgencyStyles[m.urgency]
                      }
                    >
                      {urgencyLabels[m.urgency]}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {m.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100  dark:border-gray-600">
                  <span className="text-xs text-gray-400">
                    {m.urgency === "critical"
                      ? "⚡ Requires immediate attention"
                      : m.urgency === "urgent"
                        ? "🕐 Has an upcoming deadline"
                        : "No immediate deadline"}
                  </span>
                  <button
                    onClick={() => claimMatter(m._id)}
                    disabled={isClaiming || isClaimed}
                    className={
                      "btn text-xs gap-1.5 " +
                      (isClaimed
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "btn-primary")
                    }
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Claimed!
                      </>
                    ) : isClaiming ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        Claiming…
                      </>
                    ) : (
                      "Accept matter"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
