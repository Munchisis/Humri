import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "HUMRI <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function header(subtitle = "Pro bono legal aid") {
  return `
    <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#E1F5EE;font-size:20px;margin:0">HUMRI</h1>
      <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">${subtitle}</p>
    </div>
  `;
}

function footer() {
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
    <p style="margin:0;font-size:12px;color:#9ca3af">
      This is an automated message from HUMRI. Please do not reply to this email.
    </p>
  `;
}

function wrap(content: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      ${header()}
      <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        ${content}
        ${footer()}
      </div>
    </div>
  `;
}

// ─── 1. Stale matter — reminder to lawyer ────────────────────────────────────

export async function sendStaleMatterReminder({
  lawyerName,
  lawyerEmail,
  referenceNumber,
  clientName,
  matterType,
  daysSinceAssigned,
}: {
  lawyerName: string;
  lawyerEmail: string;
  referenceNumber: string;
  clientName: string;
  matterType: string;
  daysSinceAssigned: number;
}) {
  await resend.emails.send({
    from: FROM,
    to: lawyerEmail,
    subject: `Action required: Matter ${referenceNumber} has been inactive for ${daysSinceAssigned} days`,
    html: wrap(`
      <p style="margin:0 0 16px">Dear <strong>${lawyerName}</strong>,</p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        This is a reminder that the following matter assigned to you has had no activity
        for <strong>${daysSinceAssigned} days</strong> and requires your attention.
      </p>
      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:20px;margin:24px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;width:120px">Reference</td><td style="font-weight:500;font-family:monospace">${referenceNumber}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Client</td><td style="font-weight:500">${clientName}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Type</td><td>${matterType}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Inactive for</td><td style="color:#D97706;font-weight:500">${daysSinceAssigned} days</td></tr>
        </table>
      </div>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        <strong>Please update the stage on this matter within 48 hours.</strong> If you are unable
        to continue, you can release the matter back to the open pool from your dashboard so another
        lawyer can assist this client.
      </p>
      <p style="margin:0 0 24px;color:#DC2626;font-size:13px;line-height:1.6">
        ⚠️ If no action is taken within 48 hours, this matter will be automatically released
        back to the open pool.
      </p>
      <a href="${APP_URL}/lawyer/matters"
        style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
        View matter →
      </a>
    `),
  });
}

// ─── 2. Matter auto-released — notify lawyer ─────────────────────────────────

export async function sendMatterAutoReleased({
  lawyerName,
  lawyerEmail,
  referenceNumber,
  matterType,
}: {
  lawyerName: string;
  lawyerEmail: string;
  referenceNumber: string;
  matterType: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: lawyerEmail,
    subject: `Matter ${referenceNumber} has been released back to the pool`,
    html: wrap(`
      <p style="margin:0 0 16px">Dear <strong>${lawyerName}</strong>,</p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        Due to 7 days of inactivity, matter <strong>${referenceNumber}</strong>
        (${matterType}) has been automatically released back to the open pool
        so another volunteer can assist the client.
      </p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        If this was in error or you would like to continue with this matter,
        please contact the admin team from your dashboard.
      </p>
      <a href="${APP_URL}/lawyer"
        style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
        Go to dashboard →
      </a>
    `),
  });
}

// ─── 3. Matter auto-released — notify client ─────────────────────────────────

export async function sendClientMatterReassigning({
  clientName,
  clientEmail,
  referenceNumber,
}: {
  clientName: string;
  clientEmail: string;
  referenceNumber: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Update on your matter ${referenceNumber}`,
    html: wrap(`
      <p style="margin:0 0 16px">Dear <strong>${clientName}</strong>,</p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        We are writing to let you know that your matter <strong>${referenceNumber}</strong>
        is being re-assigned to a new volunteer lawyer. This can happen when a lawyer
        becomes unavailable due to personal or professional reasons.
      </p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        Your matter remains active and will be assigned to a new lawyer shortly.
        You do not need to resubmit — everything you provided is still on file.
      </p>
      <a href="${APP_URL}/track?ref=${referenceNumber}"
        style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
        Track your matter →
      </a>
    `),
  });
}

// ─── 4. Lawyer releases matter voluntarily — notify admin ────────────────────

export async function sendAdminMatterReleased({
  adminEmail,
  lawyerName,
  referenceNumber,
  clientName,
  matterType,
  reason,
  isAutomatic,
}: {
  adminEmail: string;
  lawyerName: string;
  referenceNumber: string;
  clientName: string;
  matterType: string;
  reason: string;
  isAutomatic: boolean;
}) {
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `${isAutomatic ? "[Auto-release]" : "[Lawyer release]"} Matter ${referenceNumber} returned to pool`,
    html: wrap(`
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        ${
          isAutomatic
            ? `Matter <strong>${referenceNumber}</strong> has been <strong>automatically released</strong> back to the open pool after 7 days of inactivity by ${lawyerName}.`
            : `<strong>${lawyerName}</strong> has voluntarily released matter <strong>${referenceNumber}</strong> back to the open pool.`
        }
      </p>
      <div style="background:#F9FAFB;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;width:120px">Reference</td><td style="font-weight:500;font-family:monospace">${referenceNumber}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Client</td><td>${clientName}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Type</td><td>${matterType}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Released by</td><td>${lawyerName}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;vertical-align:top">Reason</td><td style="color:#374151">${reason}</td></tr>
        </table>
      </div>
      <a href="${APP_URL}/admin/matters"
        style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
        View in admin panel →
      </a>
    `),
  });
}

// ─── 5. Email verification reminder (day 7) ──────────────────────────────────

export async function sendEmailVerificationReminder({
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
    subject: "Reminder: Please verify your HUMRI email address",
    html: wrap(`
      <p style="margin:0 0 16px">Dear <strong>${name}</strong>,</p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        This is a friendly reminder that your HUMRI email address has not yet been verified.
        Without a verified email, you will not receive notifications about matters, client
        updates, or important platform announcements.
      </p>
      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:16px;margin:24px 0;color:#92400E;font-size:13px;line-height:1.6">
        ⚠️ Your account will be <strong>suspended in 7 days</strong> if your email is not verified.
        You can re-activate it at any time by verifying your email.
      </div>
      <a href="${verifyUrl}"
        style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
        Verify email address →
      </a>
    `),
  });
}

// ─── 6. Email verification suspension notice ─────────────────────────────────

export async function sendEmailVerificationSuspension({
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
    subject: "Your HUMRI account has been suspended — action required",
    html: wrap(`
      <p style="margin:0 0 16px">Dear <strong>${name}</strong>,</p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        Your HUMRI lawyer account has been <strong>suspended</strong> because your email
        address has not been verified after 14 days.
      </p>
      <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
        To reactivate your account, simply verify your email address using the link below.
        Your account will be restored immediately upon verification.
      </p>
      <a href="${verifyUrl}"
        style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
        Verify and reactivate account →
      </a>
    `),
  });
}
