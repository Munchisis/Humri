"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router        = useRouter();
  const token          = searchParams.get("token") ?? "";

  const [checking, setChecking]   = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => setValidToken(!!data.valid))
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/auth/login"), 2500);
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
          {checking ? (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" /> Validating link…
            </div>
          ) : !validToken ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Link expired or invalid</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                This password reset link is no longer valid. Please request a new one.
              </p>
              <Link href="/auth/forgot-password" className="btn btn-primary w-full justify-center py-2.5">
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-brand-600" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Password reset</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">Set a new password</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose a strong password you haven&apos;t used before.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">New password</label>
                  <input type="password" className="input" placeholder="Min. 8 characters" required
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <label className="label">Confirm new password</label>
                  <input type="password" className="input" placeholder="Repeat password" required
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</>
                  ) : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
