import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platform";
import Matter from "@/models/Matter";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await connectDB();

  const settings      = await getPlatformSettings();
  const REMINDER_DAYS = settings.reminderDays;
  const STALE_DAYS    = settings.staleMatterDays;

  const now              = new Date();
  const reminderCutoff   = new Date(now.getTime() - REMINDER_DAYS * 24 * 60 * 60 * 1000);
  const staleCutoff      = new Date(now.getTime() - STALE_DAYS    * 24 * 60 * 60 * 1000);
  const lawyerId         = new mongoose.Types.ObjectId(session.user.id);

  const [staleCount, warningCount] = await Promise.all([
    // Past stale threshold — auto-release imminent
    Matter.countDocuments({
      assignedLawyer: lawyerId,
      status:         { $in: ["assigned", "in_progress", "under_review"] },
      updatedAt:      { $lt: staleCutoff },
    }),
    // Approaching stale — needs attention soon
    Matter.countDocuments({
      assignedLawyer: lawyerId,
      status:         { $in: ["assigned", "in_progress", "under_review"] },
      updatedAt:      { $lt: reminderCutoff, $gte: staleCutoff },
    }),
  ]);

  return NextResponse.json({
    stale:   staleCount,
    warning: warningCount,
    total:   staleCount + warningCount,
  });
}
