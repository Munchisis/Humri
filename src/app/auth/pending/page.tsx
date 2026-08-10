"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Clock } from "lucide-react";

export default function PendingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      // Force session refresh from server
      await update();
      const approved = (session?.user as any)?.isApproved;
      if (approved) {
        router.replace("/lawyer");
      }
    }, 10_000); // check every 10 seconds

    return () => clearInterval(interval);
  }, [session, update, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Account pending approval
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Your application has been received. The admin team will review your
          NBA bar number and approve your account. You will be redirected
          automatically once approved.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Checking for approval…
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="mt-8 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
