import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmailVerification } from "@/lib/email-auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ message: "Your email is already verified." });
  }

  const token   = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.emailVerifyToken   = token;
  user.emailVerifyExpires = expires;
  await user.save();

  try {
    await sendEmailVerification({ name: user.name, email: user.email, token });
  } catch (err) {
    console.error("[RESEND_VERIFICATION email]", err);
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 500 });
  }

  return NextResponse.json({ message: "Verification email sent." });
}
