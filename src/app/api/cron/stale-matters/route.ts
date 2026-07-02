import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import {
  sendStaleMatterReminder,
  sendMatterAutoReleased,
  sendClientMatterReassigning,
  sendAdminMatterReleased,
} from "@/lib/email-governance";

// Vercel cron calls this with a secret header to prevent public access
function isAuthorised(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  return secret === process.env.CRON_SECRET;
}

const STALE_DAYS         = 7;   // auto-release after this many days
const REMINDER_DAYS      = 5;   // send a warning reminder at this point
const STALE_MS           = STALE_DAYS    * 24 * 60 * 60 * 1000;
const REMINDER_MS        = REMINDER_DAYS * 24 * 60 * 60 * 1000;

// Stages that cannot be auto-released — too late to hand off safely
const PROTECTED_STAGES   = ["hearing", "awaiting_judgment", "completed"];
// Statuses that indicate active engagement
const ACTIVE_STATUSES    = ["assigned", "in_progress", "under_review"];

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    await connectDB();

    const now            = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_MS);
    const reminderThreshold = new Date(now.getTime() - REMINDER_MS);

    // Find all active matters not updated recently
    const staleMatters = await Matter.find({
      status:        { $in: ACTIVE_STATUSES },
      stage:         { $nin: PROTECTED_STAGES },
      assignedLawyer: { $exists: true },
      updatedAt:     { $lt: staleThreshold },
    }).populate("assignedLawyer", "name email");

    // Find matters approaching the stale threshold (reminder only)
    const reminderMatters = await Matter.find({
      status:        { $in: ACTIVE_STATUSES },
      stage:         { $nin: PROTECTED_STAGES },
      assignedLawyer: { $exists: true },
      updatedAt:     { $lt: reminderThreshold, $gte: staleThreshold },
      staleMatterReminderSent: { $ne: true },
    }).populate("assignedLawyer", "name email");

    const results = {
      autoReleased: 0,
      remindersent: 0,
      errors:       [] as string[],
    };

    // ── Send reminders for approaching-stale matters ──
    for (const matter of reminderMatters) {
      try {
        const lawyer = matter.assignedLawyer as unknown as {
          _id: string; name: string; email: string;
        };
        const daysSince = Math.floor(
          (now.getTime() - matter.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
        );

        await sendStaleMatterReminder({
          lawyerName:        lawyer.name,
          lawyerEmail:       lawyer.email,
          referenceNumber:   matter.referenceNumber,
          clientName:        `${matter.client.firstName} ${matter.client.lastName}`,
          matterType:        matter.type.replace(/_/g, " "),
          daysSinceAssigned: daysSince,
        });

        // Mark reminder sent so we don't spam
        await Matter.findByIdAndUpdate(matter._id, {
          staleMatterReminderSent: true,
        });

        results.remindersent++;
      } catch (err) {
        results.errors.push(`Reminder for ${matter.referenceNumber}: ${String(err)}`);
      }
    }

    // ── Auto-release stale matters ──
    const admins = await User.find({ role: "admin" }).select("email").lean();

    for (const matter of staleMatters) {
      try {
        const lawyer = matter.assignedLawyer as unknown as {
          _id: string; name: string; email: string;
        };
        const clientName = `${matter.client.firstName} ${matter.client.lastName}`;

        // Release the matter
        await Matter.findByIdAndUpdate(matter._id, {
          $set: {
            status:                  "unassigned",
            stage:                   "intake",
            staleMatterReminderSent: false,
          },
          $unset: { assignedLawyer: "" },
        });

        // Decrement lawyer active count
        await User.findByIdAndUpdate(lawyer._id, {
          $inc: { activeMatters: -1 },
        });

        // Notify all parties
        await Promise.all([
          sendMatterAutoReleased({
            lawyerName:      lawyer.name,
            lawyerEmail:     lawyer.email,
            referenceNumber: matter.referenceNumber,
            matterType:      matter.type.replace(/_/g, " "),
          }),
          sendClientMatterReassigning({
            clientName,
            clientEmail:     matter.client.email,
            referenceNumber: matter.referenceNumber,
          }),
          ...admins.map((a) =>
            sendAdminMatterReleased({
              adminEmail:      a.email,
              lawyerName:      lawyer.name,
              referenceNumber: matter.referenceNumber,
              clientName,
              matterType:      matter.type.replace(/_/g, " "),
              reason:          `Automatically released after ${STALE_DAYS} days of inactivity.`,
              isAutomatic:     true,
            })
          ),
        ]);

        results.autoReleased++;
      } catch (err) {
        results.errors.push(`Auto-release for ${matter.referenceNumber}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success:      true,
      timestamp:    now.toISOString(),
      autoReleased: results.autoReleased,
      reminders:    results.remindersent,
      errors:       results.errors,
    });
  } catch (err) {
    console.error("[CRON stale-matters]", err);
    return NextResponse.json(
      { error: "Cron job failed.", details: String(err) },
      { status: 500 }
    );
  }
}
