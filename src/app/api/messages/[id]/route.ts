import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { Resend } from "resend";

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.EMAIL_FROM ?? "HUMRI <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const ReplySchema = z.object({
  reply:  z.string().min(5, "Reply must be at least 5 characters").max(2000),
  status: z.enum(["read", "resolved"]).optional(),
});

// ─── PATCH — admin marks read, replies, or resolves ──────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  const message = await Message.findById(params.id);
  if (!message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  // Update status
  if (parsed.data.status) {
    message.status = parsed.data.status;
  }

  // Save reply
  if (parsed.data.reply) {
    message.adminReply = parsed.data.reply;
    message.repliedAt  = new Date();
    message.repliedBy  = session.user.id as unknown as typeof message.repliedBy;
    message.status     = "resolved";

    // Email the reply to the lawyer
    try {
      await resend.emails.send({
        from:    FROM,
        to:      message.fromEmail,
        subject: `Re: ${message.subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
              <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Admin reply</p>
            </div>
            <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="margin:0 0 16px">Dear <strong>${message.fromName}</strong>,</p>
              <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
                The HUMRI admin team has replied to your message:
                <strong>${message.subject}</strong>
              </p>
              <div style="background:#F9FAFB;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0;color:#374151;line-height:1.6;white-space:pre-wrap">${parsed.data.reply}</div>
              <a href="${APP_URL}/lawyer/support"
                style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
                View in dashboard →
              </a>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
              <p style="margin:0;font-size:12px;color:#9ca3af">
                This is a message from the HUMRI admin team.
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[REPLY email]", err);
    }
  }

  await message.save();

  return NextResponse.json({
    message: "Message updated successfully.",
  });
}

// ─── DELETE — admin deletes a resolved message ────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  await Message.findByIdAndDelete(params.id);

  return NextResponse.json({ message: "Message deleted." });
}
