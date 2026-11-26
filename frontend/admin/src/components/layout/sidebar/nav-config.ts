import {
  LayoutDashboard,
  Sparkles,
  GitBranch,
  FileText,
  Package,
  Settings,
  Users,
  Shield,
  UserCog,
  ClipboardList,
  Inbox,
  Building2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: "member" | "admin";
    status: "active" | "suspended";
  };
  startup: { name: string; stage: string | null } | null;
  /** Optional count badges keyed by nav href, e.g. { "/dashboard": 3 }. */
  counts?: Partial<Record<string, number>>;
}

export const memberNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
  { label: "Workflows", href: "/dashboard/workflows", icon: GitBranch },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Expert Help", href: "/dashboard/referrals", icon: Users },
  { label: "Services", href: "/dashboard/services", icon: Package },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Shield, exact: true },
  { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
  { label: "Manage Users", href: "/admin/users", icon: UserCog },
  { label: "Assessments", href: "/admin/assessments", icon: ClipboardList, exact: true },
  { label: "Submissions", href: "/admin/assessments/submissions", icon: Inbox },
  { label: "Organizations", href: "/admin/partners", icon: Building2 },
];

export const stageLabels: Record<string, string> = {
  idea: "Idea stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth: "Growth",
};

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Longest-prefix match so nested routes highlight their parent item. */
export function getBestMatch(pathname: string, items: NavItem[]): string | null {
  let best: NavItem | null = null;
  for (const item of items) {
    if (item.exact && pathname === item.href) return item.href;
    if (!item.exact && (pathname === item.href || pathname.startsWith(item.href + "/"))) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  return best?.href ?? null;
}
