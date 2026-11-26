"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { Logo } from "@orion/ui/components/ui/logo";
import { NavPill } from "@orion/ui/components/ui/nav-pill";
import { cn } from "@orion/ui/utils";
import {
  adminNavItems,
  getBestMatch,
  getInitials,
  memberNavItems,
  stageLabels,
  type SidebarProps,
} from "./nav-config";

const itemFocus = "focus-ring focus-visible:outline-aurora";

export function SidebarContent({
  user,
  startup,
  counts,
  onNavigate,
  collapsed = false,
}: SidebarProps & { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin" && user.status === "active";
  const navItems = isAdmin ? adminNavItems : memberNavItems;
  const activeHref = getBestMatch(pathname, navItems);
  const startupName = startup?.name || "My Startup";
  const stage = startup?.stage ? stageLabels[startup.stage] || startup.stage : "Startup";

  return (
    <>
      {/* Brand */}
      <div className={cn("pb-4 pt-5", collapsed ? "px-2.5" : "px-5")}>
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          onClick={onNavigate}
          className={cn("flex items-center gap-2.5 rounded-full", itemFocus, collapsed && "justify-center")}
        >
          <Logo size={32} className="shrink-0" />
          {!collapsed && (
            <span className="font-display text-2xl leading-none tracking-tight text-[#f4efe6]">
              Orion{isAdmin ? <span className="ml-1 text-aurora"> Admin</span> : null}
            </span>
          )}
        </Link>
      </div>

      {/* Organisation */}
      {!isAdmin && (
        <div className={cn("pb-3", collapsed ? "px-2.5" : "px-3")}>
          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            title={collapsed ? startupName : undefined}
            aria-label={collapsed ? `${startupName} settings` : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-[20px] bg-white/[0.05] transition-colors hover:bg-white/[0.09]",
              itemFocus,
              collapsed ? "mx-auto h-11 w-11 justify-center" : "p-2.5"
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aurora/15 text-aurora">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-[#f4efe6]">{startupName}</span>
                <span className="block truncate text-xs text-[#9fb0a9]">{stage}</span>
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav
        aria-label="Main"
        className={cn("flex-1 space-y-1 overflow-y-auto py-2", collapsed ? "px-2.5" : "px-3")}
      >
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f918a]">
            Workspace
          </p>
        )}
        {navItems.map((item) => (
          <NavPill
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={activeHref === item.href}
            count={counts?.[item.href]}
            collapsed={collapsed}
            onClick={onNavigate}
            linkComponent={Link}
          />
        ))}
      </nav>

      {/* User */}
      <div className={cn("pt-3", collapsed ? "px-2.5" : "px-3")}>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          title={collapsed ? user.name : undefined}
          aria-label={collapsed ? `${user.name} — account settings` : undefined}
          className={cn(
            "flex items-center gap-3 rounded-full transition-colors hover:bg-white/[0.07]",
            itemFocus,
            collapsed ? "mx-auto h-11 w-11 justify-center" : "p-1.5 pr-3"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-semibold text-ink">
            {getInitials(user.name)}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-[#f4efe6]">{user.name}</span>
              <span className="block truncate text-xs text-[#9fb0a9]">{user.email}</span>
            </span>
          )}
        </Link>
      </div>
    </>
  );
}
