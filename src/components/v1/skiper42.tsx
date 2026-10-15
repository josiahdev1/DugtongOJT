"use client";

import { Check, Clipboard, Code2, LockKeyhole, Menu, Music2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

type IconProps = { className?: string };

function IconButton({ className, label, children, onClick }: IconProps & { label: string; children: React.ReactNode; onClick?: () => void }) {
  const reducedMotion = useReducedMotion();
  return <motion.button type="button" aria-label={label} onClick={onClick} whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.94 }} transition={{ duration: 0.16 }} className={cn("inline-flex size-10 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>{children}</motion.button>;
}

export function CopyIcon({ copyText, className }: IconProps & { copyText: string }) {
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion();
  async function copy() { await navigator.clipboard.writeText(copyText); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  return <IconButton label={copied ? "Copied" : "Copy to clipboard"} className={className} onClick={copy}><motion.span animate={reducedMotion ? undefined : { rotate: copied ? [0, -8, 0] : 0 }} transition={{ duration: 0.2 }}>{copied ? <Check className="size-4 text-success" /> : <Clipboard className="size-4" />}</motion.span></IconButton>;
}

export function SpinnerIcon({ color = "currentColor", size = 18, className }: IconProps & { color?: string; size?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.span role="status" aria-label="Loading" animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} className={cn("inline-flex", className)}><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round" /></svg></motion.span>;
}

export function SideBarIcon(props: IconProps) { return <IconButton label="Open navigation" {...props}><Menu className="size-5" /></IconButton>; }
export function LockSourceButton(props: IconProps) { return <IconButton label="Restricted source" {...props}><LockKeyhole className="size-4" /></IconButton>; }
export function MusicIcon(props: IconProps) { const [playing, setPlaying] = useState(false); const reducedMotion = useReducedMotion(); return <IconButton label={playing ? "Pause music" : "Play music"} onClick={() => setPlaying(!playing)} {...props}><motion.span animate={playing && !reducedMotion ? { rotate: 360 } : undefined} transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}><Music2 className="size-4" /></motion.span></IconButton>; }
export function SourceButton({ href, className }: IconProps & { href?: string }) { const reducedMotion = useReducedMotion(); return href ? <motion.a href={href} target="_blank" rel="noreferrer" whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.96 }} className={cn("inline-flex h-10 items-center gap-2 rounded-[8px] border border-border px-3 text-sm font-medium transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}><Code2 className="size-4" />Source</motion.a> : <IconButton label="Source link unavailable" className={cn("cursor-not-allowed opacity-50", className)}><Code2 className="size-4" /></IconButton>; }
