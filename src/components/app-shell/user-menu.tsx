"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// "ana.reyes@school.edu" -> "AR". Initials only, never a photo.
function initials(email: string) {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

// The signed-in person: who they are, what they are, and the way out.
export function UserMenu({ email, role }: { email: string; role: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 items-center gap-2 rounded-[8px] border border-border bg-card pl-1.5 pr-2 text-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Account menu"
      >
        <Avatar className="size-6">
          <AvatarFallback className="bg-trust-bg text-[11px] font-medium text-trust-text">
            {initials(email)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="truncate text-sm font-medium text-foreground">{email}</span>
          <span className="text-xs text-muted-foreground">{role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
