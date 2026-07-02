import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";

/**
 * Public endpoint — no auth required.
 * Clients enter their reference number to check matter status.
 * Only returns safe, non-sensitive fields.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref")?.trim().toUpperCase();

  if (!ref) {
    return NextResponse.json(
      { error: "Please provide a reference number." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const matter = await Matter.findOne({ referenceNumber: ref })
      .select("referenceNumber type urgency status stage createdAt updatedAt")
      .lean();

    if (!matter) {
      return NextResponse.json(
        { error: "No matter found with that reference number. Please check and try again." },
        { status: 404 }
      );
    }

    // Return only what the client needs — no personal data, no lawyer info
    return NextResponse.json({
      referenceNumber: matter.referenceNumber,
      type:            matter.type,
      urgency:         matter.urgency,
      status:          matter.status,
      stage:           matter.stage,
      submittedAt:     (matter as any).createdAt,
      lastUpdated:     (matter as any).updatedAt,
    });
  } catch (err) {
    console.error("[TRACK]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
