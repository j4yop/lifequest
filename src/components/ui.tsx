"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** JRPG menu window — the core surface. */
export function Window({
  children,
  className = "",
  bright = false,
  as: Tag = "section",
  title,
}: {
  children: ReactNode;
  className?: string;
  bright?: boolean;
  as?: "section" | "div" | "aside" | "article";
  title?: string;
}) {
  return (
    <Tag
      className={`jrpg-window ${bright ? "jrpg-window-bright" : ""} ${className}`}
      {...(title ? { "aria-label": title } : {})}
    >
      {children}
    </Tag>
  );
}

/** Window header strip — the classic menu caption. */
export function WindowTitle({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b-2 border-window-border/70 px-4 py-3 sm:px-5">
      <h2 className="pixel-text text-gold text-[11px] sm:text-xs leading-none">
        {children}
      </h2>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** ATB-style stat bar with animated fill. */
export function StatBar({
  value,
  max,
  color = "var(--color-gold)",
  label,
  showNumbers = true,
  size = "md",
  className = "",
}: {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showNumbers?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={className}>
      {label && (
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-ink-dim text-xs font-semibold uppercase tracking-wide">
            {label}
          </span>
          {showNumbers && (
            <span className="text-ink-faint text-xs tabular-nums">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className={`stat-bar-track ${heights[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ? `${label} progress` : undefined}
      >
        <motion.div
          className="stat-bar-fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Shimmer skeleton block. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-window-raised/60 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Chunky pixel badge for tier/attribute chips. */
export function Chip({
  children,
  colorClass = "text-ink-dim",
  className = "",
}: {
  children: ReactNode;
  colorClass?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border border-window-border bg-window-deep/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
