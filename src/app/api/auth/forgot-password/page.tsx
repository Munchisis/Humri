"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-brand-800 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-brand-100" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-none">HUMRI</div>
            <div className="text-xs text-gray-400 tracking-wide uppercase mt-0.5">Pro bono legal aid</div>
          </div>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-brand-600" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Check your email</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                If an account exists with <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
                The link expires in 1 hour.
              </p>
              <Link href="/auth/login" className="btn btn-primary w-full justify-center py-2.5">
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">Forgot your password?</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending link…</>
                  ) : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
