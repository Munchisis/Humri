import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ProfileSchema = z.object({
  name:           z.string().min(2, "Name must be at least 2 characters"),
  specialisation: z.string().optional(),
  state:          z.string().optional(),
  barNumber:      z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body   = await req.json();
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  const updateData: Record<string, string> = {
    name: parsed.data.name,
  };

  // Lawyers can update extra fields
  if (session.user.role === "lawyer") {
    if (parsed.data.specialisation) updateData.specialisation = parsed.data.specialisation;
    if (parsed.data.state)          updateData.state          = parsed.data.state;
    if (parsed.data.barNumber)      updateData.barNumber      = parsed.data.barNumber;
  }

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $set: updateData },
    { new: true, select: "-password" }
  );

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({
    message: "Profile updated successfully.",
    user: {
      name:           user.name,
      email:          user.email,
      specialisation: user.specialisation,
      state:          user.state,
      barNumber:      user.barNumber,
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(session.user.id).select("-password").lean();
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}
