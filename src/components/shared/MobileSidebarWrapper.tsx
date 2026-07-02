"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileSidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-brand-800 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:block
        transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    </>
  );
}
