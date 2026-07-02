import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Matter from "@/models/Matter";
import User from "@/models/User";
import mongoose from "mongoose";
import { sendLawyerAssigned } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await connectDB();

  const matter = await Matter.findById(params.id);
  if (!matter) {
    return NextResponse.json({ error: "Matter not found." }, { status: 404 });
  }

  if (matter.assignedLawyer) {
    return NextResponse.json(
      { error: "This matter has already been claimed by another lawyer." },
      { status: 409 }
    );
  }

  matter.assignedLawyer = new mongoose.Types.ObjectId(session.user.id) as unknown as typeof matter.assignedLawyer;
  matter.status = "assigned";
  matter.stage  = "client_consultation";
  await matter.save();

  try {
  const lawyer = await User.findById(session.user.id).select("name specialisation").lean();
  await sendLawyerAssigned({
    clientName:           `${matter.client.firstName} ${matter.client.lastName}`,
    clientEmail:          matter.client.email,
    referenceNumber:      matter.referenceNumber,
    lawyerName:           lawyer?.name ?? "Your lawyer",
    lawyerSpecialisation: lawyer?.specialisation ?? "",
  });
} catch (err) {
  console.error("[EMAIL]", err);
}

  await User.findByIdAndUpdate(session.user.id, {
    $inc: { activeMatters: 1 },
  });

  return NextResponse.json({ message: "Matter claimed successfully." });
}