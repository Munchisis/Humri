import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Users,
  Scale,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/themeToggle";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-10 h-10 dark:shadow-sm dark:shadow-brand-100 rounded-full flex items-center justify-center shrink-0"
            >
              <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
            </Link>
            <div>
              <Link
                href="/"
                className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-200"
              >
                HUMRI
              </Link>
              <div className="hidden md:block text-[10px] text-gray-400 mt-0.5">
                ACCESS TO JUSTICE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors dark:hover:text-gray-400"
            >
              Track matter
            </Link>
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors dark:hover:text-gray-400"
            >
              Sign in
            </Link>
            <Link
              href="/submit"
              className="hidden sm:block btn btn-primary text-sm py-1.5 px-4"
            >
              Get legal help
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-brand-900 to-emerald-800 text-white dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
        {/* Watermark icon — signature element */}
        <Scale
          className="absolute -right-10 -top-10 w-72 h-72 text-white/[0.06] rotate-[12deg] pointer-events-none select-none"
          strokeWidth={1}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-emerald-100 text-xs px-4 py-1.5 rounded-full mb-6 font-medium tracking-wide border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Free · Confidential · Professional
          </div>

          <h1 className="text-4xl md:text-5xl max-w-4xl font-black leading-tight mb-5 tracking-wide mx-auto">
            Justice should not depend on
            <br className="hidden md:block" /> what you can afford
          </h1>

          <p className="text-emerald-100/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            HUMRI connects people facing legal challenges with qualified
            Nigerian volunteer lawyers, completely free of charge.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-white text-emerald-900 font-medium px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors text-sm shadow-lg shadow-emerald-950/30"
            >
              Submit your matter <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/track"
              className="border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white/60 transition-all duration-200"
            >
              Track existing matter
            </Link>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
          {[
            ["1,240+", "Matters resolved"],
            ["86", "Volunteer lawyers"],
            ["28", "States covered"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-3xl font-semibold text-brand-700">{v}</div>
              <div className="text-sm text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-3 dark:text-gray-100">
            How it works
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Three simple steps between you and qualified legal help.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">
          {[
            {
              step: "01",
              title: "Describe your matter",
              desc: "Fill in a short form explaining your situation. Make it concise and direct.",
            },
            {
              step: "02",
              title: "Get matched to a lawyer",
              desc: "Our team reviews your submission and assigns a qualified lawyer within 72 hours.",
            },
            {
              step: "03",
              title: "Receive free legal help",
              desc: "Your assigned lawyer contacts you and handles your matter completely free.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group dark:bg-gray-900 dark:border-brand-600"
            >
              {/* Large faint background step number */}
              <div className="absolute top-1 right-4 text-5xl font-black text-brand-400/10 select-none group-hover:text-brand-400/20 transition-colors  dark:text-gray-600">
                {item.step}
              </div>

              <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-3 mt-7  dark:text-gray-300">
                {item.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm  dark:text-gray-500">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Matter types */}
      <section className="bg-gray-50 border-t border-gray-100 dark:bg-gray-900  dark:border-none dark:text-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-xl font-medium mb-8  ">
            We handle matters including
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Employment disputes",
              "Wrongful termination",
              "Tenancy & landlord issues",
              "Family law & divorce",
              "Child custody",
              "Criminal defence",
              "Land & property rights",
              "Contract disputes",
              "Human rights violations",
              "Debt recovery",
              "Immigration matters",
            ].map((t) => (
              <span
                key={t}
                className="text-sm px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700  dark:bg-gray-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Lawyer CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className=" bg-gradient-to-br from-green-950 via-green-800 to-brand-800 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-white/70" />
              <span className="text-white/60 text-sm font-medium">
                For lawyers
              </span>
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">
              Volunteer your expertise
            </h2>
            <p className="text-brand-200 text-sm max-w-md leading-relaxed">
              Join our growing network of Nigerian lawyers giving back through
              pro bono work. Cases are matched to your specialisation and
              managed through a clean dashboard.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-brand-900 font-medium px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors text-sm whitespace-nowrap"
          >
            Apply to join <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-col  gap-2">
            <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
            <span>HUMRI — ACCESS TO JUSTICE.</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/about"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              About us
            </Link>
            <Link
              href="/contact"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              Contact us
            </Link>
            <Link
              href="/submit"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              Submit matter
            </Link>
            <Link
              href="/track"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              Track matter
            </Link>
            <Link
              href="/legal/privacy"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              Terms
            </Link>
            <Link
              href="/legal/cookies"
              className="hover:text-gray-600 dark:hover:text-gray-200"
            >
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
