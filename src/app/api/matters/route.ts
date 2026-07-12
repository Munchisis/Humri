import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import { authOptions } from "@/lib/auth";
import { generateReferenceNumber } from "@/lib/utils";
import mongoose from "mongoose";
import { sendMatterSubmitted, sendAdminNewMatter } from "@/lib/email";
import User from "@/models/User";

// ─── Submit a matter (public — no auth required) ──────────────────────────────

const SubmitSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  state: z.string().optional(),
  preferredLanguage: z.string().optional(),
  type: z.enum([
    "employment",
    "tenancy",
    "family_law",
    "criminal",
    "land_property",
    "contract",
    "human_rights",
    "debt",
    "immigration",
    "other",
  ]),
  description: z
    .string()
    .min(
      20,
      "Please describe your matter in more detail (at least 20 characters)",
    ),
  urgency: z.enum(["normal", "urgent", "critical"]).default("normal"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      state,
      preferredLanguage,
      type,
      description,
      urgency,
    } = parsed.data;

    await connectDB();

    // Generate a unique reference number with collision retry
    let referenceNumber = generateReferenceNumber();
    let attempts = 0;
    while ((await Matter.exists({ referenceNumber })) && attempts < 5) {
      referenceNumber = generateReferenceNumber();
      attempts++;
    }

    const matter = await Matter.create({
      referenceNumber,
      client: { firstName, lastName, email, phone, state, preferredLanguage },
      type,
      description,
      urgency,
      status: "unassigned",
      stage: "intake",
    });

    console.log("[EMAIL] Attempting to send to:", email);
    try {
      await sendMatterSubmitted({
        clientName: `${firstName} ${lastName}`,
        clientEmail: email,
        referenceNumber: matter.referenceNumber,
        matterType: type.replace(/_/g, " "),
      });

      // notify all admins
      const admins = await User.find({ role: "admin" }).select("email").lean();
      await Promise.all(
        admins.map((a) =>
          sendAdminNewMatter({
            adminEmail: a.email,
            referenceNumber: matter.referenceNumber,
            clientName: `${firstName} ${lastName}`,
            matterType: type.replace(/_/g, " "),
            urgency,
          }),
        ),
      );
      console.log("[EMAIL] Sent successfully");
    } catch (err) {
      console.error("[EMAIL] failed:", err); // don't block the response if email fails
    }

    return NextResponse.json(
      {
        message: "Matter submitted successfully.",
        referenceNumber: matter.referenceNumber,
        matterId: matter._id.toString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[MATTERS POST]", err);
    return NextResponse.json(
      { error: "Failed to submit matter. Please try again." },
      { status: 500 },
    );
  }
}

// ─── List matters (admin sees all, lawyer sees own) ───────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const urgency = searchParams.get("urgency");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    // Build query
    const query: Record<string, unknown> = {};

    if (session.user.role === "lawyer") {
      if (status) {
        // Lawyer explicitly requesting specific status (e.g., unassigned for pool)
        query.status = status;
        if (status === "unassigned") {
          query.assignedLawyer = null;
        }
      } else {
        // Lawyer viewing their own assigned matters
        query.assignedLawyer = new mongoose.Types.ObjectId(session.user.id);
      }
    } else {
      // Admin viewing matters
      if (status) {
        query.status = status;
        if (status === "unassigned") {
          query.assignedLawyer = null;
        }
      }
    }
    if (type) query.type = type;
    if (urgency) query.urgency = urgency;

    const [matters, total] = await Promise.all([
      Matter.find(query)
        .populate("assignedLawyer", "name email specialisation")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Matter.countDocuments(query),
    ]);

    return NextResponse.json({ matters, total, page, limit });
  } catch (err) {
    console.error("[MATTERS GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch matters." },
      { status: 500 },
    );
  }
}
