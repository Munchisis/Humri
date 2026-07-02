import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const RegisterSchema = z.object({
  name:           z.string().min(2, "Name must be at least 2 characters"),
  email:          z.string().email("Please enter a valid email address"),
  password:       z.string().min(8, "Password must be at least 8 characters"),
  barNumber:      z.string().min(3, "Please enter your SCN number"),
  specialisation: z.string().min(2, "Please enter your area of specialisation"),
  state:          z.string().min(2, "Please enter your state"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, barNumber, specialisation, state } =
      parsed.data;

    await connectDB();

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // All self-registrations are lawyers — admins are seeded directly
    const user = await User.create({
      name,
      email,
      password,
      role:           "lawyer",
      barNumber,
      specialisation,
      state,
      isApproved:     false,   // must be approved by admin
    });

    return NextResponse.json(
      {
        message:
          "Registration successful. Your account is pending admin approval. You will receive an email once approved.",
        userId: user._id.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
