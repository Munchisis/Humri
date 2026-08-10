"use client";

import { useState, useEffect } from "react";
import { Loader2, Scale, CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoleSwitcher() {
  const router = useRouter();
  const [roles, setRoles]     = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState({ text: "", error: false });

  useEffect(() => {
    async function load() {
      const res  = await fetch("/api/user/roles");
      const data = await res.json();
      setRoles(data.roles ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const isLawyer = roles.includes("lawyer");

  async function toggle() {
    setSaving(true);
    setMsg({ text: "", error: false });
    const res  = await fetch("/api/user/roles", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        action: isLawyer ? "revoke_lawyer" : "grant_lawyer",
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMsg({ text: data.error ?? "Failed to update role.", error: true });
      return;
    }

    setRoles(data.roles ?? []);
    setMsg({
      text:  isLawyer
        ? "Lawyer role removed. Sign out and back in for changes to take effect."
        : "Lawyer role granted. Sign out and back in to access the lawyer portal.",
      error: false,
    });
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading role settings…
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Lawyer role
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isLawyer
                ? "You can access the lawyer portal, browse the matter pool, and claim matters."
                : "Enable this to access the lawyer portal alongside your admin account."}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={toggle}
          disabled={saving}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none ${
            isLawyer ? "bg-brand-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isLawyer ? "translate-x-5" : "translate-x-0"
            }`}
          />
          {saving && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            </span>
          )}
        </button>
      </div>

      {isLawyer && (
        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
          <p className="text-xs font-medium text-brand-800 dark:text-gray-300 mb-2 ">
            Lawyer portal access
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/lawyer")}
              className="btn btn-primary text-xs justify-center py-2"
            >
              Go to lawyer dashboard →
            </button>
            <p className="text-xs text-brand-600 dark:text-gray-400 text-center">
              Your admin session stays active, you can switch between portals
              freely.
            </p>
          </div>
        </div>
      )}

      {msg.text && (
        <div
          className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${
            msg.error
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          }`}
        >
          {msg.error ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          {msg.text}
        </div>
      )}
    </div>
  );
}
