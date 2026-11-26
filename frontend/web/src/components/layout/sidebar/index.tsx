"use client";

import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@orion/ui/utils";
import { useSidebar } from "./sidebar-context";
import { SidebarContent } from "./sidebar-content";
import type { SidebarProps } from "./nav-config";

export { SidebarProvider, useSidebar } from "./sidebar-context";
export { MobileMenuButton } from "./mobile-menu-button";

const railClasses = "bg-ink text-[#f4efe6] flex flex-col";

export function Sidebar({ user, startup, counts }: SidebarProps) {
  const { open, setOpen, collapsed, setCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop rail */}
      <aside
        aria-label="Sidebar"
        className={cn(
          railClasses,
          "fixed left-0 top-0 z-30 hidden h-full pb-3 transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent user={user} startup={startup} counts={counts} collapsed={collapsed} />
        <div className={cn("pt-2", collapsed ? "px-2.5" : "px-3")}>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(
              "focus-ring flex items-center rounded-full text-[#9fb0a9] transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-aurora",
              collapsed ? "mx-auto h-11 w-11 justify-center" : "h-10 w-full gap-3 px-3.5"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-sidebar"
        aria-label="Sidebar"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          railClasses,
          "fixed left-0 top-0 z-50 h-full w-72 pb-4 shadow-2xl transition-transform duration-200 ease-out motion-reduce:transition-none md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
          className="focus-ring absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#c7d0cb] transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-aurora"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <SidebarContent
          user={user}
          startup={startup}
          counts={counts}
          onNavigate={() => setOpen(false)}
        />
      </aside>
    </>
  );
}
