import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { sendMatterCompleted } from "@/lib/email";

// ─── Get single matter ────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    await connectDB();

    const matter = await Matter.findById(params.id)
      .populate("assignedLawyer", "name email specialisation state")
      .lean();

    if (!matter) {
      return NextResponse.json({ error: "Matter not found." }, { status: 404 });
    }

    // Lawyers can only view matters assigned to them
    if (
      session.user.role === "lawyer" &&
      matter.assignedLawyer?.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ matter });
  } catch (err) {
    console.error("[MATTER GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch matter." },
      { status: 500 },
    );
  }
}

// ─── Update matter (assign, change stage/status, add note) ───────────────────

const UpdateSchema = z.object({
  assignedLawyer: z.string().optional(),
  status: z
    .enum([
      "unassigned",
      "assigned",
      "in_progress",
      "under_review",
      "completed",
      "archived",
    ])
    .optional(),
  stage: z
    .enum([
      "intake",
      "client_consultation",
      "document_review",
      "filing",
      "negotiation",
      "hearing",
      "awaiting_judgment",
      "completed",
    ])
    .optional(),
  note: z.string().min(1).max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    await connectDB();

    const matter = await Matter.findById(params.id);
    if (!matter) {
      return NextResponse.json({ error: "Matter not found." }, { status: 404 });
    }

    const { assignedLawyer, status, stage, note } = parsed.data;

    // Only admins can assign lawyers or change assignment
    if (assignedLawyer !== undefined) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Only admins can assign lawyers." },
          { status: 403 },
        );
      }

      // Decrement old lawyer's active count
      if (matter.assignedLawyer) {
        await User.findByIdAndUpdate(matter.assignedLawyer, {
          $inc: { activeMatters: -1 },
        });
      }

      matter.assignedLawyer =
        assignedLawyer as unknown as typeof matter.assignedLawyer;
      matter.status = "assigned";

      // Increment new lawyer's active count
      await User.findByIdAndUpdate(assignedLawyer, {
        $inc: { activeMatters: 1 },
      });
    }

    // Lawyers can update status and stage for their own matters; admins can do either
    if (status !== undefined) {
      if (
        session.user.role === "lawyer" &&
        matter.assignedLawyer?.toString() !== session.user.id
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      matter.status = status;

      if (status === "completed") {
        matter.stage = "completed";
        try {
          const lawyer = await User.findById(session.user.id)
            .select("name")
            .lean();
          await sendMatterCompleted({
            clientName: `${matter.client.firstName} ${matter.client.lastName}`,
            clientEmail: matter.client.email,
            referenceNumber: matter.referenceNumber,
            lawyerName: lawyer?.name ?? "Your lawyer",
          });
        } catch (err) {
          console.error("[EMAIL]", err);
        }
        // Update lawyer's stats
        if (matter.assignedLawyer) {
          await User.findByIdAndUpdate(matter.assignedLawyer, {
            $inc: { activeMatters: -1, completedMatters: 1 },
          });
        }
      }
    }

    if (stage !== undefined) {
      if (
        session.user.role === "lawyer" &&
        matter.assignedLawyer?.toString() !== session.user.id
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      matter.stage = stage;
      matter.stageHistory.push({
        stage,
        changedBy: session.user
          .id as unknown as (typeof matter.stageHistory)[0]["changedBy"],
        changedAt: new Date(),
      });

      if (stage === "completed") {
        matter.status = "completed";
      } else if (matter.status === "assigned") {
        matter.status = "in_progress";
      }
    }

    // Both roles can add notes to matters they're involved in
    if (note !== undefined) {
      matter.notes.push({
        author: session.user
          .id as unknown as (typeof matter.notes)[0]["author"],
        authorName: session.user.name ?? "Unknown",
        content: note,
        createdAt: new Date(),
      });
    }

    await matter.save();

    return NextResponse.json({
      message: "Matter updated successfully.",
      matter,
    });
  } catch (err) {
    console.error("[MATTER PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update matter." },
      { status: 500 },
    );
  }
}
