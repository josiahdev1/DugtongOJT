"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import {
  Award,
  Clock,
  FileCheck,
  FileText,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpatialShowcaseBadge {
  icon: LucideIcon | ComponentType<{ className?: string }>;
  text: string;
}

export interface SpatialShowcaseCardProps {
  topLeftBadge: SpatialShowcaseBadge;
  avatarIcon: LucideIcon | ComponentType<{ className?: string }>;
  statusLabel?: string;
  name: string;
  subLabel: string;
  bottomLeftBadge: SpatialShowcaseBadge;
  counterText: string;
  activeIndex: number;
  totalSlides: number;
  accentColor: string;
  onDotClick: (index: number) => void;
}

const GRADIENTS = [
  // Slide 1 (blue)
  "radial-gradient(circle at 50% 25%, rgba(37,99,235,0.48) 0%, rgba(30,64,175,0.28) 45%, rgba(4,8,22,0.98) 85%)",
  // Slide 2 (teal)
  "radial-gradient(circle at 50% 25%, rgba(14,165,165,0.48) 0%, rgba(8,90,90,0.28) 45%, rgba(4,12,16,0.98) 85%)",
  // Slide 3 (indigo)
  "radial-gradient(circle at 50% 25%, rgba(99,102,241,0.45) 0%, rgba(67,56,202,0.26) 45%, rgba(6,6,22,0.98) 85%)",
];

export function SpatialShowcaseCard({
  topLeftBadge,
  avatarIcon: AvatarIcon,
  statusLabel = "ACTIVE",
  name,
  subLabel,
  bottomLeftBadge,
  counterText,
  activeIndex,
  totalSlides,
  accentColor,
  onDotClick,
}: SpatialShowcaseCardProps) {
  const TopLeftIcon = topLeftBadge.icon;
  const BottomLeftIcon = bottomLeftBadge.icon;

  // Track slide content key for smooth opacity cross-fade
  const [contentVisible, setContentVisible] = useState(true);
  const prevIndexRef = useRef(activeIndex);

  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      setContentVisible(false);
      const timer = setTimeout(() => {
        setContentVisible(true);
        prevIndexRef.current = activeIndex;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  return (
    <>
      <style>{`
        @keyframes online-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.65);
            opacity: 0.25;
          }
        }
        .animate-online-ring {
          animation: online-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-online-ring {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={cn(
          "group relative flex w-full max-w-[484px] lg:max-w-[492px] flex-col justify-between overflow-hidden",
          "h-[370px] sm:h-[400px] lg:h-[420px] rounded-3xl p-6 sm:p-7.5",
          "border border-white/15 bg-black/45 backdrop-blur-3xl saturate-150",
          "shadow-[0_12px_36px_rgba(0,0,0,0.40)]",
          "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_16px_44px_rgba(0,0,0,0.50)]",
          "motion-reduce:transform-none motion-reduce:transition-none"
        )}
      >
        {/* Layered radial gradient backgrounds for smooth 500ms cross-fading */}
        {GRADIENTS.map((bg, index) => (
          <div
            key={bg}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out",
              "motion-reduce:transition-none",
              activeIndex === index ? "opacity-100" : "opacity-0"
            )}
            style={{ background: bg }}
          />
        ))}

        {/* TOP ROW */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Top-left: Dugtong logo mark + category badge */}
          <div className="flex items-center gap-2">
            <Image
              src="/dugtong-logo-mark.png"
              alt="Dugtong"
              width={26}
              height={26}
              priority
              className="size-6 object-contain shrink-0"
            />
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 shadow-sm backdrop-blur-md">
              <TopLeftIcon
                className="size-3.5 shrink-0"
                style={{ color: accentColor }}
                aria-hidden="true"
              />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-white/90">
                {topLeftBadge.text}
              </span>
            </div>
          </div>

          {/* Pagination dots */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Showcase slides"
          >
            {Array.from({ length: totalSlides }).map((_, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${index + 1} of ${totalSlides}`}
                  onClick={() => onDotClick(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                    isActive
                      ? "w-6 bg-white shadow-sm"
                      : "w-2 bg-white/35 hover:bg-white/60"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div
          className={cn(
            "relative z-10 flex flex-col items-center justify-center text-center",
            "transition-opacity duration-300 ease-out",
            "motion-reduce:transition-none",
            contentVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Avatar container (126px diameter) */}
          <div className="relative mb-3.5 flex size-[116px] sm:size-[126px] lg:size-[134px] items-center justify-center">
            {/* Dynamic accent glow behind avatar */}
            <div
              className="pointer-events-none absolute -inset-3 rounded-full blur-2xl transition-opacity duration-500 ease-out"
              style={{
                backgroundColor: accentColor,
                opacity: 0.42,
              }}
              aria-hidden="true"
            />

            <div
              className={cn(
                "relative flex size-full items-center justify-center rounded-full",
                "border-2 border-white/40 bg-white/5 backdrop-blur-md",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                "transition-transform duration-500 ease-out group-hover:scale-105",
                "motion-reduce:transform-none motion-reduce:transition-none"
              )}
            >
              <AvatarIcon
                className="size-12 sm:size-14 transition-transform duration-300"
                style={{ color: accentColor }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Status row: Green pulsing dot + ACTIVE */}
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="relative flex size-2.5 items-center justify-center">
              <span
                className="animate-online-ring pointer-events-none absolute size-2.5 rounded-full border border-emerald-500/60 bg-emerald-500/25"
                aria-hidden="true"
              />
              <span
                className="relative size-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"
                aria-hidden="true"
              />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400 dark:text-emerald-300">
              {statusLabel}
            </span>
          </div>

          {/* Primary name */}
          <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white drop-shadow-sm">
            {name}
          </h3>

          {/* Sublabel */}
          <p className="mt-1.5 max-w-[320px] text-sm leading-relaxed text-slate-300">
            {subLabel}
          </p>
        </div>

        {/* BOTTOM ROW */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3.5">
          {/* Bottom-left badge */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
            <BottomLeftIcon
              className="size-3.5 shrink-0 text-white/75"
              aria-hidden="true"
            />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.06em] text-white/85">
              {bottomLeftBadge.text}
            </span>
          </div>

          {/* Counter */}
          <span className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] tabular-nums text-primary-soft">
            {counterText}
          </span>
        </div>
      </div>
    </>
  );
}

// 3 Core Slides from the original design
const SLIDES = [
  {
    topLeftBadge: { icon: Smartphone, text: "TRACK" },
    avatarIcon: Clock,
    statusLabel: "ACTIVE",
    name: "Log your hours",
    subLabel: "From your phone, on site or remote",
    bottomLeftBadge: { icon: MapPin, text: "ON SITE & REMOTE" },
    counterText: "01 / 03",
    accentColor: "#2563EB", // Dugtong blue
  },
  {
    topLeftBadge: { icon: UserCheck, text: "APPROVE" },
    avatarIcon: UserCheck,
    statusLabel: "ACTIVE",
    name: "Approved by your supervisor",
    subLabel: "One tap on their end, nothing to print",
    bottomLeftBadge: { icon: FileCheck, text: "NO PAPER SLIPS" },
    counterText: "02 / 03",
    accentColor: "#0EA5A5", // Dugtong teal
  },
  {
    topLeftBadge: { icon: FileText, text: "REPORT" },
    avatarIcon: Award,
    statusLabel: "ACTIVE",
    name: "Reports and certificates",
    subLabel: "One click when the hours are met",
    bottomLeftBadge: { icon: ShieldCheck, text: "AUDIT READY" },
    counterText: "03 / 03",
    accentColor: "#6366F1", // Dugtong indigo
  },
];

export function SpatialShowcaseSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentSlide = SLIDES[activeIndex];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Key features"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="w-full"
    >
      <SpatialShowcaseCard
        {...currentSlide}
        activeIndex={activeIndex}
        totalSlides={SLIDES.length}
        onDotClick={(index) => setActiveIndex(index)}
      />
    </div>
  );
}

// Backward-compatible alias
export const DynamicRoleShowcase = SpatialShowcaseSlider;
export default SpatialShowcaseSlider;
