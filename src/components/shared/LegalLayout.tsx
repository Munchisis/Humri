import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center">
              <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              HUMRI
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-medium text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Legal nav */}
        <div className="flex gap-2 flex-wrap mb-10">
          {[
            { href: "/legal/privacy", label: "Privacy Policy" },
            { href: "/legal/terms", label: "Terms of Use" },
            { href: "/legal/cookies", label: "Cookie Policy" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
            <span>HUMRI — HUMAN RIGHTS. HUMAN DIGNITY.JUSTICE FOR ALL.</span>
          </div>
          <div className="flex gap-4">
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

// Reusable section components for legal pages
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 ml-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="text-brand-500 shrink-0 mt-1">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl px-5 py-4 text-sm text-brand-800 dark:text-brand-200 leading-relaxed">
      {children}
    </div>
  );
}
