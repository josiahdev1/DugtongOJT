import Image from "next/image";
import Link from "next/link";
import { Building2, Flag, Handshake, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

type RoleShellProps = {
  children: React.ReactNode;
  active: "dashboard" | "hours" | "companies" | "students" | "partnerships" | "reports";
  role: "Coordinator" | "Student";
  title: string;
  subtitle: string;
  action?: React.ReactNode;
};

export function RoleShell({ children, active, role, title, subtitle, action }: RoleShellProps) {
  const links = role === "Coordinator"
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
        { href: "/companies", label: "Partners", icon: Building2, key: "companies" },
        { href: "/roster/upload", label: "Students", icon: Users, key: "students" },
        { href: "/partnerships", label: "Partnerships", icon: Handshake, key: "partnerships" },
        { href: "/reports", label: "Reports", icon: Flag, key: "reports" },
      ]
    : [{ href: "/my-hours", label: "My hours", icon: LayoutDashboard, key: "hours" }];

  return (
    <div className="min-h-full bg-background lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-surface p-4 lg:flex lg:flex-col">
        <Image src="/dugtong-ojt-logo.png" alt="Dugtong OJT" width={260} height={70} className="dugtong-logo-light h-auto w-36" />
        <Image src="/dugtong-ojt-logo-dark.png" alt="Dugtong OJT" width={260} height={70} className="dugtong-logo-dark h-auto w-36" />
        <p className="mt-8 px-3 text-xs font-medium text-muted-foreground">{role} workspace</p>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Workspace navigation">
          {links.map(({ href, label, icon: Icon, key }) => (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover", active === key ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>
        <form action={signOut} className="mt-auto"><Button type="submit" variant="ghost" className="w-full justify-start gap-3"><LogOut className="size-4" />Sign out</Button></form>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border px-4 py-4 lg:px-8">
          <div><p className="text-xs font-medium text-muted-foreground">{role} workspace</p><h1 className="mt-1 text-2xl font-medium tracking-tight">{title}</h1><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div>
          <div className="flex shrink-0 items-center gap-2">{action}<form action={signOut} className="lg:hidden"><Button type="submit" variant="ghost" size="sm" aria-label="Sign out"><LogOut className="size-4" /></Button></form></div>
        </header>
        {children}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card p-2 lg:hidden" aria-label="Workspace navigation">
        {links.map(({ href, label, icon: Icon, key }) => <Link key={href} href={href} className={cn("flex flex-1 flex-col items-center gap-1 rounded-[8px] py-2 text-xs font-medium", active === key ? "bg-primary/10 text-primary" : "text-muted-foreground")}><Icon className="size-4" aria-hidden="true" />{label}</Link>)}
      </nav>
    </div>
  );
}
