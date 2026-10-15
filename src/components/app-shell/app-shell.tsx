import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  user: { email: string | null | undefined };
  /** The school or company the person works for, shown above the menu. */
  org?: { name: string; verified?: boolean };
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
            <p className="truncate text-sm font-medium text-foreground" title={org.name}>
              {org.name}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{roleLabel}</span>
              {org.verified === true && <Badge variant="verified">Verified</Badge>}
              {org.verified === false && <Badge variant="pending">Waiting</Badge>}
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

        <p className="mt-auto p-5 text-xs leading-5 text-muted-foreground">
          Signed in as a {roleLabel.toLowerCase()}.
        </p>
      </aside>

      <div className="min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-8">
          <MobileNav items={items} active={active} counts={counts} roleLabel={roleLabel} />

          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList className="flex-nowrap">
              {crumbs.map((c) => (
                <Fragment key={c.label}>
                  <BreadcrumbItem className="hidden sm:inline-flex">
                    {c.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={c.href}>{c.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                </Fragment>
              ))}
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggleButton2 />
            {email && <UserMenu email={email} role={roleLabel} />}
          </div>
        </header>

        {/* Page */}
        <main
          className={cn(
            "mx-auto flex w-full flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8",
            wide ? "max-w-[1440px]" : "max-w-6xl",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] leading-9 text-foreground">{title}</h1>
              {description && (
                <p className="mt-1 max-w-prose text-sm leading-6 text-muted-foreground">
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
