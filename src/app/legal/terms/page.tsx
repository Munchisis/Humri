import { LegalLayout, LegalSection, LegalP, LegalList, LegalHighlight } from "@/components/shared/LegalLayout";

export const metadata = {
  title: "Terms of Use — HUMRI",
  description: "Terms and conditions governing your use of the HUMRI pro bono legal aid platform.",
};

export default function TermsOfUsePage() {
  return (
    <LegalLayout title="Terms of Use" lastUpdated="29 June 2026">

      <LegalHighlight>
        By accessing or using HUMRI, you agree to be bound by these Terms of Use. If you do not
        agree with any part of these terms, you must not use the platform. Please read them carefully.
      </LegalHighlight>

      <LegalSection title="1. About HUMRI">
        <LegalP>
          HUMRI is a digital platform that facilitates access to pro bono (free) legal assistance
          by connecting individuals facing legal challenges (&quot;clients&quot;) with qualified volunteer
          lawyers (&quot;lawyers&quot;) in Nigeria. HUMRI itself is a technology platform and is not a law
          firm and does not provide legal advice.
        </LegalP>
        <LegalP>
          The legal services provided through HUMRI are provided solely by the individual volunteer
          lawyers, who are independent professionals regulated by the Nigerian Bar Association (NBA)
          and the Legal Practitioners Act (Cap L11, LFN 2004).
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <LegalP>You may use HUMRI if:</LegalP>
        <LegalList items={[
          "You are at least 18 years of age, or a legal guardian acting on behalf of a minor",
          "You are located in or have a legal matter arising in Nigeria",
          "You have the legal capacity to enter into a binding agreement",
          "You are not prohibited from using the platform under applicable law",
        ]} />
        <LegalP>
          Volunteer lawyers must additionally hold a valid licence to practise law in Nigeria,
          be in good standing with the Nigerian Bar Association, and receive approval from a
          HUMRI administrator before accessing the lawyer portal.
        </LegalP>
      </LegalSection>

      <LegalSection title="3. Nature of the Service">
        <LegalHighlight>
          IMPORTANT: HUMRI is a facilitation platform only. Submitting a matter on HUMRI does not
          guarantee that a lawyer will be assigned or that legal representation will be provided.
          Acceptance of matters is at the discretion of volunteer lawyers and the HUMRI administration.
        </LegalHighlight>
        <LegalP>
          The legal assistance provided through HUMRI is entirely pro bono — no fees are charged to
          clients at any stage. Any lawyer who solicits payment from a client through this platform
          should be reported to us immediately at support@humri.ng.
        </LegalP>
        <LegalP>
          HUMRI does not guarantee any specific legal outcome. The outcome of your matter depends
          on the facts, applicable law, and the professional judgment of your assigned lawyer.
        </LegalP>
      </LegalSection>

      <LegalSection title="4. Client Obligations">
        <LegalP>As a client using HUMRI, you agree to:</LegalP>
        <LegalList items={[
          "Provide accurate, complete, and truthful information when submitting your matter",
          "Not submit false, misleading, or fraudulent legal matters",
          "Cooperate with your assigned lawyer and respond to their communications in a timely manner",
          "Not use the platform to submit matters that are frivolous, vexatious, or designed to harass another person",
          "Not submit the same matter multiple times simultaneously",
          "Notify HUMRI if your matter is resolved or withdrawn so the lawyer can be freed for other clients",
          "Not share your reference number with persons who are not parties to your matter",
        ]} />
      </LegalSection>

      <LegalSection title="5. Lawyer Obligations">
        <LegalP>Volunteer lawyers registered on HUMRI agree to:</LegalP>
        <LegalList items={[
          "Provide accurate information during registration, including a valid NBA bar number",
          "Handle accepted matters with the same standard of care as paid instructions",
          "Comply with the Rules of Professional Conduct for Legal Practitioners in Nigeria",
          "Maintain client confidentiality in accordance with their professional obligations",
          "Not charge clients any fees for services rendered through HUMRI",
          "Update matter stages and status promptly and accurately",
          "Notify HUMRI administration if they are unable to continue handling an accepted matter",
          "Not use client information obtained through HUMRI for any purpose outside the scope of the matter",
        ]} />
      </LegalSection>

      <LegalSection title="6. Prohibited Conduct">
        <LegalP>All users are prohibited from:</LegalP>
        <LegalList items={[
          "Using the platform for any unlawful purpose or in violation of Nigerian law",
          "Attempting to gain unauthorised access to other users' accounts or data",
          "Submitting malicious code, viruses, or harmful content to the platform",
          "Scraping, crawling, or extracting data from the platform without authorisation",
          "Impersonating another person or entity",
          "Using the platform to facilitate money laundering, fraud, or criminal activity",
          "Harassing, threatening, or abusing other users of the platform",
          "Attempting to circumvent the platform's security measures",
          "Using automated scripts or bots to interact with the platform",
        ]} />
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <LegalP>
          The HUMRI platform, including its design, code, branding, and content, is owned by HUMRI
          and is protected by applicable intellectual property laws. You are granted a limited,
          non-exclusive, non-transferable licence to use the platform for its intended purpose.
        </LegalP>
        <LegalP>
          Legal documents, submissions, and communications generated through the platform in
          connection with a specific matter belong to the client and lawyer involved in that matter.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Disclaimer of Warranties">
        <LegalP>
          HUMRI is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind,
          express or implied. We do not warrant that:
        </LegalP>
        <LegalList items={[
          "The platform will be uninterrupted, error-free, or secure at all times",
          "Any legal matter submitted will be assigned to a lawyer",
          "The legal assistance provided will achieve any particular outcome",
          "The platform will be free from viruses or other harmful components",
          "Information on the platform is accurate, complete, or current",
        ]} />
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <LegalP>
          To the maximum extent permitted by Nigerian law, HUMRI shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages arising from your use
          of the platform, including but not limited to:
        </LegalP>
        <LegalList items={[
          "Any adverse legal outcome in your matter",
          "Loss or corruption of data submitted to the platform",
          "Unauthorised access to your account or submitted information",
          "Actions or omissions of volunteer lawyers",
          "Platform downtime or service interruptions",
        ]} />
        <LegalP>
          HUMRI's total liability to you for any claim arising from use of the platform shall not
          exceed NGN 50,000 (fifty thousand naira).
        </LegalP>
      </LegalSection>

      <LegalSection title="10. Indemnification">
        <LegalP>
          You agree to indemnify, defend, and hold harmless HUMRI, its administrators, volunteers,
          and service providers from and against any claims, damages, losses, and expenses
          (including reasonable legal fees) arising from:
        </LegalP>
        <LegalList items={[
          "Your violation of these Terms of Use",
          "Your submission of false or misleading information",
          "Your infringement of any third party's rights",
          "Your unlawful or unauthorised use of the platform",
        ]} />
      </LegalSection>

      <LegalSection title="11. Termination">
        <LegalP>
          HUMRI reserves the right to suspend or terminate access to the platform at any time,
          without notice, for conduct that violates these Terms of Use or that we believe is
          harmful to other users, the platform, or third parties.
        </LegalP>
        <LegalP>
          Lawyer accounts may be suspended pending investigation of a complaint or professional
          conduct concern. Suspended lawyers will be notified by email.
        </LegalP>
      </LegalSection>

      <LegalSection title="12. Governing Law and Dispute Resolution">
        <LegalP>
          These Terms of Use are governed by and construed in accordance with the laws of the
          Federal Republic of Nigeria. Any dispute arising from or relating to these terms or
          your use of HUMRI shall be subject to the exclusive jurisdiction of the courts of Nigeria.
        </LegalP>
        <LegalP>
          Before commencing formal legal proceedings, you agree to notify HUMRI of the dispute
          and allow 30 days for informal resolution at support@humri.ng.
        </LegalP>
      </LegalSection>

      <LegalSection title="13. Changes to These Terms">
        <LegalP>
          We reserve the right to modify these Terms of Use at any time. Changes will be effective
          immediately upon posting to the platform. Your continued use of HUMRI after changes are
          posted constitutes acceptance of the revised terms. Registered lawyers will be notified
          of material changes by email.
        </LegalP>
      </LegalSection>

      <LegalSection title="14. Contact">
        <LegalP>
          For questions about these Terms of Use, contact us at:<br />
          <strong>Email:</strong> legal@humri.ng<br />
          <strong>Platform:</strong> humri.vercel.app
        </LegalP>
      </LegalSection>

    </LegalLayout>
  );
}
