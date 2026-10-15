"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV, type Role } from "./nav";

// The sidebar for phones and tablets: a drawer opened from the top bar.
export function MobileNav({
  role,
  active,
  counts,
  roleLabel,
}: {
  role: Role;
  active: string;
  counts?: Partial<Record<string, number>>;
  roleLabel: string;
}) {
  // The server cannot pass icon components to the browser, only plain data,
  // so this component looks up the links (and their icons) from the role.
  const items = NAV[role];
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex size-9 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Pages you can open as a {roleLabel.toLowerCase()}.
          </SheetDescription>
          <Image
            src="/dugtong-ojt-logo.png"
            alt="Dugtong OJT"
            width={260}
            height={70}
            className="dugtong-logo-light h-auto w-36"
          />
          <Image
            src="/dugtong-ojt-logo-dark.png"
            alt="Dugtong OJT"
            width={260}
            height={70}
            className="dugtong-logo-dark h-auto w-36"
          />
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label="Main">
          {items.map(({ key, label, href, icon: Icon }) => (
            <SheetClose asChild key={key}>
              <Link
                href={href}
                aria-current={active === key ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-colors",
                  active === key
                    ? "bg-accent text-foreground"
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
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
