import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmailVerification } from "@/lib/email-auth";

const SPECIALISATIONS = [
  "Employment & Labour",
  "Family Law",
  "Criminal Defence",
  "Property & Land",
  "Contract Law",
  "Human Rights",
  "Debt Recovery",
  "Immigration",
  "General Practice",
] as const;

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

const RegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
    // Format check: adjust the pattern to match the real SCN format if it's stricter than this
    barNumber: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, "Please enter your Supreme Court Number")
      .max(10, "Supreme Court Number looks too long")
      .regex(
        /^[A-Z0-9-]+$/,
        "Supreme Court Number contains invalid characters",
      ),
    // Validated against the same enums the dropdowns use, so nothing bypasses the UI
    specialisation: z.enum(SPECIALISATIONS, {
      errorMap: () => ({ message: "Please select a valid specialisation" }),
    }),
    state: z.enum(NIGERIAN_STATES, {
      errorMap: () => ({ message: "Please select a valid state" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, barNumber, specialisation, state } =
      parsed.data;

    await connectDB();

    // Check for duplicate email — email is already lowercased by the schema
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Check for duplicate bar number — prevents one lawyer registering multiple accounts
    const existingBarNumber = await User.findOne({ barNumber });
    if (existingBarNumber) {
      return NextResponse.json(
        { error: "An account with this Supreme Court Number already exists." },
        { status: 409 },
      );
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    // Store a hash of the token, not the raw value — same principle as the password.
    // A DB read/leak shouldn't hand out usable verification links.
    const verifyTokenHash = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // All self-registrations are lawyers — admins are seeded directly
    const user = await User.create({
      name,
      email,
      password,
      role: "lawyer",
      barNumber,
      specialisation,
      state,
      isApproved: false, // must be approved by admin regardless of email verification
      emailVerified: false,
      emailVerifyToken: verifyTokenHash,
      emailVerifyExpires: verifyExpires,
    });

    // Send verification email — non-blocking, doesn't gate admin approval.
    // The raw (unhashed) token goes in the link; only the hash lives in the DB.
    try {
      await sendEmailVerification({ name, email, token: verifyToken });
    } catch (err) {
      console.error("[REGISTER] verification email failed:", err);
      // don't fail registration if email fails
    }

    return NextResponse.json(
      {
        message:
          "Registration successful. Your account is pending admin approval. Please check your email to verify your address.",
        userId: user._id.toString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
