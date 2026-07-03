import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import Link from "next/link";
import { FileText, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { statusStyles, statusLabels, MATTER_STAGES, stageStepMap, TOTAL_STAGES } from "@/lib/utils";
import type { MatterStatus, MatterStage } from "@/types";


export default async function LawyerDashboard() {
  const session = await getServerSession(authOptions);
  await connectDB();

  
  const [matters, profile] = await Promise.all([
    Matter.find({ assignedLawyer: session!.user.id })
      .sort({ urgency: -1, createdAt: -1 })
      .lean(),
    User.findById(session!.user.id).select("-password").lean(),
  ]);

  const active    = matters.filter((m) => m.status !== "completed" && m.status !== "archived");
  const completed = matters.filter((m) => m.status === "completed");
  const critical  = active.filter((m) => m.urgency === "critical");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium">
          Welcome back, {session?.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-brand-400">
          {profile?.specialisation ?? "Volunteer lawyer"} ·{" "}
          {profile?.state ?? ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center mb-3">
            <FileText className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-semibold">{active.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active matters</div>
        </div>
        <div className="stat-card">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-semibold text-green-700">
            {completed.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Completed</div>
        </div>
        <div className="stat-card">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-semibold text-purple-700">
            {profile?.proBonoHours ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Pro bono hours</div>
        </div>
      </div>

      {/* Critical matters alert */}
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
          <span className="text-sm font-medium text-red-800">
            {critical.length} critical{" "}
            {critical.length === 1 ? "matter requires" : "matters require"}{" "}
            immediate attention
          </span>
        </div>
      )}

      {/* Active matters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Active matters</h2>
          <Link
            href="/lawyer/matters"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {active.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            No active matters assigned to you.
          </div>
        ) : (
          <div className="space-y-3">
            {active.slice(0, 5).map((m) => {
              const step = stageStepMap[m.stage as MatterStage] ?? 1;
              const pct = Math.round((step / TOTAL_STAGES) * 100);
              return (
                <Link
                  key={m._id.toString()}
                  href={`/lawyer/matters/${m._id}`}
                  className="block border border-gray-100 rounded-xl p-4 hover:border-brand-200 hover:bg-brand-50 transition-all dark:border-gray-600 dark:hover:bg-gray-700/90"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-sm font-medium">
                        {m.client.firstName} {m.client.lastName}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {m.referenceNumber} · {m.type.replace(/_/g, " ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.urgency !== "normal" && (
                        <span
                          className={`badge text-xs ${
                            m.urgency === "critical"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {m.urgency}
                        </span>
                      )}
                      <span
                        className={`badge text-xs ${statusStyles[m.status as MatterStatus]}`}
                      >
                        {statusLabels[m.status as MatterStatus]}
                      </span>
                    </div>
                  </div>
                  {/* Stage progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-brand-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {MATTER_STAGES.find((s) => s.value === m.stage)?.label ??
                        m.stage}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
