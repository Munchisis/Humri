import { LegalLayout, LegalSection, LegalP, LegalList, LegalHighlight } from "@/components/shared/LegalLayout";

export const metadata = {
  title: "Privacy Policy — HUMRI",
  description: "How HUMRI collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="29 June 2026">

      <LegalHighlight>
        HUMRI is a pro bono legal aid platform. We are committed to protecting the privacy and
        confidentiality of all persons who use our service, particularly clients sharing sensitive
        legal information. Please read this policy carefully before submitting a matter.
      </LegalHighlight>

      <LegalSection title="1. Who We Are">
        <LegalP>
          HUMRI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a pro bono legal aid platform operating in Nigeria,
          connecting individuals facing legal challenges with qualified volunteer lawyers at no
          cost. Our platform is accessible at humri.vercel.app.
        </LegalP>
        <LegalP>
          For questions about this Privacy Policy, contact us at: <strong>privacy@humri.ng</strong>
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <LegalP><strong>From clients (matter submission):</strong></LegalP>
        <LegalList items={[
          "Full name, email address, and phone number",
          "State of residence and preferred language",
          "Description of your legal matter, including facts, parties involved, and desired outcome",
          "Matter type and urgency level",
          "Reference number assigned to your submission",
        ]} />
        <LegalP><strong>From volunteer lawyers (registration):</strong></LegalP>
        <LegalList items={[
          "Full name, email address, and password (hashed — never stored in plain text)",
          "Nigerian Bar Association (NBA) bar number",
          "Area of legal specialisation and state of practice",
          "Matter activity statistics (active, completed, pro bono hours)",
        ]} />
        <LegalP><strong>Automatically collected:</strong></LegalP>
        <LegalList items={[
          "Authentication tokens (JWT) stored in secure session cookies",
          "Server logs including IP addresses, request timestamps, and HTTP status codes",
          "Browser type and device information via standard web server logs",
        ]} />
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <LegalP>We use the information we collect for the following purposes:</LegalP>
        <LegalList items={[
          "To receive, review, and assign legal matters to appropriate volunteer lawyers",
          "To enable clients to track the status of their submitted matters",
          "To send email notifications about matter submission, lawyer assignment, and resolution",
          "To verify the credentials of volunteer lawyers before granting platform access",
          "To maintain platform security and prevent fraudulent submissions",
          "To generate anonymised statistics about platform usage and impact",
          "To comply with applicable Nigerian law and regulatory requirements",
        ]} />
      </LegalSection>

      <LegalSection title="4. Confidentiality of Legal Matters">
        <LegalHighlight>
          Information you share about your legal matter is treated with the strictest confidentiality.
          It is only accessible to HUMRI administrators and the lawyer assigned to your specific matter.
          No other lawyer, staff member, or third party can view the details of your submission.
        </LegalHighlight>
        <LegalP>
          HUMRI operates in a manner consistent with the principles of solicitor-client privilege under
          Nigerian law. While HUMRI itself is a technology platform and not a law firm, the volunteer
          lawyers on our platform are bound by the Rules of Professional Conduct for Legal Practitioners
          in Nigeria and their duties of confidentiality to clients.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Legal Basis for Processing">
        <LegalP>
          We process your personal data on the following legal bases under applicable Nigerian data
          protection law (including the Nigeria Data Protection Act 2023):
        </LegalP>
        <LegalList items={[
          "Consent — you voluntarily submit your information to receive legal assistance",
          "Legitimate interests — operating a platform that provides access to justice",
          "Legal obligation — where we are required by law to retain or disclose information",
          "Vital interests — where necessary to protect a person's safety or rights",
        ]} />
      </LegalSection>

      <LegalSection title="6. Data Sharing">
        <LegalP>We do not sell, rent, or trade your personal information. We share data only in the following limited circumstances:</LegalP>
        <LegalList items={[
          "With the volunteer lawyer assigned to your matter — limited to the information necessary to handle your case",
          "With HUMRI administrators for platform management and quality assurance",
          "With our service providers (MongoDB Atlas for database hosting, Vercel for platform hosting, Resend for email delivery) — under strict data processing agreements",
          "With law enforcement or regulatory authorities when required by Nigerian law or court order",
          "With your explicit consent for any other purpose not listed here",
        ]} />
      </LegalSection>

      <LegalSection title="7. Data Retention">
        <LegalList items={[
          "Client matter data is retained for 7 years from the date of submission, consistent with standard legal record-keeping practice in Nigeria",
          "Lawyer account data is retained for the duration of the account and 2 years thereafter",
          "Server logs are retained for 90 days",
          "You may request deletion of your data — see Section 9 for your rights",
        ]} />
      </LegalSection>

      <LegalSection title="8. Data Security">
        <LegalP>
          We implement appropriate technical and organisational measures to protect your personal
          information, including:
        </LegalP>
        <LegalList items={[
          "All data is transmitted over HTTPS/TLS encrypted connections",
          "Passwords are hashed using bcrypt with a minimum cost factor of 12",
          "Authentication uses JSON Web Tokens (JWT) with secure, httpOnly cookies",
          "Database access is restricted by IP allowlist and credential authentication",
          "Platform infrastructure is hosted on SOC 2 compliant cloud providers",
          "Access to client matter data is role-restricted within the platform",
        ]} />
        <LegalP>
          No system is completely secure. In the event of a data breach that may affect your rights,
          we will notify affected individuals and the relevant Nigerian authority within 72 hours of
          becoming aware of the breach.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Your Rights">
        <LegalP>
          Under the Nigeria Data Protection Act 2023 and other applicable law, you have the following rights:
        </LegalP>
        <LegalList items={[
          "Right of access — to obtain a copy of the personal data we hold about you",
          "Right to rectification — to correct inaccurate or incomplete data",
          "Right to erasure — to request deletion of your data (subject to legal retention obligations)",
          "Right to restriction — to limit how we process your data in certain circumstances",
          "Right to data portability — to receive your data in a structured, machine-readable format",
          "Right to object — to object to processing based on legitimate interests",
          "Right to withdraw consent — where processing is based on your consent",
        ]} />
        <LegalP>
          To exercise any of these rights, email us at <strong>privacy@humri.ng</strong> with your
          full name and reference number (if applicable). We will respond within 30 days.
        </LegalP>
      </LegalSection>

      <LegalSection title="10. Children's Privacy">
        <LegalP>
          HUMRI is not directed at children under 18 years of age. We do not knowingly collect
          personal information from minors. If you believe a minor has submitted information to
          our platform, please contact us immediately at privacy@humri.ng and we will take prompt
          action to remove the data.
        </LegalP>
      </LegalSection>

      <LegalSection title="11. Changes to This Policy">
        <LegalP>
          We may update this Privacy Policy from time to time. When we do, we will update the
          &quot;Last updated&quot; date at the top of this page. For significant changes, we will notify
          registered lawyers by email. Continued use of the platform after changes constitutes
          acceptance of the updated policy.
        </LegalP>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <LegalP>
          For any privacy-related questions, concerns, or to exercise your rights, please contact:
        </LegalP>
        <LegalP>
          <strong>HUMRI Data Privacy Officer</strong><br />
          Email: privacy@humri.ng<br />
          Platform: humri.vercel.app
        </LegalP>
        <LegalP>
          You also have the right to lodge a complaint with the Nigeria Data Protection Commission
          (NDPC) at <strong>ndpc.gov.ng</strong> if you believe your data protection rights have
          been violated.
        </LegalP>
      </LegalSection>

    </LegalLayout>
  );
}
