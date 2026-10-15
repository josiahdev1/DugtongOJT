import {
  Briefcase,
  Building2,
  ClipboardCheck,
  Clock,
  Flag,
  Handshake,
  LayoutDashboard,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from "lucide-react";

export type Role = "coordinator" | "student" | "supervisor" | "company" | "admin";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ROLE_LABEL: Record<Role, string> = {
  coordinator: "Coordinator",
  student: "Student",
  supervisor: "Supervisor",
  company: "Company",
  admin: "Dugtong admin",
};

// What each kind of person can reach from the sidebar. Only links that go
// somewhere real: no placeholders.
export const NAV: Record<Role, NavItem[]> = {
  coordinator: [
    { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { key: "roster", label: "Roster", href: "/roster/upload", icon: Upload },
    { key: "companies", label: "Companies", href: "/companies", icon: Building2 },
    { key: "partnerships", label: "Partnerships", href: "/partnerships", icon: Handshake },
    { key: "reports", label: "Reports", href: "/reports", icon: Flag },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  student: [
    { key: "hours", label: "My hours", href: "/my-hours", icon: Clock },
    { key: "report", label: "Report a problem", href: "/report", icon: Flag },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  supervisor: [
    { key: "approvals", label: "Approvals", href: "/supervisor", icon: ClipboardCheck },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  company: [
    { key: "company", label: "Company", href: "/company", icon: Building2 },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  admin: [
    { key: "admin", label: "Admin", href: "/admin", icon: ShieldCheck },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
};
