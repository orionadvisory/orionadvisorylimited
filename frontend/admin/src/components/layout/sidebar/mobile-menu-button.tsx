"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";

/** Opens the mobile navigation drawer. Rendered in the topbar below `md`. */
export function MobileMenuButton() {
  const { open, setOpen } = useSidebar();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open navigation"
      aria-expanded={open}
      aria-controls="mobile-sidebar"
      className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-canvas md:hidden"
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
