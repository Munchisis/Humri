"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Scale, LayoutDashboard, FileText, LogOut,
  ChevronRight, LifeBuoy, Inbox, Settings,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/themeToggle";
import Image from "next/image";

interface Props {
  user: { name?: string | null; email?: string | null };
}

interface Alerts { stale: number; warning: number; total: number }

const nav = [
  { href: "/lawyer",          label: "My dashboard",  icon: LayoutDashboard },
  { href: "/lawyer/pool",     label: "Matter pool",   icon: Inbox           },
  { href: "/lawyer/matters",  label: "My matters",    icon: FileText        },
  { href: "/lawyer/support",  label: "Contact admin", icon: LifeBuoy        },
  { href: "/lawyer/settings", label: "Settings",      icon: Settings        },
];

export function LawyerSidebar({ user }: Props) {
  const pathname = usePathname();
  const [alerts, setAlerts] = useState<Alerts>({ stale: 0, warning: 0, total: 0 });

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res  = await fetch("/api/lawyer/alerts");
        const data = await res.json();
        setAlerts(data);
      } catch { /* non-critical */ }
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-60 shrink-0 bg-gradient-to-br from-gray-900 via-gray-800 to-brand-800 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-brand-800 shadow-lg">
        <Link
          href="/"
          className="w-10 h-10 dark:shadow-sm dark:shadow-brand-100 rounded-full flex items-center justify-center shrink-0"
        >
          <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
        </Link>
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-brand-50 leading-none"
          >
            HUMRI
          </Link>
          <div className="text-xs text-brand-400 mt-0.5">Admin</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/lawyer" && pathname.startsWith(href));
          const isMatters = href === "/lawyer/matters";
          const showBadge = isMatters && alerts.total > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-gray-800 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {showBadge && (
                <span
                  className={
                    "ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center " +
                    (alerts.stale > 0
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white")
                  }
                >
                  {alerts.total > 9 ? "9+" : alerts.total}
                </span>
              )}
              {active && !showBadge && (
                <ChevronRight className="w-3 h-3 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        {/* Stale matter warning strip */}
        {alerts.total > 0 && (
          <div
            className={
              "mx-0 mb-3 px-3 py-2 rounded-lg text-xs leading-relaxed " +
              (alerts.stale > 0
                ? "bg-red-900/40 text-red-300 border border-red-800"
                : "bg-amber-900/30 text-amber-300 border border-amber-800")
            }
          >
            {alerts.stale > 0
              ? `⚡ ${alerts.stale} matter${alerts.stale !== 1 ? "s" : ""} will be auto-released soon`
              : `⚠️ ${alerts.warning} matter${alerts.warning !== 1 ? "s" : ""} need${alerts.warning === 1 ? "s" : ""} attention`}
          </div>
        )}

        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
            {getInitials(user.name ?? "L")}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-gray-100 truncate">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
        </div>
        <div className="w-fit px-3 mb-2">
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
