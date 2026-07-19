"use client";

import { Eye, EyeOff } from "lucide-react";
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

  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-[#05150d] via-green-950 to-green-800 dark:bg-gradient-to-b dark:from-[#010e07] dark:to-[#01371b] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Top Left Dark Circle */}
      <div className="absolute -top-32 -left-32  h-96 w-96 rounded-full bg-[#c9ded1] dark:bg-[#616a63] opacity-5" />
      {/* Bottom Right Light Circle */}
      <div className="absolute -bottom-1 -right-1 h-80 w-80 rounded-full bg-[#c9ded1] dark:bg-[#616a63] opacity-5" />

      {/* Bottom Right Accent Block/Shape */}
      <div className="absolute bottom-0 right-0 h-full sm:w-40 lg:w-20 w-10 bg-[#07160e] dark:bg-[#7ee9a3] opacity-50 mix-blend-multiply" />
      {/* Bottom Right Accent Block/Shape */}
      <div className="absolute bottom-0 right-0 sm:h-40 lg:h-20  h-10 w-full bg-[#07160e] dark:bg-[#5ace82] opacity-50 mix-blend-multiply" />

      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Link
            href="/"
            className="w-10 h-10 dark:shadow-sm dark:shadow-brand-100 rounded-full flex items-center justify-center shrink-0"
          >
            <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
          </Link>
          <div>
            <Link
              href="/"
              className="text-lg font-semibold text-gray-100 leading-none"
            >
              HUMRI
            </Link>
            <div className="text-xs text-gray-300 tracking-wide uppercase mt-0.5">
              ACCESS TO JUSTICE
            </div>
          </div>
        </div>

        <div className="card border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl ring-1 ring-black/20">
          <h1 className="text-xl font-medium text-gray-100 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">
            Lawyer access only.{" "}
            <Link href="/submit" className="text-brand-400 hover:underline">
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
              <label className="label text-gray-400">Email address</label>
              <input
                type="email"
                className="input border border-white/10 bg-white/[0.02] px-4 py-3 text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm focus:border-brand-400 focus:bg-white/[0.07] focus:ring-1 focus:ring-white/30"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label text-gray-400 mb-0">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input border border-white/10 bg-white/[0.02] px-4 py-3 text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm focus:border-brand-400 focus:bg-white/[0.07] focus:ring-1 focus:ring-white/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-400"
              />
              <span className="text-sm text-gray-400">
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

        <p className="text-center text-sm text-gray-400 mt-5">
          Volunteer lawyer?{" "}
          <Link
            href="/auth/register"
            className="text-gray-200 hover:underline font-medium"
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



    