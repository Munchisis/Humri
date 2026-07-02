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

  const [
    totalMatters,
    unassigned,
    inProgress,
    completed,
    critical,
    totalLawyers,
    pendingApproval,
  ] = await Promise.all([
    Matter.countDocuments(),
    Matter.countDocuments({ status: "unassigned" }),
    Matter.countDocuments({ status: { $in: ["assigned", "in_progress", "under_review"] } }),
    Matter.countDocuments({ status: "completed" }),
    Matter.countDocuments({ urgency: "critical", status: { $ne: "completed" } }),
    User.countDocuments({ role: "lawyer", isApproved: true }),
    User.countDocuments({ role: "lawyer", isApproved: false }),
  ]);

  return NextResponse.json({
    totalMatters,
    unassigned,
    inProgress,
    completed,
    critical,
    totalLawyers,
    pendingApproval,
  });
}
