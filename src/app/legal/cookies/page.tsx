import { LegalLayout, LegalSection, LegalP, LegalList, LegalHighlight } from "@/components/shared/LegalLayout";

export const metadata = {
  title: "Cookie Policy — HUMRI",
  description: "How HUMRI uses cookies and similar tracking technologies.",
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="29 June 2026">

      <LegalHighlight>
        HUMRI uses a minimal number of cookies — only those strictly necessary to operate the
        platform securely. We do not use advertising cookies, tracking pixels, or third-party
        analytics that monitor your behaviour across other websites.
      </LegalHighlight>

      <LegalSection title="1. What Are Cookies">
        <LegalP>
          Cookies are small text files placed on your device by a website when you visit it.
          They are widely used to make websites work correctly, remember your preferences,
          and provide a secure experience.
        </LegalP>
        <LegalP>
          Similar technologies include local storage and session storage, which store data
          directly in your browser. HUMRI uses these in limited ways as described below.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. Cookies We Use">
        <LegalP><strong>Strictly necessary cookies</strong></LegalP>
        <LegalP>
          These cookies are essential for the platform to function. Without them, you cannot
          log in or use the lawyer and admin portals. You cannot opt out of these cookies
          while using the platform.
        </LegalP>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium rounded-tl-lg">Cookie name</th>
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Purpose</th>
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Duration</th>
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium rounded-tr-lg">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                {
                  name:     "next-auth.session-token",
                  purpose:  "Stores your authentication session so you remain logged in",
                  duration: "Session / 30 days",
                  type:     "Essential",
                },
                {
                  name:     "next-auth.csrf-token",
                  purpose:  "Protects against Cross-Site Request Forgery (CSRF) attacks",
                  duration: "Session",
                  type:     "Essential",
                },
                {
                  name:     "next-auth.callback-url",
                  purpose:  "Remembers where to redirect you after login",
                  duration: "Session",
                  type:     "Essential",
                },
                {
                  name:     "__Secure-next-auth.session-token",
                  purpose:  "Secure version of the session token used on HTTPS connections",
                  duration: "30 days",
                  type:     "Essential",
                },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.purpose}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.duration}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">
                      {row.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <LegalP><strong className="block mt-6 mb-2">Preference cookies</strong></LegalP>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium rounded-tl-lg">Cookie name</th>
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Purpose</th>
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Duration</th>
                <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-medium rounded-tr-lg">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">theme</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Stores your light/dark mode preference</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">1 year</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                    Preference
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="3. Cookies We Do NOT Use">
        <LegalP>
          HUMRI does not use the following types of cookies or tracking technologies:
        </LegalP>
        <LegalList items={[
          "Advertising or targeting cookies",
          "Third-party tracking pixels or beacons",
          "Social media tracking cookies",
          "Cross-site behavioural analytics (e.g. Google Analytics, Meta Pixel)",
          "Fingerprinting or device identification techniques",
        ]} />
        <LegalP>
          We made a deliberate decision not to use analytics tracking given the sensitive nature
          of the legal information shared on this platform. Our users' privacy matters more than
          our ability to measure traffic.
        </LegalP>
      </LegalSection>

      <LegalSection title="4. Third-Party Services">
        <LegalP>
          HUMRI uses the following third-party services, which may set their own cookies or
          process data as described in their own privacy policies:
        </LegalP>
        <LegalList items={[
          "Vercel (hosting) — may set performance cookies for edge network routing",
          "MongoDB Atlas (database) — server-side only, no client-side cookies",
          "Resend (email delivery) — server-side only, no client-side cookies",
        ]} />
        <LegalP>
          Vercel's privacy policy is available at vercel.com/legal/privacy-policy.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. Managing Cookies">
        <LegalP>
          You can control and manage cookies through your browser settings. Most browsers allow
          you to view, delete, and block cookies. Here is how to manage cookies in common browsers:
        </LegalP>
        <LegalList items={[
          "Chrome: Settings → Privacy and security → Cookies and other site data",
          "Safari: Preferences → Privacy → Manage Website Data",
          "Firefox: Options → Privacy & Security → Cookies and Site Data",
          "Edge: Settings → Cookies and site permissions → Cookies and site data",
        ]} />
        <LegalP>
          Please note that blocking essential cookies will prevent you from logging in to the
          lawyer and admin portals. The public-facing pages (matter submission and tracking)
          do not require cookies.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Changes to This Policy">
        <LegalP>
          We may update this Cookie Policy when we add or change cookies on the platform.
          The &quot;Last updated&quot; date at the top of this page will reflect the most recent revision.
          We encourage you to review this page periodically.
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Contact">
        <LegalP>
          If you have questions about our use of cookies, please contact:<br />
          <strong>Email:</strong> privacy@humri.ng<br />
          <strong>Platform:</strong> humri.vercel.app
        </LegalP>
      </LegalSection>

    </LegalLayout>
  );
}
