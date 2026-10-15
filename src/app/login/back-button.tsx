"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  variant?: "brand" | "surface";
}

export function BackButton({ className, variant = "surface" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-[8px] px-2.5 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "brand"
          ? "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-primary-soft focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-popover"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-surface dark:focus-visible:ring-offset-background",
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}

