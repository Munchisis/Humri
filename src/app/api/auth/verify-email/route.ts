import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "A valid verification token is required."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({
      emailVerifyToken: parsed.data.token,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 },
      );
    }

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    return NextResponse.json({
      message: "Email verified successfully. You may now sign in.",
    });
  } catch (err) {
    console.error("[VERIFY EMAIL]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
