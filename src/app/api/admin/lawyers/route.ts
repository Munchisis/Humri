import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendLawyerApproved, sendLawyerSuspended } from "@/lib/email";

// ─── List all lawyers (admin only) ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const approved = searchParams.get("approved");

  const query: Record<string, unknown> = { role: "lawyer" };
  if (approved === "true") query.isApproved = true;
  if (approved === "false") query.isApproved = false;

  const lawyers = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ lawyers });
}

// ─── Approve or suspend a lawyer ─────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { lawyerId, isApproved } = await req.json();

  if (!lawyerId || typeof isApproved !== "boolean") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  await connectDB();

  const lawyer = await User.findOneAndUpdate(
    { _id: lawyerId, role: "lawyer" },
    { isApproved },
    { new: true, select: "-password" },
  );

  if (isApproved && lawyer) {
    try {
      await sendLawyerApproved({
        lawyerName: lawyer.name,
        lawyerEmail: lawyer.email,
      });
    } catch (err) {
      console.error("[EMAIL]", err);
    }
  }

  if (!isApproved && lawyer) {
    try {
      await sendLawyerSuspended({
        lawyerName: lawyer.name,
        lawyerEmail: lawyer.email,
      });
    } catch (err) {
      console.error("[EMAIL]", err);
    }
  }

  if (!lawyer) {
    return NextResponse.json({ error: "Lawyer not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: isApproved
      ? `${lawyer.name}'s account has been approved.`
      : `${lawyer.name}'s account has been suspended.`,
    lawyer,
  });
}
