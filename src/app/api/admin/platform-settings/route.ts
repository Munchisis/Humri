import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import PlatformSettings from "@/models/PlatformSettings";

const SettingsSchema = z.object({
  maxMattersPerLawyer: z.number().min(1).max(10).optional(),
  staleMatterDays:     z.number().min(1).max(30).optional(),
  reminderDays:        z.number().min(1).max(29).optional(),
  suspensionDays:      z.number().min(7).max(60).optional(),
  platformName:        z.string().min(2).max(50).optional(),
  supportEmail:        z.string().email().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  // Get or create default settings
  let settings = await PlatformSettings.findOne().lean();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }

  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // Validate reminderDays < staleMatterDays
  if (
    parsed.data.reminderDays !== undefined &&
    parsed.data.staleMatterDays !== undefined &&
    parsed.data.reminderDays >= parsed.data.staleMatterDays
  ) {
    return NextResponse.json(
      { error: "Reminder days must be less than stale matter days." },
      { status: 400 }
    );
  }

  await connectDB();

  const settings = await PlatformSettings.findOneAndUpdate(
    {},
    {
      $set: {
        ...parsed.data,
        updatedBy: session.user.id,
      },
    },
    { new: true, upsert: true }
  );

  return NextResponse.json({
    message: "Platform settings updated successfully.",
    settings,
  });
}
