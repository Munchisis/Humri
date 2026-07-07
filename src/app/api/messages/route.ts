import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import User from "@/models/User";
import { sendLawyerSupportRequest, sendLawyerSupportConfirmation } from "@/lib/email-auth";

const CreateSchema = z.object({
  subject: z.string().min(3).max(120),
  body:    z.string().min(10).max(2000),
});

// ─── GET — admin fetches all messages, lawyer fetches their own ───────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const query: Record<string, unknown> =
    session.user.role === "admin"
      ? status ? { status } : {}         // admins see all
      : { from: session.user.id };        // lawyers see only their own

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ messages });
}

// ─── POST — lawyer sends a message to admin ───────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "lawyer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body   = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  const message = await Message.create({
    from:      session.user.id,
    fromName:  session.user.name ?? "A lawyer",
    fromEmail: session.user.email ?? "",
    subject:   parsed.data.subject,
    body:      parsed.data.body,
    status:    "unread",
  });

  // Email all admins and send confirmation to lawyer — non-blocking
  try {
    const admins = await User.find({ role: "admin" }).select("email").lean();
    await Promise.all([
      ...admins.map((a) =>
        sendLawyerSupportRequest({
          adminEmail:  a.email,
          lawyerName:  session.user.name ?? "A lawyer",
          lawyerEmail: session.user.email ?? "",
          subject:     parsed.data.subject,
          message:     parsed.data.body,
        })
      ),
      sendLawyerSupportConfirmation({
        lawyerName:  session.user.name ?? "there",
        lawyerEmail: session.user.email ?? "",
        subject:     parsed.data.subject,
      }),
    ]);
  } catch (err) {
    console.error("[MESSAGES email]", err);
  }

  return NextResponse.json(
    { message: "Message sent successfully.", id: message._id.toString() },
    { status: 201 }
  );
}
