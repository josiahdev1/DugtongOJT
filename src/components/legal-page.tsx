import Link from "next/link";
import { PublicHeader } from "@/components/public-header";

// The shared frame for the Privacy Notice and the Terms. Headings, lists
// and paragraphs inside are styled here, so the pages can be plain text.
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 lg:px-8">
        <h1 className="text-3xl text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <p className="mt-6 text-base leading-7 text-foreground">{intro}</p>

        <div
          className={
            "mt-8 text-sm leading-7 text-foreground " +
            "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-foreground " +
            "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5 " +
            "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4"
          }
        >
          {children}
        </div>

        <nav
          aria-label="Legal"
          className="mt-12 flex gap-5 border-t border-border pt-6 text-sm text-muted-foreground"
        >
          <Link href="/privacy" className="hover:text-foreground">Privacy Notice</Link>
          <Link href="/terms" className="hover:text-foreground">Terms of Use</Link>
          <Link href="/" className="hover:text-foreground">Home</Link>
        </nav>
      </main>
    </div>
  );
}
