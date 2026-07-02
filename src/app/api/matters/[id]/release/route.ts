import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import {
  sendAdminMatterReleased,
  sendClientMatterReassigning,
} from "@/lib/email-governance";

const BLOCKED_STAGES = ["hearing", "awaiting_judgment", "completed"];

const Schema = z.object({
  reason: z
    .string()
    .min(20, "Please provide at least 20 characters explaining why you are releasing this matter.")
    .max(500, "Reason must be under 500 characters."),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "lawyer") {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body   = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;
    await connectDB();

    const matter = await Matter.findById(params.id);
    if (!matter) {
      return NextResponse.json({ error: "Matter not found." }, { status: 404 });
    }

    // Only the assigned lawyer can release it
    if (matter.assignedLawyer?.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only release matters assigned to you." }, { status: 403 });
    }

    // Block release if matter is too far along
    if (BLOCKED_STAGES.includes(matter.stage)) {
      return NextResponse.json(
        {
          error: `You cannot release a matter at the "${matter.stage.replace(/_/g, " ")}" stage. Please contact an admin if you need to withdraw.`,
        },
        { status: 400 }
      );
    }

    if (matter.status === "completed") {
      return NextResponse.json(
        { error: "This matter is already completed." },
        { status: 400 }
      );
    }

    const lawyerName = session.user.name ?? "A lawyer";
    const clientName = `${matter.client.firstName} ${matter.client.lastName}`;

    // Release back to pool
    matter.assignedLawyer = undefined;
    matter.status         = "unassigned";
    matter.stage          = "intake";
    matter.stageHistory.push({
      stage:     "intake",
      changedBy: session.user.id as unknown as (typeof matter.stageHistory)[0]["changedBy"],
      changedAt: new Date(),
    });
    await matter.save();

    // Decrement lawyer's active count
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { activeMatters: -1 },
    });

    // Notify admin and client — non-blocking
    try {
      const admins = await User.find({ role: "admin" }).select("email").lean();
      await Promise.all([
        ...admins.map((a) =>
          sendAdminMatterReleased({
            adminEmail:      a.email,
            lawyerName,
            referenceNumber: matter.referenceNumber,
            clientName,
            matterType:      matter.type.replace(/_/g, " "),
            reason,
            isAutomatic:     false,
          })
        ),
        sendClientMatterReassigning({
          clientName,
          clientEmail:     matter.client.email,
          referenceNumber: matter.referenceNumber,
        }),
      ]);
    } catch (err) {
      console.error("[RELEASE email]", err);
    }

    return NextResponse.json({
      message: "Matter released back to the open pool. The admin team has been notified.",
    });
  } catch (err) {
    console.error("[MATTER RELEASE]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
