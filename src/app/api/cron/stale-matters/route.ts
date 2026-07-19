import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platform";
import Matter from "@/models/Matter";
import User from "@/models/User";
import {
  sendStaleMatterReminder,
  sendMatterAutoReleased,
  sendClientMatterReassigning,
  sendAdminMatterReleased,
} from "@/lib/email-governance";

function isAuthorised(req: NextRequest) {
  return req.headers.get("x-cron-secret") === process.env.CRON_SECRET;
}

// Stages that are too late to auto-release
const PROTECTED_STAGES  = ["hearing", "awaiting_judgment", "completed"];
const ACTIVE_STATUSES   = ["assigned", "in_progress", "under_review"];

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    await connectDB();

    // Read thresholds from platform settings
    const settings        = await getPlatformSettings();
    const STALE_DAYS      = settings.staleMatterDays;
    const REMINDER_DAYS   = settings.reminderDays;
    const STALE_MS        = STALE_DAYS    * 24 * 60 * 60 * 1000;
    const REMINDER_MS     = REMINDER_DAYS * 24 * 60 * 60 * 1000;

    const now                = new Date();
    const staleThreshold     = new Date(now.getTime() - STALE_MS);
    const reminderThreshold  = new Date(now.getTime() - REMINDER_MS);

    const results = { autoReleased: 0, reminders: 0, errors: [] as string[] };

    // ── Reminder: matters approaching stale (between reminderDays and staleDays) ──
    const reminderMatters = await Matter.find({
      status:                  { $in: ACTIVE_STATUSES },
      stage:                   { $nin: PROTECTED_STAGES },
      assignedLawyer:          { $exists: true },
      updatedAt:               { $lt: reminderThreshold, $gte: staleThreshold },
      staleMatterReminderSent: { $ne: true },
    }).populate("assignedLawyer", "name email");

    for (const matter of reminderMatters) {
      try {
        const lawyer = matter.assignedLawyer as unknown as {
          _id: string; name: string; email: string;
        };
        const daysSince = Math.floor(
          (now.getTime() - ((matter as any).updatedAt as Date).getTime()) / (24 * 60 * 60 * 1000)
        );

        await sendStaleMatterReminder({
          lawyerName:        lawyer.name,
          lawyerEmail:       lawyer.email,
          referenceNumber:   matter.referenceNumber,
          clientName:        `${matter.client.firstName} ${matter.client.lastName}`,
          matterType:        matter.type.replace(/_/g, " "),
          daysSinceAssigned: daysSince,
        });

        await Matter.findByIdAndUpdate(matter._id, {
          staleMatterReminderSent: true,
        });

        results.reminders++;
      } catch (err) {
        results.errors.push(`Reminder ${matter.referenceNumber}: ${String(err)}`);
      }
    }

    // ── Auto-release: matters past the stale threshold ────────────────────────
    const staleMatters = await Matter.find({
      status:          { $in: ACTIVE_STATUSES },
      stage:           { $nin: PROTECTED_STAGES },
      assignedLawyer:  { $exists: true },
      updatedAt:       { $lt: staleThreshold },
    }).populate("assignedLawyer", "name email");

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

        // Decrement lawyer's active count
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
        results.errors.push(`Auto-release ${matter.referenceNumber}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success:      true,
      timestamp:    now.toISOString(),
      settings:     { STALE_DAYS, REMINDER_DAYS },
      autoReleased: results.autoReleased,
      reminders:    results.reminders,
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
