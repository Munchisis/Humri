import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "HUMRI <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

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
  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Your matter has been received — ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${clientName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Thank you for submitting your legal matter to HumRi. We have received your submission
            and our team will review it shortly.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:24px 0;text-align:center">
            <p style="margin:0 0 4px;font-size:12px;color:#15803D;text-transform:uppercase;letter-spacing:.05em">Your reference number</p>
            <p style="margin:0;font-size:28px;font-weight:700;font-family:monospace;color:#085041;letter-spacing:.1em">${referenceNumber}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280">Save this — you will need it to track your matter</p>
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
  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `A lawyer has been assigned to your matter — ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${clientName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Good news — a volunteer lawyer has been assigned to your matter
            <strong>${referenceNumber}</strong> and will be in touch with you shortly.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:20px;margin:24px 0">
            <p style="margin:0 0 8px;font-size:12px;color:#15803D;text-transform:uppercase;letter-spacing:.05em">Your assigned lawyer</p>
            <p style="margin:0;font-size:18px;font-weight:600;color:#085041">${lawyerName}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280">${lawyerSpecialisation}</p>
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
  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Your matter has been resolved — ${referenceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${clientName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Your legal matter <strong>${referenceNumber}</strong> has been marked as resolved
            by <strong>${lawyerName}</strong>.
          </p>
          <p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
            We hope HumRi was able to help you. If you have a new legal matter in the future,
            do not hesitate to submit again — our volunteer lawyers are always here to help.
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
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New matter submitted — ${referenceNumber} ${urgency === "critical" ? "⚡ CRITICAL" : urgency === "urgent" ? "🕐 Urgent" : ""}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi Admin</h1>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">A new matter has been submitted and requires assignment.</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px">Reference</td><td style="padding:8px 0;font-weight:500;font-family:monospace">${referenceNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Client</td><td style="padding:8px 0;font-weight:500">${clientName}</td></tr>
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
  await resend.emails.send({
    from: FROM,
    to: lawyerEmail,
    subject: "Your HumRi account has been approved",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#085041;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#E1F5EE;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#9FE1CB;font-size:12px;margin:4px 0 0">Pro bono legal aid</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${lawyerName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Welcome to HumRi. Your volunteer lawyer account has been approved and
            you can now sign in to browse and accept matters from clients,here's how to get started..
          </p>
          ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;line-height:1.6">
            <li>Sign in to your account using the button below.</li>
            <li>Browse available matters and accept those you can assist with.</li>
            <li>Open a matched matter to review the case details and client situation.</li>
            <li>Communicate with clients and provide legal guidance as needed.</li>
            <li>Update the matter's status as you work it (In progress / Awaiting client / Resolved).</li>
            <li>Mark the matter Resolved once the case is closed.</li>
            <li>Reach out via Support on your dashboard if you hit any issues.</li>
          </ul>
          p style="margin:0 0 24px;color:#4b5563;line-height:1.6">
           That's it — you're ready to start taking on matters.
          </p>
          <a href="${APP_URL}/auth/login"
            style="display:inline-block;background:#085041;color:#E1F5EE;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            Sign in to your account →
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

export async function sendLawyerSuspended({
  lawyerName,
  lawyerEmail,
}: {
  lawyerName: string;
  lawyerEmail: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: lawyerEmail,
    subject: "Your HumRi account has been suspended",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#991b1b;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fee2e2;font-size:20px;margin:0">HumRi</h1>
          <p style="color:#fecaca;font-size:12px;margin:4px 0 0">Account update</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 16px">Dear <strong>${lawyerName}</strong>,</p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            Your HumRi lawyer account has been suspended by the platform administration.
            You are no longer able to sign in to the lawyer portal until your account is reviewed and re-approved.
          </p>
          <p style="margin:0 0 16px;color:#4b5563;line-height:1.6">
            If you believe this action is in error or if you need more information, please contact the HumRi support team.
          </p>
          <a href="${APP_URL}/auth/login"
            style="display:inline-block;background:#991b1b;color:#fee2e2;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">
            View login page →
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
