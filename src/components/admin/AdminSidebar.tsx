"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Scale, LayoutDashboard, FileText,
  Users, LogOut, ChevronRight, MessageSquare, Settings,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/themeToggle";

interface Props {
  user: { name?: string | null; email?: string | null };
}

const nav = [
  { href: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/matters",   label: "All matters",  icon: FileText        },
  { href: "/admin/lawyers",   label: "Lawyers",      icon: Users           },
  { href: "/admin/messages",  label: "Messages",     icon: MessageSquare   },
  { href: "/admin/settings",  label: "Settings",     icon: Settings        },
];

export function AdminSidebar({ user }: Props) {
  const pathname     = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res  = await fetch("/api/messages?status=unread");
        const data = await res.json();
        setUnreadCount((data.messages ?? []).length);
      } catch { /* non-critical */ }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-60 shrink-0 bg-brand-900 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-brand-800">
        <Link href="/" className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-brand-900" />
        </Link>
        <div>
          <Link href="/" className="text-sm font-semibold text-brand-50 leading-none">HUMRI</Link>
          <div className="text-xs text-brand-400 mt-0.5">Admin</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active      = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          const isMessages  = href === "/admin/messages";
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-brand-800 text-brand-50 font-medium"
                  : "text-gray-100 hover:bg-brand-800 hover:text-brand-50"
              )}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {isMessages && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {active && !(isMessages && unreadCount > 0) && (
                <ChevronRight className="w-3 h-3 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-brand-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-brand-400 flex items-center justify-center text-xs font-medium text-brand-900 shrink-0">
            {getInitials(user.name ?? "Admin")}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-brand-100 truncate">{user.name}</div>
            <div className="text-xs text-brand-400 truncate">{user.email}</div>
          </div>
        </div>
        <div className="w-fit px-3 mb-2">
          <ThemeToggle />
        </div>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-brand-50 hover:bg-brand-800 rounded-lg transition-all">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
