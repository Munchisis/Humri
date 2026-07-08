"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scale, CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token provided."); return; }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setStatus("error"); setMessage(data.error); return; }
        setStatus("success");
        setMessage(data.message);
      })
      .catch(() => { setStatus("error"); setMessage("Something went wrong. Please try again."); });
  }, [token]);

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

        <div className="card text-center py-2">
          {status === "loading" && (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" /> Verifying your email…
            </div>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-brand-600" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Email verified</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link href="/auth/login" className="btn btn-primary w-full justify-center py-2.5">
                Continue to sign in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Verification failed</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
              <Link href="/auth/login" className="btn w-full justify-center py-2.5">
                Return to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
