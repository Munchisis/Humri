import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ResetPasswordQuerySchema = z.object({
  token: z.string().min(1, "A valid reset token is required."),
});

const ResetPasswordBodySchema = z.object({
  token: z.string().min(1, "A valid reset token is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") ?? "";
    const parsed = ResetPasswordQuerySchema.safeParse({ token });

    if (!parsed.success) {
      return NextResponse.json({ valid: false });
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    return NextResponse.json({ valid: !!user });
  } catch (err) {
    console.error("[RESET PASSWORD GET]", err);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: parsed.data.token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return NextResponse.json(
        { error: "This password reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    user.password = parsed.data.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("[RESET PASSWORD POST]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
