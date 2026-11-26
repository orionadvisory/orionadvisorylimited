"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface UserInfo {
  name: string;
  email: string;
}

interface SidebarState {
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  userInfo: UserInfo | null;
}

const SidebarContext = createContext<SidebarState>({
  open: false,
  setOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
  userInfo: null,
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  // The mobile drawer remembers the path it was opened on; navigating anywhere
  // else closes it automatically — no effect (and no extra render) required.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const open = openOnPath !== null && openOnPath === pathname;
  const setOpen = useCallback(
    (v: boolean) => setOpenOnPath(v ? pathname : null),
    [pathname]
  );

  const value = useMemo(
    () => ({
      open,
      setOpen,
      collapsed,
      setCollapsed,
      userInfo: userName ? { name: userName, email: userEmail || "" } : null,
    }),
    [open, setOpen, collapsed, userName, userEmail]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
