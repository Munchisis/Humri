import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
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
      console.error(
        "[VERIFY_EMAIL] Schema validation failed:",
        parsed.error.errors[0].message,
      );
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    await connectDB();

    // Hash the incoming token to match the hash stored in the database
    const tokenHash = crypto
      .createHash("sha256")
      .update(parsed.data.token)
      .digest("hex");

    console.log(
      "[VERIFY_EMAIL] Looking for token hash:",
      tokenHash.substring(0, 8) + "...",
    );

    const user = await User.findOne({
      emailVerifyToken: tokenHash,
      emailVerifyExpires: { $gt: new Date() },
    }).select("+emailVerifyToken +emailVerifyExpires");

    if (!user) {
      console.error(
        "[VERIFY_EMAIL] No matching user found for token or token expired",
      );
      // Debug: check if token exists at all (even if expired)
      const existingUser = await User.findOne({
        emailVerifyToken: tokenHash,
      }).select("+emailVerifyToken +emailVerifyExpires");
      if (existingUser) {
        console.error(
          "[VERIFY_EMAIL] Token exists but is expired. Expires at:",
          existingUser.emailVerifyExpires,
        );
      } else {
        console.error("[VERIFY_EMAIL] Token not found in database");
      }
      return NextResponse.json(
        { error: "This verification link is invalid or has expired." },
        { status: 400 },
      );
    }

    console.log("[VERIFY_EMAIL] User found:", user.email);

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    console.log("[VERIFY_EMAIL] Email verified successfully for:", user.email);

    return NextResponse.json({
      message: "Email verified successfully. You may now sign in.",
    });
  } catch (err) {
    console.error("[VERIFY_EMAIL] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
