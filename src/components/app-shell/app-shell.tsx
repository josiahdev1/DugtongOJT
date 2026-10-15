import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Bell, Link2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggleButton2 } from "@/components/v1/skiper4";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { NAV, ROLE_LABEL, type Role } from "./nav";
import { UserMenu } from "./user-menu";

export type Crumb = { label: string; href?: string };

type AppShellProps = {
  role: Role;
  /** Which sidebar item is the current page. */
  active: string;
  title: string;
  description?: string;
  /** Pages above this one, in order. The current page is the title. */
  crumbs?: Crumb[];
  /** Buttons for the page, shown beside the title. */
  actions?: React.ReactNode;
  user: { email?: string | null };
  /** The school or company the person works for, shown above the menu. */
  org?: { name: string; verified?: boolean; trustScore?: number };
  /** Small "needs attention" numbers shown beside a sidebar item. */
  counts?: Partial<Record<string, number>>;
  /** Pages with their own wide layout can drop the width limit. */
  wide?: boolean;
  children: React.ReactNode;
};

// The frame around every signed-in screen: a sidebar for where you can go,
// a top bar for where you are and who you are, and the page itself.
export function AppShell({
  role,
  active,
  title,
  description,
  crumbs = [],
  actions,
  user,
  org,
  counts,
  wide,
  children,
}: AppShellProps) {
  const items = NAV[role];
  const roleLabel = ROLE_LABEL[role];
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

        {org && (
          <div className="mx-3 mb-3 rounded-[8px] border border-border bg-card p-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {role === "supervisor" || role === "company" ? "Company" : "Institution"}
            </div>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground" title={org.name}>
              {org.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {org.verified === true && <Badge variant="verified">Verified</Badge>}
              {org.verified === false && <Badge variant="pending">Waiting</Badge>}
              {typeof org.trustScore === "number" && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">
                  {org.trustScore}
                </span>
              )}
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-0.5 px-3" aria-label="Main">
          {items.map(({ key, label, href, icon: Icon }) => {
            const isActive = active === key;
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
            <MobileNav role={role} active={active} counts={counts} roleLabel={roleLabel} />

            <div className="hidden lg:flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground shadow-xs" aria-hidden="true">
              <Link2 className="size-3.5" />
            </div>

            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-sm">
                {crumbs.length > 0 ? (
                  crumbs.map((c) => (
                    <Fragment key={c.label}>
                      <li className="hidden sm:inline-flex items-center">
                        {c.href ? (
                          <Link href={c.href} className="text-muted-foreground hover:text-foreground transition-colors">
                            {c.label}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{c.label}</span>
                        )}
                      </li>
                      <li className="hidden sm:inline-flex text-muted-foreground/40" aria-hidden="true">
                        /
                      </li>
                    </Fragment>
                  ))
                ) : role === "admin" && active !== "overview" ? (
                  <>
                    <li className="hidden sm:inline-flex items-center">
                      <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                        Admin
                      </Link>
                    </li>
                    <li className="hidden sm:inline-flex text-muted-foreground/40" aria-hidden="true">
                      /
                    </li>
                  </>
                ) : null}
                <li className="min-w-0 truncate font-medium text-foreground">
                  {title}
                </li>
              </ol>
            </nav>
          </div>

          {/* Center: Search input (desktop only, max-w-[280px]) */}
          <div className="hidden md:flex items-center relative w-full max-w-[280px]">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
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
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" aria-hidden="true" />
              )}
            </button>
            <ThemeToggleButton2 />
            {email && <UserMenu email={email} role={roleLabel} />}
          </div>
        </header>

        {/* Page content column: max-w-[1200px], centered horizontally (Rule 1) */}
        <main
          className={cn(
            "mx-auto flex w-full flex-col gap-8 px-4 py-8 lg:px-8 lg:py-8",
            wide ? "max-w-[1440px]" : "max-w-[1200px]",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] font-semibold leading-9 tracking-tight text-foreground">{title}</h1>
              {description && (
                <p className="mt-1 max-w-[65ch] text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
