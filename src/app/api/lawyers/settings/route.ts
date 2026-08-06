import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const settings = await getPlatformSettings();

  // Only expose what the lawyer needs — don't expose admin-only settings
  return NextResponse.json({
    maxMattersPerLawyer: settings.maxMattersPerLawyer,
    staleMatterDays: settings.staleMatterDays,
    reminderDays: settings.reminderDays,
  });
}
