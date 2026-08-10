"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/login");
      return;
    }

    const roles: string[] = (session.user as any)?.roles ?? [(session.user as any)?.role];

    // Admins go to admin dashboard by default
    if (roles.includes("admin")) {
      router.replace("/admin");
    } else if (roles.includes("lawyer")) {
      router.replace("/lawyer");
    } else {
      router.replace("/auth/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 gap-3">
      <Loader2 className="w-5 h-5 animate-spin" />
      Redirecting…
    </div>
  );
}
