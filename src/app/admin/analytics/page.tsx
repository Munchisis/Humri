"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  TrendingUp,
  Clock,
  Users,
  FileText,
  RefreshCw,
  AlertCircle,
  Star,
  ShieldAlert,
  Activity,
} from "lucide-react";

interface Analytics {
  overview: {
    total: number;
    completed: number;
    active: number;
    unassigned: number;
    completionRate: number;
  };
  byType: { label: string; count: number; pct: number }[];
  byUrgency: { label: string; count: number }[];
  byState: { state: string; count: number }[];
  monthlyTrend: { month: string; submitted: number; completed: number }[];
  resolution: { avg: number; min: number; max: number } | null;
  lawyers: { total: number; approved: number; pending: number };
  archive: { total: number; active: number; inactive: number };

  // Extended Insights
  workload: { _id: string; name: string; email: string; activeCases: number }[];
  urgencyPriority: { _id: string; unassigned: number; total: number }[];
  activeInLast14Days: number;
  satisfaction: { avgRating: number; count: number } | null;
}

const TYPE_COLORS: Record<string, string> = {
  Employment: "bg-blue-500",
  Tenancy: "bg-amber-500",
  "Family Law": "bg-purple-500",
  Criminal: "bg-red-500",
  "Land & Property": "bg-green-500",
  Contract: "bg-teal-500",
  "Human Rights": "bg-pink-500",
  Debt: "bg-orange-500",
  Immigration: "bg-indigo-500",
  Other: "bg-gray-400",
};

const URGENCY_COLORS: Record<string, string> = {
  normal: "bg-green-500",
  urgent: "bg-amber-500",
  critical: "bg-red-500",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/analytics");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading analytics…
      </div>
    );

  if (!data)
    return (
      <div className="card text-center py-16 text-sm text-gray-400">
        Failed to load analytics.
      </div>
    );

  // Max value calculations for bar charts
  const maxType = Math.max(...data.byType.map((t) => t.count), 1);
  const maxState = Math.max(...data.byState.map((s) => s.count), 1);
  const maxTrend = Math.max(...data.monthlyTrend.map((m) => m.submitted), 1);
  const maxWorkload = Math.max(
    ...(data.workload?.map((w) => w.activeCases) ?? [1]),
    1,
  );

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform performance and matter statistics
          </p>
        </div>
        <button onClick={load} className="btn text-sm gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          {
            label: "Total matters",
            value: data.overview.total,
            icon: FileText,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Archived matters",
            value: data.archive?.total ?? 0,
            icon: FileText,
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/20 ",
          },
          {
            label: "Unassigned matters",
            value: data.overview.unassigned,
            icon: AlertCircle,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
          {
            label: "Completion rate",
            value: `${data.overview.completionRate}%`,
            icon: TrendingUp,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/20",
          },
          {
            label: "Avg resolution",
            value: data.resolution ? `${data.resolution.avg}d` : "—",
            icon: Clock,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
          {
            label: "Active lawyers",
            value: data.lawyers.approved,
            icon: Users,
            color: "text-teal-600 dark:text-teal-400",
            bg: "bg-teal-50 dark:bg-teal-900/20",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Primary Visualizations */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Monthly Trend */}
        <div className="card lg:col-span-2">
          <h2 className="text-base font-medium mb-1">Monthly activity</h2>
          <p className="text-xs text-gray-400 mb-5">
            Matters submitted vs completed over recent months
          </p>
          {data.monthlyTrend.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.monthlyTrend.map((m) => (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{m.month}</span>
                    <span>
                      {m.submitted} submitted · {m.completed} completed
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16 shrink-0">
                        Submitted
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-brand-400 transition-all"
                          style={{
                            width: `${Math.round((m.submitted / maxTrend) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {m.submitted}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16 shrink-0">
                        Completed
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.round((m.completed / maxTrend) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {m.completed}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matters by Type */}
        <div className="card">
          <h2 className="text-base font-medium mb-1">Matters by type</h2>
          <p className="text-xs text-gray-400 mb-5">
            Distribution across all {data.overview.total} matters
          </p>
          <div className="space-y-3">
            {data.byType.map((t) => (
              <div key={t.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {t.label}
                  </span>
                  <span className="text-gray-400">
                    {t.count} ({t.pct}%)
                  </span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={
                      "h-2 rounded-full transition-all " +
                      (TYPE_COLORS[t.label] ?? "bg-brand-500")
                    }
                    style={{
                      width: `${Math.round((t.count / maxType) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top States */}
        <div className="card">
          <h2 className="text-base font-medium mb-1">Top 10 states</h2>
          <p className="text-xs text-gray-400 mb-5">
            Where clients are located
          </p>
          <div className="space-y-3">
            {data.byState.map((s, i) => (
              <div key={s.state}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="text-gray-400 w-4">{i + 1}.</span>
                    {s.state}
                  </span>
                  <span className="text-gray-400">{s.count}</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{
                      width: `${Math.round((s.count / maxState) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {data.byState.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No state data yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NEW INSIGHTS SECTION */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Top Lawyer Workloads */}
        <div className="card">
          <h2 className="text-base font-medium mb-1">
            Lawyer Workload (Active Cases)
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Lawyers managing the highest caseloads
          </p>
          {data.workload && data.workload.length > 0 ? (
            <div className="space-y-3">
              {data.workload.map((w) => (
                <div key={w._id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {w.name}
                    </span>
                    <span className="text-gray-400">{w.activeCases} cases</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-teal-500 transition-all"
                      style={{
                        width: `${Math.round((w.activeCases / maxWorkload) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              No active lawyer assignments.
            </p>
          )}
        </div>

        {/* Priority & Urgent Action Needs */}
        <div className="card">
          <h2 className="text-base font-medium mb-1">High-Priority Cases</h2>
          <p className="text-xs text-gray-400 mb-5">
            Urgent & Critical matters needing immediate attention
          </p>
          {data.urgencyPriority && data.urgencyPriority.length > 0 ? (
            <div className="space-y-4">
              {data.urgencyPriority.map((item) => (
                <div
                  key={item._id}
                  className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                        {item._id} Matters
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.total} total submitted
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-amber-600">
                      {item.unassigned}
                    </span>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Unassigned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              No urgent or critical matters currently pending.
            </p>
          )}
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Urgency Breakdown */}
        <div className="card">
          <h2 className="text-base font-medium mb-5">By urgency</h2>
          <div className="space-y-4">
            {data.byUrgency.map((u) => {
              const total = data.byUrgency.reduce((s, x) => s + x.count, 0);
              const pct = total ? Math.round((u.count / total) * 100) : 0;
              return (
                <div key={u.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="capitalize text-gray-700 dark:text-gray-300">
                      {u.label}
                    </span>
                    <span className="text-gray-400">
                      {u.count} · {pct}%
                    </span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={
                        "h-2.5 rounded-full transition-all " +
                        (URGENCY_COLORS[u.label] ?? "bg-gray-500")
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Time & Health */}
        <div className="card">
          <h2 className="text-base font-medium mb-5">Resolution time</h2>
          {data.resolution ? (
            <div className="space-y-4">
              {[
                {
                  label: "Average",
                  value: data.resolution.avg,
                  color: "text-brand-600",
                },
                {
                  label: "Fastest",
                  value: data.resolution.min,
                  color: "text-green-600",
                },
                {
                  label: "Slowest",
                  value: data.resolution.max,
                  color: "text-red-500",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {label}
                  </span>
                  <span className={`text-xl font-semibold ${color}`}>
                    {value}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      days
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4">
              No completed matters yet.
            </p>
          )}

          {/* Platform Activity Metric */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-500">Updated in last 14d</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {data.activeInLast14Days ?? 0} active
            </span>
          </div>
        </div>

        {/* Lawyer & Satisfaction Overview */}
        <div className="card">
          <h2 className="text-base font-medium mb-5">Lawyer & Feedback</h2>
          <div className="space-y-3">
            {[
              {
                label: "Total registered",
                value: data.lawyers.total,
                color: "text-gray-900 dark:text-gray-100",
              },
              {
                label: "Approved & active",
                value: data.lawyers.approved,
                color: "text-green-600",
              },
              {
                label: "Pending approval",
                value: data.lawyers.pending,
                color: "text-amber-600",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  {label}
                </span>
                <span className={`font-semibold ${color}`}>{value}</span>
              </div>
            ))}

            {/* Client CSAT Score */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{" "}
                Client CSAT
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {data.satisfaction
                  ? `${data.satisfaction.avgRating} / 5`
                  : "No ratings"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
