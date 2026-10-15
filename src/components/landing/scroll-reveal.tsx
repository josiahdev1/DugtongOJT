"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Fades children in when they scroll into view. 150ms opacity, CSS-driven. */
export function RevealOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("visible");
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/** Max ±8 px vertical parallax. Respects prefers-reduced-motion. */
export function ParallaxWrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      el.style.transform = `translateY(${((t - 0.5) * 16).toFixed(1)}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

