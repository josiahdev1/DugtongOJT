"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Link2, Search } from "lucide-react";
import { ThemeToggleButton2 } from "@/components/v1/skiper4";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { NAV } from "@/components/app-shell/nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { cn } from "@/lib/utils";

const ADMIN_PAGES: Record<string, { key: string; label: string }> = {
  "/admin": { key: "overview", label: "Overview" },
  "/admin/schools": { key: "schools", label: "Schools" },
  "/admin/companies": { key: "companies", label: "Companies" },
  "/admin/verifications": { key: "verifications", label: "Verifications" },
  "/admin/escalations": { key: "escalations", label: "Escalations" },
  "/admin/users": { key: "users", label: "Users" },
  "/admin/audit-log": { key: "audit-log", label: "Audit log" },
  "/admin/settings": { key: "settings", label: "Settings" },
};

export function AdminShell({
  user,
  counts,
  wide = true,
  children,
}: {
  user: { email?: string | null };
  counts?: Partial<Record<string, number>>;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  let current = ADMIN_PAGES[pathname];
  if (!current) {
    if (pathname.startsWith("/admin/verifications")) current = ADMIN_PAGES["/admin/verifications"];
    else if (pathname.startsWith("/admin/escalations")) current = ADMIN_PAGES["/admin/escalations"];
    else if (pathname.startsWith("/admin/schools")) current = ADMIN_PAGES["/admin/schools"];
    else if (pathname.startsWith("/admin/companies")) current = ADMIN_PAGES["/admin/companies"];
    else if (pathname.startsWith("/admin/users")) current = ADMIN_PAGES["/admin/users"];
    else if (pathname.startsWith("/admin/audit-log")) current = ADMIN_PAGES["/admin/audit-log"];
    else if (pathname.startsWith("/admin/settings")) current = ADMIN_PAGES["/admin/settings"];
    else current = { key: "overview", label: "Overview" };
  }

  const email = user.email ?? "";
  const hasUnread = Boolean(counts && Object.values(counts).some((c) => (c ?? 0) > 0));

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Sidebar (desktop) */}
      <aside className="hidden border-r border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="p-5 pb-4">
          <Link href="/" aria-label="Dugtong OJT home">
            <Image
              src="/dugtong-ojt-logo.png"
              alt="Dugtong OJT"
              width={260}
              height={70}
              priority
              className="dugtong-logo-light h-auto w-36"
            />
            <Image
              src="/dugtong-ojt-logo-dark.png"
              alt="Dugtong OJT"
              width={260}
              height={70}
              priority
              className="dugtong-logo-dark h-auto w-36"
            />
          </Link>
        </div>

        <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
          {NAV.admin.map(({ key, label, href, icon: Icon }) => {
            const isActive = current.key === key;
            return (
              <Link
                key={key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {counts?.[key] ? (
                  <span className="rounded-full bg-warning-bg px-2 text-xs font-medium tabular-nums text-warning-text">
                    {counts[key]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        {/* Top bar — 64px desktop / 56px mobile, sticky z-10 */}
        <header className="sticky top-0 z-10 flex h-14 lg:h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 lg:px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
          {/* Left side: MobileNav + Desktop Logo Mark + Breadcrumb */}
          <div className="flex min-w-0 items-center gap-3">
            <MobileNav
              role="admin"
              active={current.key}
              counts={counts}
              roleLabel="Dugtong admin"
            />

            <div
              className="hidden lg:flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground shadow-xs"
              aria-hidden="true"
            >
              <Link2 className="size-3.5" />
            </div>

            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="hidden sm:inline-flex items-center">
                  <Link
                    href="/admin"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Admin
                  </Link>
                </li>
                <li
                  className="hidden sm:inline-flex text-muted-foreground/40"
                  aria-hidden="true"
                >
                  /
                </li>
                <li className="min-w-0 truncate font-medium text-foreground">
                  {current.label}
                </li>
              </ol>
            </nav>
          </div>

          {/* Center: Search input (desktop only, max-w-[280px]) */}
          <div className="hidden md:flex items-center relative w-full max-w-[280px]">
            <Search
              className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search schools, companies, IDs"
              className="h-9 w-full rounded-[8px] border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>

          {/* Right side: Bell + Theme toggle + User menu */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="relative inline-flex size-9 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="size-4" aria-hidden="true" />
              {hasUnread && (
                <span
                  className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background"
                  aria-hidden="true"
                />
              )}
            </button>
            <ThemeToggleButton2 />
            {email && <UserMenu email={email} role="Dugtong admin" />}
          </div>
        </header>

        {/* Page content column: space-maximizing, centered horizontally */}
        <main
          className={cn(
            "mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8",
            wide ? "max-w-[1360px]" : "max-w-[1200px]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

