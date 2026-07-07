"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle, AlertCircle, Mail, ShieldAlert, Send, MailOpen } from "lucide-react";

interface Message {
  _id: string;
  subject: string;
  body: string;
  status: "unread" | "read" | "resolved";
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function LawyerSupportPage() {
  const { data: session } = useSession();
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const emailVerified = (session?.user as Record<string, unknown> | undefined)?.emailVerified as boolean | undefined;

  const loadMessages = useCallback(async () => {
    setLoadingMsgs(true);
    const res  = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoadingMsgs(false);
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body: message }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    setSent(true);
    setSubject("");
    setMessage("");
    loadMessages();
  }

  async function resendVerification() {
    setResendLoading(true);
    setResendMessage("");
    const res  = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = await res.json();
    setResendLoading(false);
    setResendMessage(data.message ?? data.error ?? "");
  }

  const statusStyles: Record<string, string> = {
    unread:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    read:     "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    resolved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium">Contact admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send a message to the HUMRI admin team and track replies here.
        </p>
      </div>

      {/* Email verification warning */}
      {emailVerified === false && (
        <div className="card mb-5 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Your email isn&apos;t verified yet</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Verify your email so we can reliably reach you with matter updates and admin replies.
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

      {/* Send new message */}
      <div className="card mb-6">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">New message</h2>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Message sent</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              The admin team will respond within 1–2 business days. You can track the reply below.
            </p>
            <button onClick={() => setSent(false)} className="btn text-xs">
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
              <textarea className="input" rows={5} required
                placeholder="Describe your question or issue in detail..."
                value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
              <div className="text-xs text-gray-400 mt-1 text-right">{message.length} / 2000</div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send to admin team</>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Message history */}
      <div>
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Message history
        </h2>

        {loadingMsgs ? (
          <div className="flex items-center justify-center py-10 text-gray-400 gap-3">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="card text-center py-10">
            <MailOpen className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No messages sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg._id}>
                <button
                  onClick={() => setSelected(selected?._id === msg._id ? null : msg)}
                  className={"w-full text-left card hover:border-brand-300 dark:hover:border-brand-700 transition-all " +
                    (selected?._id === msg._id ? "border-brand-400 dark:border-brand-600" : "")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {msg.subject}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Sent {new Date(msg.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                    <span className={"badge text-xs shrink-0 " + statusStyles[msg.status]}>
                      {msg.status === "resolved" ? "Replied" : msg.status}
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {selected?._id === msg._id && (
                  <div className="mt-2 ml-2 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-3">
                    {/* Original message */}
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-1">Your message</p>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {msg.body}
                      </div>
                    </div>

                    {/* Admin reply */}
                    {msg.adminReply ? (
                      <div>
                        <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mb-1">
                          Admin reply · {msg.repliedAt
                            ? new Date(msg.repliedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                            : ""}
                        </p>
                        <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-3 text-sm text-brand-800 dark:text-brand-300 leading-relaxed whitespace-pre-wrap">
                          {msg.adminReply}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Awaiting admin reply…
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
