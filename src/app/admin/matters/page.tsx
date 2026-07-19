"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";
import { statusLabels, urgencyStyles, urgencyLabels } from "@/lib/utils";
import { MATTER_TYPES } from "@/types";
import type { IMatter, MatterStatus, MatterUrgency } from "@/types";
import Link from "next/link";

const STATUS_OPTIONS: MatterStatus[] = [
  "unassigned",
  "assigned",
  "in_progress",
  "under_review",
  "completed",
];
const URGENCY_OPTIONS: MatterUrgency[] = ["normal", "urgent", "critical"];

export default function AdminMattersPage() {
  const [matters, setMatters] = useState<IMatter[]>([]);
  const [lawyers, setLawyers] = useState<
    { _id: string; name: string; specialisation: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [filterType, setFilterType] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterUrgency) params.set("urgency", filterUrgency);
    if (filterType) params.set("type", filterType);

    const [mRes, lRes] = await Promise.all([
      fetch("/api/matters?" + params),
      fetch("/api/admin/lawyers?approved=true"),
    ]);
    const [mData, lData] = await Promise.all([mRes.json(), lRes.json()]);
    setMatters(mData.matters ?? []);
    setLawyers(lData.lawyers ?? []);
    setLoading(false);
  }, [filterStatus, filterUrgency, filterType]);

  useEffect(() => {
    load();
  }, [load]);

  async function assignLawyer(matterId: string, lawyerId: string) {
    setAssigning(matterId);
    await fetch(`/api/matters/${matterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedLawyer: lawyerId }),
    });
    setAssigning(null);
    load();
  }

  async function setStatus(matterId: string, status: string) {
    await fetch(`/api/matters/${matterId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = matters.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.client.firstName.toLowerCase().includes(q) ||
      m.client.lastName.toLowerCase().includes(q) ||
      m.client.email.toLowerCase().includes(q) ||
      m.referenceNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">All matters</h1>
          <p className="text-sm text-gray-500 mt-1">
            {matters.length} total ·{" "}
            {matters.filter((m) => m.status === "unassigned").length} unassigned
          </p>
        </div>
        <button
          onClick={load}
          className="btn gap-2 text-sm dark:hover:text-gray-600"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, email, or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            className="input w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
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
          {(filterStatus || filterUrgency || filterType || search) && (
            <button
              className="text-xs text-gray-400 hover:text-gray-700"
              onClick={() => {
                setFilterStatus("");
                setFilterUrgency("");
                setFilterType("");
                setSearch("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((m) => {
          const lawyer = m.assignedLawyer as
            { _id: string; name: string } | undefined;
          return (
            <div key={m._id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {m.client.firstName} {m.client.lastName}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {m.client.email}
                  </div>
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">
                    {m.referenceNumber}
                  </span>
                </div>
                <span
                  className={
                    "badge text-xs " + urgencyStyles[m.urgency as MatterUrgency]
                  }
                >
                  {urgencyLabels[m.urgency as MatterUrgency]}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs text-gray-500 capitalize">
                  {m.type.replace(/_/g, " ")}
                </span>
                {m.client.state && (
                  <span className="text-xs text-gray-400">
                    · {m.client.state}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  ·{" "}
                  {new Date(m.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="input py-1 text-xs flex-1 min-w-0"
                  value={m.status}
                  onChange={(e) => setStatus(m._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 shrink-0">
                  {lawyer ? (
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-medium text-brand-800 dark:text-brand-200">
                        {lawyer.name.charAt(0)}
                      </div>
                      {lawyer.name}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">Unclaimed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block card p-0 overflow-hidden">
        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading matters…
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <p className="text-sm">No matters match the current filters.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:bg-gray-900 dark:border-gray-600">
                    {[
                      "Client",
                      "Reference",
                      "Type",
                      "Urgency",
                      "Status",
                      "Assigned to",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap dark:text-brand-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-green-800/50">
                  {filtered.map((m) => {
                    const lawyer = m.assignedLawyer as
                      { _id: string; name: string } | undefined;
                    return (
                      <tr
                        key={m._id}
                        className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-gray-200">
                            {m.client.firstName} {m.client.lastName}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-400">
                            {m.client.email}
                          </div>
                          {m.client.state && (
                            <div className="text-xs text-gray-400 dark:text-gray-400/70">
                              {m.client.state}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded dark:bg-transparent dark:text-gray-200">
                            {m.referenceNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize whitespace-nowrap dark:text-gray-400">
                          {m.type.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={"badge " + urgencyStyles[m.urgency]}>
                            {urgencyLabels[m.urgency]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className="input py-1 text-xs w-36"
                            value={m.status}
                            onChange={(e) => setStatus(m._id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {lawyer ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-800">
                                {lawyer.name.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {lawyer.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Unclaimed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-400">
                              {new Date(m.createdAt).toLocaleDateString(
                                "en-NG",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                            <Link
                              href={`/admin/matters/${m._id}`}
                              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                            >
                              View →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
