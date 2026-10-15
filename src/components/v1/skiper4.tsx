"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type ThemeToggleButtonProps = {
  className?: string;
};

// The theme lives on the page itself: a "dark" class on <html>. A small
// script in the root layout sets it before the first paint from the saved
// choice, so the page never flashes the wrong theme. This button just reads
// that class and flips it.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const readTheme = () => document.documentElement.classList.contains("dark");
// What the server renders (it cannot know the saved choice): light.
const serverTheme = () => false;

export function ThemeToggleButton2({ className }: ThemeToggleButtonProps) {
  const isDark = useSyncExternalStore(subscribe, readTheme, serverTheme);

  function toggleTheme() {
    const dark = !isDark;
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Private browsing can refuse storage; the toggle still works this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Use light mode" : "Use dark mode"}
      aria-pressed={isDark}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
