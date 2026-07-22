import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import ContactSubmission from "@/models/ContactSubmission";
import {
  sendContactFormNotification,
  sendContactFormConfirmation,
} from "@/lib/email-auth";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(200),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  subject: z.string().trim().min(3, "Please enter a subject").max(300),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
  // Honeypot — real users never see or fill this field. Optional/defaulted
  // so older clients without it don't fail validation.
  company: z.string().optional().default(""),
  // Timestamp (ms) captured when the form loaded client-side. Used to reject
  // submissions that arrive faster than a human could plausibly type a
  // message — a common bot tell.
  formLoadedAt: z.number().optional(),
  // Cloudflare Turnstile response token. Only required when Turnstile is
  // actually configured (TURNSTILE_SECRET_KEY set) — see verifyTurnstile().
  turnstileToken: z.string().optional().default(""),
});

const MIN_HUMAN_SUBMIT_MS = 1500;

async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Turnstile not configured on this deployment — nothing to verify against,
  // so don't block submissions (this mirrors the client, which only renders
  // the widget when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set).
  if (!secret) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("[CONTACT] Turnstile verification request failed:", err);
    // Fail closed — if we can't reach Cloudflare to verify, don't let the
    // submission through unverified.
    return false;
  }
}

// Same convention as getAdminEmails() in lib/auth.ts — reads the
// comma-separated ADMIN_EMAILS env var. Notifications go to the first
// address in that list; set CONTACT_NOTIFICATION_EMAIL to route them
// elsewhere instead without affecting the admin-login whitelist.
function getContactNotificationEmail(): string | null {
  if (process.env.CONTACT_NOTIFICATION_EMAIL) {
    return process.env.CONTACT_NOTIFICATION_EMAIL.trim().toLowerCase();
  }
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails[0] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      subject,
      message,
      company,
      formLoadedAt,
      turnstileToken,
    } = parsed.data;

    // Spam signals: honeypot filled, or submitted faster than a human could
    // plausibly have read the form and typed a message. Respond with the
    // same success shape a real submission gets — telling a bot it was
    // caught just teaches it to adapt, whereas a fake success wastes its
    // time for no gain.
    const honeypotTripped = company.trim().length > 0;
    const submittedTooFast =
      typeof formLoadedAt === "number" &&
      Date.now() - formLoadedAt < MIN_HUMAN_SUBMIT_MS;

    if (honeypotTripped || submittedTooFast) {
      console.warn("[CONTACT] Likely spam submission blocked", {
        honeypotTripped,
        submittedTooFast,
      });
      return NextResponse.json(
        {
          message:
            "Thanks — your message has been sent. We'll get back to you soon.",
          id: null,
        },
        { status: 201 },
      );
    }

    // Unlike the honeypot/timing checks above, a Turnstile failure gets a
    // real error back to the client — the widget is visible to legitimate
    // users, so a failure here is either a bot (already effectively opaque
    // to them) or a genuine hiccup (expired token, network issue) that a
    // human should be able to see and retry.
    const remoteIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const turnstileOk = await verifyTurnstile(turnstileToken, remoteIp);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }

    await connectDB();

    const submission = await ContactSubmission.create({
      name,
      email,
      subject,
      message,
    });

    // The submission is persisted regardless of whether either email below
    // succeeds — a Resend hiccup should never mean a lost message.
    const adminEmail = getContactNotificationEmail();
    if (adminEmail) {
      try {
        await sendContactFormNotification({
          adminEmail,
          name,
          email,
          subject,
          message,
        });
      } catch (err) {
        console.error("[CONTACT] admin notification email failed:", err);
      }
    } else {
      console.error(
        "[CONTACT] No admin notification email configured — set ADMIN_EMAILS or CONTACT_NOTIFICATION_EMAIL.",
      );
    }

    try {
      await sendContactFormConfirmation({ name, email, subject });
    } catch (err) {
      console.error("[CONTACT] sender confirmation email failed:", err);
    }

    return NextResponse.json(
      {
        message:
          "Thanks — your message has been sent. We'll get back to you soon.",
        id: submission._id.toString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[CONTACT]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
