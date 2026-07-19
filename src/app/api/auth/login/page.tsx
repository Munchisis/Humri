"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      rememberMe: rememberMe ? "true" : "false",
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError(res.error);
      return;
    }

    router.push(callbackUrl || "/dashboard-redirect");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-brand-800 rounded-xl flex items-center justify-center">
            <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-none">
              HUMRI
            </div>
            <div className="text-xs text-gray-400 tracking-wide uppercase mt-0.5">
              ACCESS TO JUSTICE
            </div>
          </div>
        </div>

        <div className="card">
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-1">
            Sign in
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Lawyer and admin access only.{" "}
            <Link href="/submit" className="text-brand-600 hover:underline">
              Submit a matter instead →
            </Link>
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-400"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Remember me for 30 days
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Volunteer lawyer?{" "}
          <Link
            href="/auth/register"
            className="text-brand-600 hover:underline font-medium"
          >
            Apply to join →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
