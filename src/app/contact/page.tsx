"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Scale,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    // Honeypot — left blank by real visitors since it's hidden from view.
    // Bots that auto-fill every field on a page tend to fill this too.
    company: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // Captured once, at mount — lets the server flag submissions that arrive
  // implausibly fast for a human to have read the form and typed a message.
  const [formLoadedAt] = useState(() => Date.now());

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formLoadedAt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      <Scale
        className="absolute -right-16 -top-16 w-80 h-80 text-emerald-900/[0.04] dark:text-emerald-100/[0.04] rotate-[8deg] pointer-events-none select-none"
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

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Get in touch
        </h1>
        <p className="text-gray-500 max-w-xl mb-12">
          Questions about submitting a matter, volunteering as a lawyer, or
          anything else — send us a message and we&apos;ll respond as soon as we
          can.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                Email
              </p>
              {/* Placeholder — replace with your real contact address */}
              <a
                href="mailto:hello@humri.org"
                className="text-emerald-700 hover:underline font-medium"
              >
                hello@humri.org
              </a>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                Phone
              </p>
              {/* Placeholder — replace with your real contact number */}
              <p className="text-gray-700 dark:text-gray-300">
                +234 000 000 0000
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Need legal help right away?{" "}
                <Link
                  href="/submit"
                  className="text-emerald-700 hover:underline font-medium"
                >
                  Submit a matter →
                </Link>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Want to volunteer as a lawyer?{" "}
                <Link
                  href="/auth/register"
                  className="text-emerald-700 hover:underline font-medium"
                >
                  Apply here →
                </Link>
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            {success ? (
              <div className="card border border-emerald-900/5 shadow-emerald-900/5 shadow-xl text-center py-10">
                <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-brand-600" />
                </div>
                <h2 className="text-xl font-medium mb-2">Message sent</h2>
                <p className="text-sm text-gray-500">
                  Thanks for reaching out — we&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <div className="card border border-emerald-900/5 shadow-emerald-900/5 shadow-xl">
                {error && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5"
                  >
                    <AlertCircle
                      className="w-4 h-4 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Honeypot field — hidden from sighted users and skipped by
                      screen readers via aria-hidden. Kept off-screen rather
                      than display:none, since some bots skip fields that are
                      display:none but still fill absolutely-positioned ones. */}
                  <div
                    aria-hidden="true"
                    className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden"
                  >
                    <label htmlFor="company">Company</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="label" htmlFor="name">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                        disabled={loading}
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="label" htmlFor="email">
                        Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                        disabled={loading}
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label" htmlFor="subject">
                        Subject<span className="text-red-500">*</span>
                      </label>
                      <input
                        id="subject"
                        className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                        disabled={loading}
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label" htmlFor="message">
                        Message<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                        disabled={loading}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-full justify-center py-2.5 mt-1 bg-emerald-800 hover:bg-emerald-900 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />{" "}
                        Sending…
                      </>
                    ) : (
                      "Send message"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
