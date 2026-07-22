import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "HUMRI <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordReset({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your HUMRI password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${name}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            We received a request to reset your HUMRI account password. Click the button below to
            choose a new password. This link will expire in 1 hour.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Reset your password →
          </a>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6">
            If you didn't request this, you can safely ignore this email — your password will not be changed.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HUMRI. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Email verification ──────────────────────────────────────────────────────

export async function sendEmailVerification({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your HUMRI email address",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${name}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Thank you for applying to volunteer with HUMRI. Please verify your email address so we
            can reach you with matter notifications and updates.
          </p>
          <a href="${verifyUrl}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Verify email address →
          </a>
          <p style="margin:24px 0 0;color:#4b5563;line-height:1.6">
            Your application is still being reviewed by our admin team regardless of email verification —
            this step simply confirms we can reach you.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HUMRI. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Lawyer support request (to admin) ────────────────────────────────────────

export async function sendLawyerSupportRequest({
  adminEmail,
  lawyerName,
  lawyerEmail,
  subject,
  message,
}: {
  adminEmail: string;
  lawyerName: string;
  lawyerEmail: string;
  subject: string;
  message: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    replyTo: lawyerEmail,
    subject: `[Support] ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI Admin</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Lawyer support request</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px">From</td><td style="padding:6px 0;font-weight:500">${lawyerName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0">${lawyerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Subject</td><td style="padding:6px 0;font-weight:500">${subject}</td></tr>
          </table>
          <div style="background:#F9FAFB;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;line-height:1.6;white-space:pre-wrap">${message}</div>
          <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">
            Reply directly to this email to respond to ${lawyerName}.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Confirmation to lawyer that their message was sent ──────────────────────

export async function sendLawyerSupportConfirmation({
  lawyerName,
  lawyerEmail,
  subject,
}: {
  lawyerName: string;
  lawyerEmail: string;
  subject: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: lawyerEmail,
    subject: "We received your message — HUMRI Support",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${lawyerName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            We've received your message regarding "<strong>${subject}</strong>" and our admin team
            will respond as soon as possible, usually within 1-2 business days.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HUMRI. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Contact form submission (to admin) ───────────────────────────────────────

export async function sendContactFormNotification({
  adminEmail,
  name,
  email,
  subject,
  message,
}: {
  adminEmail: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact form] ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI Admin</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">New contact form submission</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px">From</td><td style="padding:6px 0;font-weight:500">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Subject</td><td style="padding:6px 0;font-weight:500">${subject}</td></tr>
          </table>
          <div style="background:#F9FAFB;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;line-height:1.6;white-space:pre-wrap">${message}</div>
          <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Confirmation to the person who submitted the contact form ───────────────

export async function sendContactFormConfirmation({
  name,
  email,
  subject,
}: {
  name: string;
  email: string;
  subject: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "We received your message — HUMRI",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Access to justice</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${name}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            We've received your message regarding "<strong>${subject}</strong>" and will get back to
            you as soon as we can.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HUMRI. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}
