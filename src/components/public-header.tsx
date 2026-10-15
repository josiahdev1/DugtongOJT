"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggleButton2 } from "@/components/v1/skiper4";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function PublicHeader({ signedIn = false }: { signedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 lg:px-8">
        <Link href="/" aria-label="Dugtong OJT home" className="shrink-0">
          <Image
            src="/dugtong-ojt-logo.png"
            alt="Dugtong OJT"
            width={260}
            height={70}
            priority
            className="dugtong-logo-light h-auto w-32"
          />
          <Image
            src="/dugtong-ojt-logo-dark.png"
            alt="Dugtong OJT"
            width={260}
            height={70}
            priority
            className="dugtong-logo-dark h-auto w-32"
          />
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 lg:flex">
          <Link
            href="/listings"
            className="rounded-[8px] px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            OJT openings
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggleButton2 />
          {signedIn ? (
            <Link href="/" className={buttonVariants({ size: "sm" })}>
              Go to my account
            </Link>
          ) : (
            <>
              {/* Phones get these inside the drawer, so the bar stays uncrowded. */}
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "hidden lg:inline-flex",
                })}
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className={buttonVariants({
                  size: "sm",
                  className: "hidden lg:inline-flex",
                })}
              >
                Create account
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="inline-flex size-9 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
              aria-label="Open navigation"
            >
              {mobileOpen ? (
                <X className="size-4" aria-hidden="true" />
              ) : (
                <Menu className="size-4" aria-hidden="true" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 gap-0 p-0">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link href="/" aria-label="Dugtong OJT home" className="flex items-center">
                <Image
                  src="/dugtong-ojt-logo.png"
                  alt="Dugtong OJT"
                  width={260}
                  height={70}
                  className="dugtong-logo-light h-auto w-28"
                />
                <Image
                  src="/dugtong-ojt-logo-dark.png"
                  alt="Dugtong OJT"
                  width={260}
                  height={70}
                  className="dugtong-logo-dark h-auto w-28"
                />
              </Link>
              <SheetClose asChild>
                <button
                  className="inline-flex size-9 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:bg-surface-hover"
                  aria-label="Close navigation"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </SheetClose>
            </div>
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
              <Link
                href="/listings"
                className="rounded-[8px] px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                OJT openings
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", className: "w-full justify-center" })}
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className={buttonVariants({ className: "w-full justify-center" })}
              >
                Create account
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}