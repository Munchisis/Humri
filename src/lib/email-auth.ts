import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "HUMRI <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

// Escapes values that came from user input before they're interpolated into
// an HTML email template. Without this, a name/subject/message containing
// "<img src=x onerror=...>" or a spoofed link renders as live HTML in the
// recipient's inbox rather than as inert text.
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// The Resend Node SDK does NOT throw on API-level errors (unverified
// sender, invalid recipient, rate limits, etc.) — it resolves with
// { data, error } either way. Every send goes through this helper so a
// rejected send actually throws, which lets every call site's existing
// try/catch blocks do their job.
async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    throw new Error(
      `Resend rejected the email (${error.name ?? "unknown"}): ${error.message ?? "no message"}`,
    );
  }
  return data;
}

// ─── Matter submitted (to client) ────────────────────────────────────────────
export async function sendMatterSubmitted({
  clientName,
  clientEmail,
  referenceNumber,
  matterType,
}: {
  clientName: string;
  clientEmail: string;
  referenceNumber: string;
  matterType: string;
}) {
  const safeName = escapeHtml(clientName);
  await send({
    from: FROM,
    to: clientEmail,
    subject: `Your matter has been received ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Thank you for submitting your legal matter to HumRi. We have received your submission
            and our team will review it shortly.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:24px 0;text-align:center">
            <p style="margin:0 0 4px;font-size:12px;color:#15803D;text-transform:uppercase;letter-spacing:.05em">Your reference number</p>
            <p style="margin:0;font-size:28px;font-weight:700;font-family:monospace;color:#085041;letter-spacing:.1em">${referenceNumber}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280">Save this, you will need it to track your matter</p>
          </div>
          <p style="margin:0 0 8px;color:#4b5563;line-height:1.6"><strong>Matter type:</strong> ${matterType}</p>
          <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
            A qualified volunteer lawyer will be assigned to your matter within 72 hours.
            You will receive another email once a lawyer has been assigned.
          </p>
          <a href="${APP_URL}/track?ref=${referenceNumber}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Track your matter →
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from Humri. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Lawyer assigned (to client) ─────────────────────────────────────────────
export async function sendLawyerAssigned({
  clientName,
  clientEmail,
  referenceNumber,
  lawyerName,
  lawyerSpecialisation,
}: {
  clientName: string;
  clientEmail: string;
  referenceNumber: string;
  lawyerName: string;
  lawyerSpecialisation: string;
}) {
  const safeClientName = escapeHtml(clientName);
  const safeLawyerName = escapeHtml(lawyerName);
  const safeSpecialisation = escapeHtml(lawyerSpecialisation);
  await send({
    from: FROM,
    to: clientEmail,
    subject: `A lawyer has been assigned to your matter ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeClientName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Good news a volunteer lawyer has been assigned to your matter
            <strong>${referenceNumber}</strong> and will be in touch with you shortly.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:24px 0">
            <p style="margin:0 0 8px;font-size:12px;color:#15803D;text-transform:uppercase;letter-spacing:.05em">Your assigned lawyer</p>
            <p style="margin:0;font-size:18px;font-weight:600;color:#085041">${safeLawyerName}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280">${safeSpecialisation}</p>
          </div>
          <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
            Your lawyer will contact you directly to arrange a consultation.
            In the meantime you can track your matter status below.
          </p>
          <a href="${APP_URL}/track?ref=${referenceNumber}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Track your matter →
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HumRi. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Matter stage updated (to client) ────────────────────────────────────────
export async function sendMatterStageUpdated({
  clientName,
  clientEmail,
  referenceNumber,
  stageLabel,
}: {
  clientName: string;
  clientEmail: string;
  referenceNumber: string;
  stageLabel: string;
}) {
  const safeName = escapeHtml(clientName);
  await send({
    from: FROM,
    to: clientEmail,
    subject: `Update on your matter ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            There's an update on your matter <strong>${referenceNumber}</strong>.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:24px 0;text-align:center">
            <p style="margin:0 0 4px;font-size:12px;color:#15803D;text-transform:uppercase;letter-spacing:.05em">Current stage</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#085041">${stageLabel}</p>
          </div>
          <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
            You can track full progress on your matter at any time using the link below.
          </p>
          <a href="${APP_URL}/track?ref=${referenceNumber}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Track your matter →
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HumRi. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Matter completed (to client) ────────────────────────────────────────────
export async function sendMatterCompleted({
  clientName,
  clientEmail,
  referenceNumber,
  lawyerName,
}: {
  clientName: string;
  clientEmail: string;
  referenceNumber: string;
  lawyerName: string;
}) {
  const safeClientName = escapeHtml(clientName);
  const safeLawyerName = escapeHtml(lawyerName);
  await send({
    from: FROM,
    to: clientEmail,
    subject: `Your matter has been resolved ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeClientName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Your legal matter <strong>${referenceNumber}</strong> has been marked as resolved
            by <strong>${safeLawyerName}</strong>.
          </p>
          <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
            We hope HumRi was able to help you. If you have a new legal matter in the future,
            do not hesitate to submit again, our volunteer lawyers are always here to help.
          </p>
          <a href="${APP_URL}/submit"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Submit a new matter
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HumRi. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── New matter notification (to admin) ──────────────────────────────────────
export async function sendAdminNewMatter({
  adminEmail,
  referenceNumber,
  clientName,
  matterType,
  urgency,
}: {
  adminEmail: string;
  referenceNumber: string;
  clientName: string;
  matterType: string;
  urgency: string;
}) {
  const safeName = escapeHtml(clientName);
  await send({
    from: FROM,
    to: adminEmail,
    subject: `New matter submitted ${referenceNumber} ${urgency === "critical" ? "⚡ CRITICAL" : urgency === "urgent" ? "🕐 Urgent" : ""}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi Admin</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">A new matter has been submitted and requires assignment.</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px">Reference</td><td style="padding:8px 0;font-weight:500;font-family:monospace">${referenceNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Client</td><td style="padding:8px 0;font-weight:500">${safeName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Matter type</td><td style="padding:8px 0">${matterType}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Urgency</td><td style="padding:8px 0;font-weight:500;color:${urgency === "critical" ? "#dc2626" : urgency === "urgent" ? "#d97706" : "#16a34a"}">${urgency.charAt(0).toUpperCase() + urgency.slice(1)}</td></tr>
          </table>
          <a href="${APP_URL}/admin/matters"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            View in admin panel →
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Lawyer approved notification (to lawyer) ─────────────────────────────────
export async function sendLawyerApproved({
  lawyerName,
  lawyerEmail,
}: {
  lawyerName: string;
  lawyerEmail: string;
}) {
  const safeName = escapeHtml(lawyerName);
  await send({
    from: FROM,
    to: lawyerEmail,
    subject: "Your HUMRI account has been approved",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>

        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin-top:0 0 16px;color:#4b5563;line-height:1.6">
            Welcome to HUMRI. Your volunteer lawyer account has been approved and
            you can now sign in to browse and accept matters from clients.
          </p>

          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Here’s a quick guide to get you started:
          </p>

          <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;line-height:1.6">
            <li>Sign in to your account using the button below.</li>
            <li>Browse available matters and accept those you can assist with.</li>
            <li>Open a matched matter to review the case details and client situation.</li>
            <li>Communicate with clients and provide legal guidance as needed.</li>
            <li>Update the matter's status as you work it (In progress / Awaiting client / Resolved).</li>
            <li>Mark the matter Resolved once the case is closed.</li>
            <li>Reach out via Support on your dashboard if you hit any issues.</li>
          </ul>

          <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
           That's it, you're ready to start taking on matters.
          </p>

          <a href="${APP_URL}/auth/login"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Sign in to your account →
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            If you have any questions or need assistance, please contact the HUMRI support team.
          </p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Thank you for volunteering your time and expertise to help those in need.
          </p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Best regards,<br />
            The HUMRI Team
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

export async function sendLawyerSuspended({
  lawyerName,
  lawyerEmail,
}: {
  lawyerName: string;
  lawyerEmail: string;
}) {
  const safeName = escapeHtml(lawyerName);
  await send({
    from: FROM,
    to: lawyerEmail,
    subject: "Your HUMRI account has been suspended",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#991b1b;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fee2e2;font-size:20px;margin:0">HUMRI</h1>
          <p style="color:#fecaca;font-size:12px;margin:4px 0 0">Account update</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Your HUMRI lawyer account has been suspended by the platform administration.
            You are no longer able to sign in to the lawyer portal until your account is reviewed and re-approved.
          </p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            If you believe this action is in error or if you need more information, please contact the HUMRI support team.
          </p>
          <a href="${APP_URL}/auth/login"
            style="display:inline-block;background:#991b1b;color:#fee2e2;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            View login page →
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            This is an automated message from HUMRI. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
}

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
  const safeName = escapeHtml(name);

  await send({
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
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            We received a request to reset your HUMRI account password. Click the button below to
            choose a new password. This link will expire in 1 hour.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Reset your password →
          </a>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;line-height:1.6">
            If you didn't request this, you can safely ignore this email, your password will not be changed.
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
  const safeName = escapeHtml(name);

  await send({
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
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Thank you for applying to volunteer with HUMRI. Please verify your email address so we
            can reach you with matter notifications and updates.
          </p>
          <a href="${verifyUrl}"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Verify email address →
          </a>
          <p style="margin:24px 0 0;color:#4b5563;line-height:1.6">
            Your application is still being reviewed by our admin team regardless of email verification,
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
  const safeLawyerName = escapeHtml(lawyerName);
  const safeLawyerEmail = escapeHtml(lawyerEmail);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  await send({
    from: FROM,
    to: adminEmail,
    replyTo: lawyerEmail,
    subject: `[Support] ${safeSubject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI Admin</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Lawyer support request</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px">From</td><td style="padding:6px 0;font-weight:500">${safeLawyerName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0">${safeLawyerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Subject</td><td style="padding:6px 0;font-weight:500">${safeSubject}</td></tr>
          </table>
          <div style="background:#F9FAFB;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;line-height:1.6;white-space:pre-wrap">${safeMessage}</div>
          <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">
            Reply directly to this email to respond to ${safeLawyerName}.
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
  const safeLawyerName = escapeHtml(lawyerName);
  const safeSubject = escapeHtml(subject);

  await send({
    from: FROM,
    to: lawyerEmail,
    subject: "We received your message, HUMRI Support",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${safeLawyerName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            We've received your message regarding "<strong>${safeSubject}</strong>" and our admin team
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
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  await send({
    from: FROM,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact form] ${safeSubject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI Admin</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">New contact form submission</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px">From</td><td style="padding:6px 0;font-weight:500">${safeName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0">${safeEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Subject</td><td style="padding:6px 0;font-weight:500">${safeSubject}</td></tr>
          </table>
          <div style="background:#F9FAFB;border:1px solid #e5e7eb;border-radius:8px;padding:16px;color:#374151;line-height:1.6;white-space:pre-wrap">${safeMessage}</div>
          <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">
            Reply directly to this email to respond to ${safeName}.
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
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);

  await send({
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
          <p style="margin:0 0 16px">Dear <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            We've received your message regarding "<strong>${safeSubject}</strong>" and will get back to
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
