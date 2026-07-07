"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Mail, MailOpen, CheckCircle, Trash2, RefreshCw, Send, X } from "lucide-react";

interface Message {
  _id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  status: "unread" | "read" | "resolved";
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
}

const statusStyles = {
  unread:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  read:     "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
  resolved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
};

export default function AdminMessagesPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Message | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [reply, setReply]           = useState("");
  const [replying, setReplying]     = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const res  = await fetch("/api/messages?" + params);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function openMessage(msg: Message) {
    setSelected(msg);
    setReply(msg.adminReply ?? "");

    // Mark as read if unread
    if (msg.status === "unread") {
      await fetch(`/api/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: msg.adminReply ?? "", status: "read" }),
      });
      setMessages((prev) =>
        prev.map((m) => m._id === msg._id ? { ...m, status: "read" } : m)
      );
    }
  }

  async function sendReply() {
    if (!selected || reply.trim().length < 5) return;
    setReplying(true);
    await fetch(`/api/messages/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply, status: "resolved" }),
    });
    setReplying(false);
    setSelected(null);
    setReply("");
    load();
  }

  async function markResolved(id: string) {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    if (selected?._id === id) setSelected(null);
    load();
  }

  async function deleteMessage(id: string) {
    setDeleting(id);
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (selected?._id === id) setSelected(null);
    load();
  }

  const unreadCount = messages.filter(m => m.status === "unread").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
              : "All messages read"}
          </p>
        </div>
        <button onClick={load} className="btn text-sm gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { value: "",         label: `All (${messages.length})`                              },
          { value: "unread",   label: `Unread (${messages.filter(m => m.status === "unread").length})`   },
          { value: "read",     label: `Read (${messages.filter(m => m.status === "read").length})`       },
          { value: "resolved", label: `Resolved (${messages.filter(m => m.status === "resolved").length})` },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilterStatus(value)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
              (filterStatus === value
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Message list */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div className="card text-center py-16">
              <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No messages yet.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button key={msg._id} onClick={() => openMessage(msg)}
                className={"w-full text-left card hover:border-brand-300 dark:hover:border-brand-700 transition-all " +
                  (selected?._id === msg._id ? "border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20" : "") +
                  (msg.status === "unread" ? " border-blue-200 dark:border-blue-800" : "")}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {msg.status === "unread"
                      ? <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      : <MailOpen className="w-4 h-4 text-gray-400 shrink-0" />}
                    <span className={"text-sm font-medium truncate " +
                      (msg.status === "unread" ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                      {msg.subject}
                    </span>
                  </div>
                  <span className={"badge text-xs shrink-0 " + statusStyles[msg.status]}>
                    {msg.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 pl-6">
                  {msg.fromName} · {msg.fromEmail}
                </div>
                <p className="text-xs text-gray-400 pl-6 line-clamp-2">{msg.body}</p>
                <div className="text-xs text-gray-300 dark:text-gray-600 pl-6 mt-1">
                  {new Date(msg.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message detail panel */}
        {selected ? (
          <div className="card h-fit sticky top-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {selected.subject}
                </h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  From <strong>{selected.fromName}</strong> ·{" "}
                  <a href={`mailto:${selected.fromEmail}`}
                    className="text-brand-600 hover:underline">{selected.fromEmail}</a>
                  <span className="mx-1">·</span>
                  {new Date(selected.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original message */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {selected.body}
            </div>

            {/* Previous reply */}
            {selected.adminReply && (
              <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4 mb-4">
                <div className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-2">
                  Your previous reply · {selected.repliedAt
                    ? new Date(selected.repliedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                    : ""}
                </div>
                <p className="text-sm text-brand-800 dark:text-brand-300 leading-relaxed whitespace-pre-wrap">
                  {selected.adminReply}
                </p>
              </div>
            )}

            {/* Reply box */}
            {selected.status !== "resolved" || selected.adminReply ? (
              <>
                <label className="label">
                  {selected.adminReply ? "Update reply" : "Reply to lawyer"}
                </label>
                <textarea className="input mb-3" rows={4}
                  placeholder="Type your reply here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={sendReply} disabled={replying || reply.trim().length < 5}
                    className="btn btn-primary text-xs gap-1.5 flex-1 justify-center">
                    {replying
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                      : <><Send className="w-3.5 h-3.5" /> Send reply</>}
                  </button>
                  {selected.status !== "resolved" && (
                    <button onClick={() => markResolved(selected._id)}
                      className="btn text-xs gap-1.5 text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                  <button onClick={() => deleteMessage(selected._id)}
                    disabled={deleting === selected._id}
                    className="btn text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
                    {deleting === selected._id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Resolved — reply sent to lawyer
                <button onClick={() => deleteMessage(selected._id)}
                  disabled={deleting === selected._id}
                  className="btn text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 ml-auto dark:text-red-400 dark:border-red-800">
                  {deleting === selected._id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <><Trash2 className="w-3.5 h-3.5" /> Delete</>}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-16 hidden lg:flex flex-col items-center justify-center">
            <MailOpen className="w-8 h-8 text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Select a message to read and reply</p>
          </div>
        )}
      </div>
    </div>
  );
}
