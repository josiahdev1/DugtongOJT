"use client";

import {
  Building2,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function initials(email: string) {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

function formatName(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return "User";
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function RoleBadgeIcon({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  const lower = role.toLowerCase();
  if (lower.includes("admin")) return <Shield className={className} aria-hidden="true" />;
  if (lower.includes("coordinator")) return <Users className={className} aria-hidden="true" />;
  if (lower.includes("supervisor") || lower.includes("company"))
    return <Building2 className={className} aria-hidden="true" />;
  return <GraduationCap className={className} aria-hidden="true" />;
}

export function UserMenu({
  email,
  role,
  name,
}: {
  email: string;
  role: string;
  name?: string;
}) {
  const displayName = name || formatName(email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex h-9 items-center gap-2 rounded-[8px] border border-border bg-card pl-1.5 pr-2.5 text-sm transition-colors",
          "hover:bg-surface-hover cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[state=open]:bg-surface-hover"
        )}
        aria-label="Account menu"
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-trust-bg text-xs font-medium text-trust-text">
            {initials(email)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[calc(100vw-32px)] sm:w-[280px] rounded-xl border border-border p-1",
          "bg-surface dark:bg-popover text-foreground",
          "shadow-[0_8px_24px_rgba(15,23,42,.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,.4)]",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150 ease-out"
        )}
      >
        {/* 1. User info block (not clickable) */}
        <div className="flex items-center gap-3 p-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-trust-bg text-xs font-semibold text-trust-text">
              {initials(email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p
              className="truncate text-xs text-muted-foreground"
              title={email}
            >
              {email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 border-t border-border" />

        {/* 2. Role row */}
        <div className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] text-foreground hover:bg-surface-hover transition-colors">
          <RoleBadgeIcon role={role} className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{role}</span>
        </div>

        <DropdownMenuSeparator className="my-1 border-t border-border" />

        {/* 3. Actions */}
        <div className="flex flex-col gap-0.5">
          <DropdownMenuItem
            asChild
            className="flex h-9 cursor-pointer items-center gap-2.5 rounded-[8px] px-3 text-sm text-foreground hover:bg-surface-hover focus:bg-surface-hover"
          >
            <Link href="/admin/settings">
              <Settings className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>Account settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="flex h-9 cursor-pointer items-center gap-2.5 rounded-[8px] px-3 text-sm text-foreground hover:bg-surface-hover focus:bg-surface-hover"
          >
            <a
              href="mailto:support@dugtong.ph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HelpCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>Help & support</span>
            </a>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1 border-t border-border" />

        {/* 4. Sign out */}
        <form action={signOut}>
          <DropdownMenuItem
            asChild
            onSelect={(e) => e.preventDefault()}
            className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-3 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
          >
            <button type="submit" className="w-full flex items-center gap-2.5">
              <LogOut className="size-4 shrink-0 text-destructive" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
