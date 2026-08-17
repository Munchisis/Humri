import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import {
  sendMatterCompleted,
  sendLawyerAssigned,
  sendLawyerMatterAssigned,
  sendMatterStageUpdated,
} from "@/lib/email";

// ─── Get single matter ────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    await connectDB();

    const matter = await Matter.findById(id)
      .populate("assignedLawyer", "name email specialisation state")
      .lean();

    if (!matter) {
      return NextResponse.json({ error: "Matter not found." }, { status: 404 });
    }

    // Lawyers can view matters assigned to them, and unassigned matters in the pool
    if (session.user.role === "lawyer") {
      const assignedId = matter.assignedLawyer
        ? typeof matter.assignedLawyer === "object" &&
          matter.assignedLawyer !== null
          ? (matter.assignedLawyer as any)._id?.toString()
          : String(matter.assignedLawyer)
        : null;
      if (assignedId && assignedId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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

const STAGE_LABELS: Record<string, string> = {
  intake: "Intake",
  client_consultation: "Client consultation",
  document_review: "Document review",
  filing: "Filing",
  negotiation: "Negotiation",
  hearing: "Hearing",
  awaiting_judgment: "Awaiting judgment",
  completed: "Completed",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

    const matter = await Matter.findById(id);
    if (!matter) {
      return NextResponse.json({ error: "Matter not found." }, { status: 404 });
    }

    const { assignedLawyer, status, stage, note } = parsed.data;

    let completedEmailSent = false;
    const previousStatus = matter.status;

    // Only admins can assign lawyers or change assignment
    if (assignedLawyer !== undefined) {
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Only admins can assign lawyers." },
          { status: 403 },
        );
      }

      // Decrement old lawyer's active count if present
      if (matter.assignedLawyer) {
        await User.findByIdAndUpdate(matter.assignedLawyer, {
          $inc: { activeMatters: -1 },
        });
      }

      matter.assignedLawyer =
        assignedLawyer as unknown as typeof matter.assignedLawyer;
      matter.status = "assigned";

      // Increment new lawyer's active count
      const newLawyer = await User.findByIdAndUpdate(
        assignedLawyer,
        { $inc: { activeMatters: 1 } },
        { new: true },
      )
        .select("name specialisation")
        .lean();

      if (!newLawyer) {
        return NextResponse.json(
          { error: "Assigned lawyer not found." },
          { status: 404 },
        );
      }

      // Notify the client that a lawyer has been assigned
      try {
        await sendLawyerAssigned({
          clientName: `${matter.client.firstName} ${matter.client.lastName}`,
          clientEmail: matter.client.email,
          referenceNumber: matter.referenceNumber,
          lawyerName: newLawyer?.name ?? "Your lawyer",
          lawyerSpecialisation: newLawyer?.specialisation ?? "",
        });
      } catch (err) {
        console.error("[PATCH email - assigned]", {
          matterId: matter._id,
          err,
        });
      }

      // Notify the lawyer that they've been assigned a new matter
      try {
        const lawyerUser = await User.findById(assignedLawyer)
          .select("email")
          .lean();
        if (lawyerUser?.email) {
          await sendLawyerMatterAssigned({
            lawyerName: newLawyer?.name ?? "Lawyer",
            lawyerEmail: lawyerUser.email,
            referenceNumber: matter.referenceNumber,
            clientName: `${matter.client.firstName} ${matter.client.lastName}`,
            matterType: matter.type,
            urgency: matter.urgency,
          });
        }
      } catch (err) {
        console.error("[PATCH email - lawyer notified of assignment]", {
          matterId: matter._id,
          err,
        });
      }
    }

    // Lawyers can update status and stage for their own matters; admins can do either
    if (status !== undefined) {
      if (status === "archived" && session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Only admins can archive matters." },
          { status: 403 },
        );
      }

      if (
        session.user.role === "lawyer" &&
        matter.assignedLawyer?.toString() !== session.user.id
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      matter.status = status;

      if (status === "completed") {
        matter.stage = "completed";
        if (previousStatus !== "completed") {
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
            completedEmailSent = true;
          } catch (err) {
            console.error("[PATCH email - completed]", {
              matterId: matter._id,
              err,
            });
          }

          if (matter.assignedLawyer) {
            await User.findByIdAndUpdate(matter.assignedLawyer, {
              $inc: { activeMatters: -1, completedMatters: 1 },
            });
          }
        }
      } else if (status === "archived") {
        if (
          matter.assignedLawyer &&
          previousStatus !== "completed" &&
          previousStatus !== "archived"
        ) {
          await User.findByIdAndUpdate(matter.assignedLawyer, {
            $inc: { activeMatters: -1 },
          });
        }
        matter.assignedLawyer = undefined;
      } else if (status === "unassigned") {
        if (matter.assignedLawyer) {
          await User.findByIdAndUpdate(matter.assignedLawyer, {
            $inc: { activeMatters: -1 },
          });
        }
        matter.assignedLawyer = undefined;
        matter.stage = "intake";
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

        if (!completedEmailSent && previousStatus !== "completed") {
          try {
            const lawyer = matter.assignedLawyer
              ? await User.findById(matter.assignedLawyer).select("name").lean()
              : null;
            await sendMatterCompleted({
              clientName: `${matter.client.firstName} ${matter.client.lastName}`,
              clientEmail: matter.client.email,
              referenceNumber: matter.referenceNumber,
              lawyerName: lawyer?.name ?? "Your lawyer",
            });
            completedEmailSent = true;
          } catch (err) {
            console.error("[PATCH email - completed via stage]", {
              matterId: matter._id,
              err,
            });
          }

          if (matter.assignedLawyer) {
            await User.findByIdAndUpdate(matter.assignedLawyer, {
              $inc: { activeMatters: -1, completedMatters: 1 },
            });
          }
        }
      } else {
        try {
          await sendMatterStageUpdated({
            clientName: `${matter.client.firstName} ${matter.client.lastName}`,
            clientEmail: matter.client.email,
            referenceNumber: matter.referenceNumber,
            stageLabel: STAGE_LABELS[stage] ?? stage,
          });
        } catch (err) {
          console.error("[PATCH email - stage updated]", {
            matterId: matter._id,
            err,
          });
        }
      }

      if (matter.status === "assigned") {
        matter.status = "in_progress";
      }
    }

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
