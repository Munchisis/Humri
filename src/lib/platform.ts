import { connectDB } from "@/lib/db";
import PlatformSettings from "@/models/PlatformSettings";

export interface Settings {
  maxMattersPerLawyer: number;
  staleMatterDays:     number;
  reminderDays:        number;
  suspensionDays:      number;
  platformName:        string;
  supportEmail:        string;
}

// Defaults used as fallback if DB read fails
const DEFAULTS: Settings = {
  maxMattersPerLawyer: 3,
  staleMatterDays:     7,
  reminderDays:        5,
  suspensionDays:      14,
  platformName:        "HUMRI",
  supportEmail:        "support@humri.ng",
};

/**
 * Fetches platform settings from DB with fallback to defaults.
 * Safe to call from any API route or cron job.
 */
export async function getPlatformSettings(): Promise<Settings> {
  try {
    await connectDB();
    const doc = await PlatformSettings.findOne().lean();
    if (!doc) return DEFAULTS;
    return {
      maxMattersPerLawyer: doc.maxMattersPerLawyer ?? DEFAULTS.maxMattersPerLawyer,
      staleMatterDays:     doc.staleMatterDays     ?? DEFAULTS.staleMatterDays,
      reminderDays:        doc.reminderDays        ?? DEFAULTS.reminderDays,
      suspensionDays:      doc.suspensionDays      ?? DEFAULTS.suspensionDays,
      platformName:        doc.platformName        ?? DEFAULTS.platformName,
      supportEmail:        doc.supportEmail        ?? DEFAULTS.supportEmail,
    };
  } catch (err) {
    console.error("[getPlatformSettings] DB read failed, using defaults:", err);
    return DEFAULTS;
  }
}
