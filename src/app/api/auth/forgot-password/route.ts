import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendPasswordReset } from "@/lib/email-auth";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    await connectDB();

    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      try {
        await sendPasswordReset({
          name: user.name,
          email: user.email,
          token,
        });
      } catch (err) {
        console.error("[FORGOT PASSWORD] email failed:", err);
      }
    }

    return NextResponse.json({
      message:
        "If an account exists with that email, we have sent a password reset link.",
    });
  } catch (err) {
    console.error("[FORGOT PASSWORD]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
