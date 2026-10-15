import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggleButton2 } from "@/components/v1/skiper4";

// The top bar for pages anyone can open: the landing page, the openings
// board and the sign-in page. (Signed-in screens use the app shell.)
export function PublicHeader({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 lg:px-8">
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

        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 sm:flex">
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
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
