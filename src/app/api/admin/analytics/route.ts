import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const now = new Date();
  const day14ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const day90ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [
    // Overall counts
    totalMatters,
    completedMatters,
    activeMatters,
    unassignedMatters,

    // Archive counts
    archiveTotal,
    archiveActive,
    archiveInactive,

    // Aggregations
    byType,
    byUrgency,
    byState,
    byStatus,
    monthlyTrend,
    resolutionTime,

    // Lawyer stats
    totalLawyers,
    approvedLawyers,
    pendingLawyers,

    // Recommended Metrics
    topLawyerWorkload,
    urgencyVsStatus,
    recentActivityCount,
    satisfactionStats,
  ] = await Promise.all([
    // Total matters in database
    Matter.countDocuments(),

    // Status counts
    Matter.countDocuments({ status: "completed" }),
    Matter.countDocuments({
      status: { $in: ["assigned", "in_progress", "under_review"] },
    }),
    Matter.countDocuments({ status: "unassigned" }),

    // Archived matters
    Matter.countDocuments({ status: "archived" }),
    Matter.countDocuments({ status: "archived", isArchived: true }),
    Matter.countDocuments({ status: "archived", isArchived: false }),

    // Breakdown by type
    Matter.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Breakdown by urgency
    Matter.aggregate([{ $group: { _id: "$urgency", count: { $sum: 1 } } }]),

    // Client states
    Matter.aggregate([
      { $match: { "client.state": { $exists: true, $ne: "" } } },
      { $group: { _id: "$client.state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // Breakdown by status
    Matter.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

    // 90 days trend
    Matter.aggregate([
      {
        $match: {
          createdAt: { $gte: day90ago },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          submitted: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Average resolution time
    Matter.aggregate([
      { $match: { status: "completed" } },
      {
        $project: {
          daysToResolve: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: "$daysToResolve" },
          minDays: { $min: "$daysToResolve" },
          maxDays: { $max: "$daysToResolve" },
        },
      },
    ]),

    // Lawyer counts
    User.countDocuments({ role: "lawyer" }),
    User.countDocuments({ role: "lawyer", isApproved: true }),
    User.countDocuments({ role: "lawyer", isApproved: false }),

    // 1. Top 5 lawyer workloads (Active cases)
    Matter.aggregate([
      {
        $match: {
          status: { $in: ["assigned", "in_progress", "under_review"] },
          assignedTo: { $ne: null },
        },
      },
      { $group: { _id: "$assignedTo", activeCases: { $sum: 1 } } },
      { $sort: { activeCases: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "lawyer",
        },
      },
      { $unwind: "$lawyer" },
      {
        $project: {
          _id: 1,
          name: "$lawyer.name",
          email: "$lawyer.email",
          activeCases: 1,
        },
      },
    ]),

    // 2. Critical/Urgent matters that are unassigned
    Matter.aggregate([
      { $match: { urgency: { $in: ["urgent", "critical"] } } },
      {
        $group: {
          _id: "$urgency",
          unassigned: {
            $sum: { $cond: [{ $eq: ["$status", "unassigned"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]),

    // 3. Recently updated matters (Last 14 days activity rate)
    Matter.countDocuments({
      status: { $in: ["assigned", "in_progress", "under_review"] },
      updatedAt: { $gte: day14ago },
    }),

    // 4. Client satisfaction ratings (if rating field exists)
    Matter.aggregate([
      { $match: { rating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Format monthly trend with month names
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedTrend = monthlyTrend.map(
    (m: {
      _id: { month: number; year: number };
      submitted: number;
      completed: number;
    }) => ({
      month: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
      submitted: m.submitted,
      completed: m.completed,
    }),
  );

  // Format type labels
  const TYPE_LABELS: Record<string, string> = {
    employment: "Employment",
    tenancy: "Tenancy",
    family_law: "Family Law",
    criminal: "Criminal",
    land_property: "Land & Property",
    contract: "Contract",
    human_rights: "Human Rights",
    debt: "Debt",
    immigration: "Immigration",
    other: "Other",
  };

  const formattedByType = byType.map((t: { _id: string; count: number }) => ({
    label: TYPE_LABELS[t._id] ?? t._id,
    count: t.count,
    pct: totalMatters ? Math.round((t.count / totalMatters) * 100) : 0,
  }));

  return NextResponse.json({
    overview: {
      total: totalMatters,
      completed: completedMatters,
      active: activeMatters,
      unassigned: unassignedMatters,
      completionRate: totalMatters
        ? Math.round((completedMatters / totalMatters) * 100)
        : 0,
    },
    archive: {
      total: archiveTotal,
      active: archiveActive,
      inactive: archiveInactive,
    },
    byType: formattedByType,
    byUrgency: byUrgency.map((u: { _id: string; count: number }) => ({
      label: u._id,
      count: u.count,
    })),
    byState: byState.map((s: { _id: string; count: number }) => ({
      state: s._id,
      count: s.count,
    })),
    byStatus: byStatus.map((s: { _id: string; count: number }) => ({
      status: s._id,
      count: s.count,
    })),
    monthlyTrend: formattedTrend,
    resolution: resolutionTime[0]
      ? {
          avg: Math.round(resolutionTime[0].avgDays),
          min: Math.round(resolutionTime[0].minDays),
          max: Math.round(resolutionTime[0].maxDays),
        }
      : null,
    lawyers: {
      total: totalLawyers,
      approved: approvedLawyers,
      pending: pendingLawyers,
    },

    // Extended Insights
    workload: topLawyerWorkload,
    urgencyPriority: urgencyVsStatus,
    activeInLast14Days: recentActivityCount,
    satisfaction: satisfactionStats[0]
      ? {
          avgRating: Number(satisfactionStats[0].avgRating.toFixed(1)),
          count: satisfactionStats[0].totalRatings,
        }
      : null,
  });
}
