"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Scale, LayoutDashboard, FileText, LogOut, ChevronRight, LifeBuoy } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ThemeToggle } from "../shared/themeToggle";

interface Props {
  user: { name?: string | null; email?: string | null };
}

const nav = [
  { href: "/lawyer",         label: "My dashboard", icon: LayoutDashboard },
  { href: "/lawyer/matters", label: "My matters",   icon: FileText        },
  { href: "/lawyer/support", label: "Contact admin", icon: LifeBuoy       },
];

export function LawyerSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-gray-900 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white leading-none">
            HumRi
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Lawyer portal</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/lawyer" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-gray-800 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
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
        <div className="w-fit px-3 mb-3">
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
