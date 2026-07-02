"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, AlertCircle, Mail, ShieldAlert } from "lucide-react";

export default function LawyerSupportPage() {
  const { data: session } = useSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const emailVerified = (session?.user as Record<string, unknown> | undefined)?.emailVerified as boolean | undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/lawyer/contact-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    setSent(true);
    setSubject("");
    setMessage("");
  }

  async function resendVerification() {
    setResendLoading(true);
    setResendMessage("");
    const res  = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = await res.json();
    setResendLoading(false);
    setResendMessage(data.message ?? data.error ?? "");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium">Contact admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Reach out to the HUMRI admin team for support, questions, or to report an issue.
        </p>
      </div>

      {emailVerified === false && (
        <div className="card mb-5 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Your email isn&apos;t verified yet</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Verify your email so we can reliably reach you with matter updates.
              </p>
              {resendMessage && (
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 font-medium">{resendMessage}</p>
              )}
            </div>
            <button onClick={resendVerification} disabled={resendLoading}
              className="btn text-xs gap-1.5 shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40">
              {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              Resend
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-brand-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Message sent</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              The admin team has been notified and will respond within 1-2 business days.
              A confirmation has also been sent to your email.
            </p>
            <button onClick={() => setSent(false)} className="btn text-sm">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="e.g. Question about a claimed matter" required
                value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input" rows={6} required
                placeholder="Describe your question or issue in detail..."
                value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
              <div className="text-xs text-gray-400 mt-1 text-right">{message.length} / 2000</div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Mail className="w-4 h-4" /> Send to admin team</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
