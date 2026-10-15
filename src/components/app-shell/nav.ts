import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  Clock,
  Flag,
  Handshake,
  History,
  LayoutDashboard,
  School,
  Send,
  Settings,
  ShieldCheck,
  Upload,
  Users,
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
    { key: "journal", label: "Journals", href: "/journal", icon: BookOpen },
    { key: "reports", label: "Reports", href: "/reports", icon: Flag },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  student: [
    { key: "hours", label: "My hours", href: "/my-hours", icon: Clock },
    { key: "journal", label: "My journal", href: "/my-journal", icon: BookOpen },
    { key: "applications", label: "My applications", href: "/my-applications", icon: Send },
    { key: "report", label: "Report a problem", href: "/report", icon: Flag },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  supervisor: [
    { key: "dashboard", label: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
    { key: "interns", label: "My interns", href: "/supervisor#interns", icon: Users },
    { key: "journals", label: "Journals", href: "/supervisor#journals", icon: BookOpen },
    { key: "attendance", label: "Attendance", href: "/supervisor#attendance", icon: Clock },
    { key: "evaluations", label: "Evaluations", href: "/supervisor#evaluations", icon: ClipboardCheck },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  company: [
    { key: "company", label: "Company", href: "/company", icon: Building2 },
    { key: "openings", label: "OJT openings", href: "/listings", icon: Briefcase },
  ],
  admin: [
    { key: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
    { key: "schools", label: "Schools", href: "/admin/schools", icon: School },
    { key: "companies", label: "Companies", href: "/admin/companies", icon: Building2 },
    { key: "verifications", label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
    { key: "escalations", label: "Escalations", href: "/admin/escalations", icon: AlertTriangle },
    { key: "users", label: "Users", href: "/admin/users", icon: Users },
    { key: "audit-log", label: "Audit log", href: "/admin/audit-log", icon: History },
    { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};
