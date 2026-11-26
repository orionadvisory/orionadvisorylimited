"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Settings, LogOut, Building2, User } from "lucide-react";
import { logOut } from "@/app/actions/auth";
import { MobileMenuButton, useSidebar } from "@/components/layout/sidebar";

interface TopbarProps {
  title: string;
  subtitle?: string;
  userInitials?: string;
  userName?: string;
  userEmail?: string;
  startupName?: string;
  startupStage?: string | null;
}

const stageLabels: Record<string, string> = {
  idea: "Idea stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth: "Growth",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const menuItem =
  "focus-ring flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors";

export function Topbar({
  title,
  subtitle,
  userInitials,
  userName,
  userEmail,
  startupName,
  startupStage,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useSidebar();

  const resolvedName = userName || userInfo?.name || "User";
  const resolvedEmail = userEmail || userInfo?.email || "";
  const resolvedInitials = userInitials || getInitials(resolvedName);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-20 bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-12 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{title}</p>
            {subtitle && (
              <p className="mt-0.5 hidden truncate text-xs text-mist sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:bg-canvas"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-ember" aria-hidden="true" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label={`Account menu for ${resolvedName}`}
              aria-haspopup="menu"
              aria-expanded={open}
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-[#f4efe6] transition-colors hover:bg-ink-raised"
            >
              {resolvedInitials}
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-72 rounded-bento-sm border border-line bg-white p-2 shadow-bento-lift"
              >
                <div className="flex items-center gap-3 rounded-2xl bg-canvas p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-[#f4efe6]">
                    {resolvedInitials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{resolvedName}</p>
                    <p className="truncate text-xs text-mist">{resolvedEmail}</p>
                  </div>
                </div>

                {startupName && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">{startupName}</p>
                      {startupStage && (
                        <p className="truncate text-xs text-mist">
                          {stageLabels[startupStage] || startupStage}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-1 border-t border-line pt-1">
                  <Link
                    role="menuitem"
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className={`${menuItem} text-ink-soft hover:bg-canvas`}
                  >
                    <User className="h-3.5 w-3.5 text-mist" aria-hidden="true" />
                    Profile
                  </Link>
                  <Link
                    role="menuitem"
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className={`${menuItem} text-ink-soft hover:bg-canvas`}
                  >
                    <Settings className="h-3.5 w-3.5 text-mist" aria-hidden="true" />
                    Settings
                  </Link>
                </div>

                <div className="mt-1 border-t border-line pt-1">
                  <form action={logOut}>
                    <button
                      role="menuitem"
                      type="submit"
                      className={`${menuItem} text-ember-deep hover:bg-ember-soft`}
                    >
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
