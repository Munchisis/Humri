import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  sendEmailVerificationReminder,
  sendEmailVerificationSuspension,
} from "@/lib/email-governance";

function isAuthorised(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  return secret === process.env.CRON_SECRET;
}

const REMINDER_DAYS    = 7;
const SUSPENSION_DAYS  = 14;
const REMINDER_MS      = REMINDER_DAYS   * 24 * 60 * 60 * 1000;
const SUSPENSION_MS    = SUSPENSION_DAYS * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    await connectDB();

    const now              = new Date();
    const reminderCutoff   = new Date(now.getTime() - REMINDER_MS);
    const suspensionCutoff = new Date(now.getTime() - SUSPENSION_MS);

    const results = {
      reminders:   0,
      suspensions: 0,
      errors:      [] as string[],
    };

    // ── Find unverified approved lawyers ──────────────────────────────────────
    const unverified = await User.find({
      role:          "lawyer",
      isApproved:    true,
      emailVerified: { $ne: true },
      createdAt:     { $lt: reminderCutoff }, // registered more than 7 days ago
    }).select("+emailVerifyToken +emailVerifyExpires");

    for (const lawyer of unverified) {
      try {
        const age = now.getTime() - (lawyer.createdAt as Date).getTime();

        // Always ensure there's a valid verify token (generate fresh if expired)
        let token = lawyer.emailVerifyToken;
        if (!token || !lawyer.emailVerifyExpires || lawyer.emailVerifyExpires < now) {
          token = crypto.randomBytes(32).toString("hex");
          lawyer.emailVerifyToken   = token;
          lawyer.emailVerifyExpires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          await lawyer.save();
        }

        if (age >= SUSPENSION_MS) {
          // ── Suspend account ────────────────────────────────────────────────
          await User.findByIdAndUpdate(lawyer._id, { isApproved: false });
          await sendEmailVerificationSuspension({
            name:  lawyer.name,
            email: lawyer.email,
            token,
          });
          results.suspensions++;
        } else if (age >= REMINDER_MS) {
          // ── Send reminder (only once — between day 7 and day 14) ───────────
          await sendEmailVerificationReminder({
            name:  lawyer.name,
            email: lawyer.email,
            token,
          });
          results.reminders++;
        }
      } catch (err) {
        results.errors.push(`${lawyer.email}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success:     true,
      timestamp:   now.toISOString(),
      reminders:   results.reminders,
      suspensions: results.suspensions,
      errors:      results.errors,
    });
  } catch (err) {
    console.error("[CRON email-verification]", err);
    return NextResponse.json(
      { error: "Cron job failed.", details: String(err) },
      { status: 500 }
    );
  }
}
