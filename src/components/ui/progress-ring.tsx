import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps extends React.SVGProps<SVGSVGElement> {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "teal" | "success" | "warning" | "destructive";
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  variant = "primary",
  className,
  ...props
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("rotate-[-90deg]", className)}
      {...props}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-[#E5EEFE] dark:text-[#1E2B4A]"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
        className={cn(
          "transition-all duration-500 ease-out",
          variant === "primary" && "text-primary",
          variant === "teal" && "text-teal",
          variant === "success" && "text-success",
          variant === "warning" && "text-warning",
          variant === "destructive" && "text-destructive",
        )}
      />
    </svg>
  );
}

