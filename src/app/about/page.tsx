import Link from "next/link";
import Image from "next/image";
import { Scale, Users, FileText, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About — HUMRI",
  description: "HUMRI connects people who need legal help with volunteer lawyers.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      <Scale
        className="absolute -left-16 -top-16 w-80 h-80 text-emerald-900/[0.04] dark:text-emerald-100/[0.04] rotate-[-8deg] pointer-events-none select-none"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex items-center gap-3 mb-10">
          <Link
            href="/"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-900/10 dark:ring-emerald-100/10"
          >
            <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
          </Link>
          <div>
            <Link href="/" className="text-lg font-semibold leading-none">
              HUMRI
            </Link>
            <div className="text-xs text-gray-400 tracking-wide uppercase mt-0.5">
              Access to justice
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-5 max-w-2xl">
          Legal help shouldn&apos;t depend on what you can afford.
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg leading-relaxed mb-16">
          HUMRI connects people who need legal help with volunteer lawyers
          willing to give their time — so that access to justice depends on
          the merits of a case, not the size of a bank account.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="card border border-emerald-900/5">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium mb-1.5">Submit a matter</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Anyone who needs legal help can describe their situation in a
              few minutes — no legal jargon required.
            </p>
          </div>
          <div className="card border border-emerald-900/5">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium mb-1.5">Matched with a lawyer</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Matters are routed to volunteer lawyers by specialisation and
              state, so the right expertise reaches the right case.
            </p>
          </div>
          <div className="card border border-emerald-900/5">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium mb-1.5">Vetted volunteers</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every volunteer lawyer's registration is reviewed before they
              can take on a matter through the platform.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="card border border-emerald-900/5 bg-emerald-800 text-white">
            <h3 className="font-medium text-lg mb-2">Need legal help?</h3>
            <p className="text-sm text-emerald-100/90 mb-5 leading-relaxed">
              Tell us what's going on and we'll connect you with a volunteer
              lawyer who can help.
            </p>
            <Link
              href="/submit"
              className="btn justify-center py-2.5 px-5 bg-white text-emerald-800 hover:bg-emerald-50 transition-colors inline-flex font-medium"
            >
              Submit a matter →
            </Link>
          </div>
          <div className="card border border-emerald-900/5">
            <h3 className="font-medium text-lg mb-2">Are you a lawyer?</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Volunteer your time and expertise to help people who couldn&apos;t
              otherwise afford legal representation.
            </p>
            <Link
              href="/auth/register"
              className="btn btn-primary justify-center py-2.5 px-5 inline-flex"
            >
              Apply to volunteer →
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-16">
          Have questions?{" "}
          <Link href="/contact" className="text-emerald-700 hover:underline font-medium">
            Contact us →
          </Link>
        </p>
      </div>
    </div>
  );
}
