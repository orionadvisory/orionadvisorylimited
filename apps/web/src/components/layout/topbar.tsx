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

  // Use context user info as fallback when props aren't passed
  const resolvedName = userName || userInfo?.name || "User";
  const resolvedEmail = userEmail || userInfo?.email || "";
  const resolvedInitials = userInitials || getInitials(resolvedName);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="min-h-[4.25rem] border-b border-stone-200/70 bg-[#fffaf1]/90 px-4 py-3 shadow-sm shadow-stone-900/[0.03] backdrop-blur-xl md:px-6 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <div>
            <h1 className="text-base font-semibold text-stone-950">{title}</h1>
            {subtitle && <p className="text-xs text-stone-500 hidden sm:block mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-800 transition-colors shadow-sm shadow-stone-900/[0.03]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          </button>

          {/* Avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="w-9 h-9 rounded-full bg-[#17201c] flex items-center justify-center hover:bg-[#223129] transition-colors shadow-sm"
            >
              <span className="text-white text-xs font-semibold">{resolvedInitials}</span>
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-64 bg-white border border-stone-200/80 rounded-lg shadow-xl shadow-stone-900/10 py-2 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#17201c] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">{resolvedInitials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-950 truncate">{resolvedName}</p>
                    <p className="text-xs text-stone-500 truncate">{resolvedEmail}</p>
                  </div>
                </div>
              </div>

              {/* Startup info */}
              {startupName && (
                <div className="px-4 py-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-stone-950 truncate">{startupName}</p>
                      {startupStage && (
                        <p className="text-xs text-stone-500 truncate">
                          {stageLabels[startupStage] || startupStage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-400" />
                  Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-stone-100 py-1">
                <form action={logOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
