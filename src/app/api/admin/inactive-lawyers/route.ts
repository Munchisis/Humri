import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Matter from "@/models/Matter";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const now       = new Date();
  const day30ago  = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // All approved lawyers
  const lawyers = await User.find({ role: "lawyer", isApproved: true })
    .select("-password")
    .lean();

  // For each lawyer, find their most recently updated matter
  const results = await Promise.all(
    lawyers.map(async (lawyer) => {
      const latestMatter = await Matter.findOne({ assignedLawyer: lawyer._id })
        .sort({ updatedAt: -1 })
        .select("updatedAt status stage referenceNumber")
        .lean();

      const lastActive = latestMatter?.updatedAt ?? (lawyer.createdAt as Date);
      const daysSince  = Math.floor(
        (now.getTime() - new Date(lastActive).getTime()) / (24 * 60 * 60 * 1000)
      );

      const activeMatterCount = await Matter.countDocuments({
        assignedLawyer: lawyer._id,
        status: { $in: ["assigned", "in_progress", "under_review"] },
      });

      return {
        _id:              lawyer._id.toString(),
        name:             lawyer.name,
        email:            lawyer.email,
        specialisation:   lawyer.specialisation,
        state:            lawyer.state,
        barNumber:        lawyer.barNumber,
        emailVerified:    lawyer.emailVerified,
        activeMatters:    activeMatterCount,
        completedMatters: lawyer.completedMatters,
        lastActive:       lastActive,
        daysSinceActive:  daysSince,
        totalClaimed:     activeMatterCount + lawyer.completedMatters,
        isInactive:       daysSince > 30 || (activeMatterCount === 0 && daysSince > 7),
        joinedAt:         lawyer.createdAt,
      };
    })
  );

  // Sort: most inactive first
  results.sort((a, b) => b.daysSinceActive - a.daysSinceActive);

  const inactive = results.filter(l => l.isInactive);
  const active   = results.filter(l => !l.isInactive);

  return NextResponse.json({ inactive, active, total: lawyers.length });
}
