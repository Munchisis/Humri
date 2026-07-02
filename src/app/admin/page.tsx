import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import Link from "next/link";
import {
  FileText, Inbox, Loader, CheckCircle,
  AlertTriangle, Users, UserCheck, ArrowRight,
} from "lucide-react";

async function getStats() {
  await connectDB();
  const [total, unassigned, inProgress, completed, critical, totalLawyers, pending] =
    await Promise.all([
      Matter.countDocuments(),
      Matter.countDocuments({ status: "unassigned" }),
      Matter.countDocuments({ status: { $in: ["assigned", "in_progress", "under_review"] } }),
      Matter.countDocuments({ status: "completed" }),
      Matter.countDocuments({ urgency: "critical", status: { $ne: "completed" } }),
      User.countDocuments({ role: "lawyer", isApproved: true }),
      User.countDocuments({ role: "lawyer", isApproved: false }),
    ]);
  return { total, unassigned, inProgress, completed, critical, totalLawyers, pending };
}

async function getRecentMatters() {
  await connectDB();
  return Matter.find({ status: { $ne: "archived" } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("assignedLawyer", "name")
    .lean();
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const [stats, recent] = await Promise.all([getStats(), getRecentMatters()]);

  const statCards = [
    { label: "Total matters",   value: stats.total,       icon: FileText,      color: "text-blue-600",   bg: "bg-blue-50"  },
    { label: "Unassigned",      value: stats.unassigned,  icon: Inbox,         color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "In progress",     value: stats.inProgress,  icon: Loader,        color: "text-purple-600", bg: "bg-purple-50"},
    { label: "Completed",       value: stats.completed,   icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-50" },
    { label: "Critical / open", value: stats.critical,    icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50"   },
    { label: "Active lawyers",  value: stats.totalLawyers,icon: Users,         color: "text-teal-600",   bg: "bg-teal-50"  },
  ];

  return (
    <div className="dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900 dark:text-gray-200">
          Good morning, {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening on HUMRI today.
        </p>
      </div>

      {/* Pending approval banner */}
      {stats.pending > 0 && (
        <Link
          href="/admin/lawyers?tab=pending"
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 hover:bg-amber-100 transition-colors dark:bg-transparent dark:border-brand-600"
        >
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-amber-600 shrink-0 dark:text-brand-100" />
            <span className="text-sm font-medium text-amber-800 dark:text-gray-400">
              {stats.pending} lawyer{" "}
              {stats.pending === 1 ? "application" : "applications"} pending
              your approval
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 dark:text-brand-100" />
        </Link>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3  dark:bg-brand-600 `}
            >
              <Icon className={`w-4 h-4 ${color} dark:text-gray-200`} />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
              {value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent matters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Recent matters</h2>
          <Link
            href="/admin/matters"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1 dark:text-gray-300"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-500">
          {recent.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center dark:text-gray-300">
              No matters yet.
            </p>
          )}
          {recent.map((m) => (
            <div
              key={m._id.toString()}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">
                  {m.client.firstName} {m.client.lastName}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {m.referenceNumber} · {m.type.replace("_", " ")}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {m.urgency === "critical" && (
                  <span className="badge bg-red-50 text-red-700 border-red-200">
                    Critical
                  </span>
                )}
                <span
                  className={`badge ${
                    m.status === "unassigned"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : m.status === "completed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                >
                  {m.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
