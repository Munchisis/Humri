import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platform";
import Matter from "@/models/Matter";
import User from "@/models/User";
import { sendLawyerAssigned } from "@/lib/email";

const PROGRESS_STAGES = [
  "document_review",
  "filing",
  "negotiation",
  "hearing",
  "awaiting_judgment",
];

function hasRole(session: any, role: string): boolean {
  const roles: string[] = session?.user?.roles ?? [session?.user?.role];
  return roles.includes(role);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
      }

      // Must have lawyer role (or admin with lawyer role)
      if (!hasRole(session, "lawyer")) {
        return NextResponse.json(
          { error: "Only lawyers can claim matters." },
          { status: 401 },
        );
      }

      await connectDB();

      const lawyerId = new mongoose.Types.ObjectId(session.user.id);

      // Fetch the lawyer once, up front, and confirm they're active BEFORE
      // touching the matter. This must happen before any write — claiming
      // a matter is not reversible just by returning an error afterwards.
      const lawyerUser = await User.findById(lawyerId)
        .select("isActive name specialisation")
        .lean();

      if (!lawyerUser?.isActive) {
        return NextResponse.json(
          {
            error:
              "Your lawyer account is currently inactive or pending verification.",
          },
          { status: 403 },
        );
      }

      const settings = await getPlatformSettings();
      const MAX_ACTIVE = settings.maxMattersPerLawyer;

      const activeMatters = await Matter.find({
        assignedLawyer: lawyerId,
        status: { $in: ["assigned", "in_progress", "under_review"] },
      }).select("stage");

      if (activeMatters.length >= MAX_ACTIVE) {
        const hasProgress = activeMatters.some((m) =>
          PROGRESS_STAGES.includes(m.stage),
        );
        if (!hasProgress) {
          return NextResponse.json(
            {
              error: `You have ${activeMatters.length} active matter${activeMatters.length !== 1 ? "s" : ""} with no meaningful progress. Please advance at least one to Document Review stage before accepting new ones.`,
            },
            { status: 403 },
          );
        }
        return NextResponse.json(
          {
            error: `You already have ${MAX_ACTIVE} active matter${MAX_ACTIVE !== 1 ? "s" : ""}. Please complete or release one before accepting a new matter.`,
          },
          { status: 403 },
        );
      }

      // Only now do we actually mutate the matter — every earlier check that
      // could reject the claim has already happened.
      const updatedMatter = await Matter.findOneAndUpdate(
        {
          _id: id,
          $or: [{ assignedLawyer: { $exists: false } }, { assignedLawyer: null }],
        },
        {
          $set: {
            assignedLawyer: lawyerId,
            status: "assigned",
            stage: "client_consultation",
          },
        },
        { new: true },
      );

      if (!updatedMatter) {
        const exists = await Matter.exists({ _id: id });
        if (!exists)
          return NextResponse.json(
            { error: "Matter not found." },
            { status: 404 },
          );
        return NextResponse.json(
          { error: "This matter has already been claimed by another lawyer." },
          { status: 409 },
        );
      }

      await User.findByIdAndUpdate(lawyerId, { $inc: { activeMatters: 1 } });

      try {
        await sendLawyerAssigned({
          clientName: `${updatedMatter.client.firstName} ${updatedMatter.client.lastName}`,
          clientEmail: updatedMatter.client.email,
          referenceNumber: updatedMatter.referenceNumber,
          lawyerName: lawyerUser.name ?? "Your lawyer",
          lawyerSpecialisation: lawyerUser.specialisation ?? "",
        });
      } catch (err) {
        // TODO: this currently fails silently from the client's perspective —
        // the matter IS assigned, but if this throws, the client never finds
        // out by email. At minimum, log with enough context to find these
        // later (e.g. a "notificationFailed" flag on the matter), and
        // consider alerting or a retry queue rather than console.error alone.
        console.error("[CLAIM email]", { matterId: updatedMatter._id, err });
      }

      return NextResponse.json({
        message: "Matter claimed successfully.",
        referenceNumber: updatedMatter.referenceNumber,
      });
    } catch (err) {
      console.error("[MATTER CLAIM]", err);
      return NextResponse.json(
        { error: "Internal server error." },
        { status: 500 },
      );
    }
  }
}
