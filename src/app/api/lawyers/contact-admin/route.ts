import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendLawyerSupportRequest, sendLawyerSupportConfirmation } from "@/lib/email-auth";

const Schema = z.object({
  subject: z.string().min(3, "Please add a short subject").max(120),
  message: z.string().min(10, "Please add a bit more detail").max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body   = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { subject, message } = parsed.data;

  await connectDB();
  const admins = await User.find({ role: "admin" }).select("email").lean();

  if (admins.length === 0) {
    return NextResponse.json({ error: "No admin available to receive this message." }, { status: 500 });
  }

  try {
    await Promise.all(
      admins.map((a) =>
        sendLawyerSupportRequest({
          adminEmail:  a.email,
          lawyerName:  session.user.name ?? "A lawyer",
          lawyerEmail: session.user.email ?? "",
          subject,
          message,
        })
      )
    );

    await sendLawyerSupportConfirmation({
      lawyerName:  session.user.name ?? "there",
      lawyerEmail: session.user.email ?? "",
      subject,
    });
  } catch (err) {
    console.error("[CONTACT_ADMIN]", err);
    return NextResponse.json({ error: "Failed to send your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ message: "Your message has been sent to the admin team." });
}
