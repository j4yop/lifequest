"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type { CompleteTaskResult } from "@/lib/game/types";

/**
 * XP orb burst — particles flying from the completed quest.
 * Deterministic pattern (no Math.random in render), pure per render.
 */
export function XPOrbBurst({
  origin,
  xpGained,
}: {
  origin: { x: number; y: number };
  xpGained: number;
}) {
  const reduce = useReducedMotion();
  const count = Math.min(2 + Math.floor(xpGained / 25), 10);
  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    >
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.16;
        const dist = 44 + ((i * 17) % 60);
        const size = 5 + ((i * 7) % 5);
        const delay = (i % 4) * 0.03;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 60;
        return (
          <motion.span
            key={i}
            initial={{
              x: origin.x,
              y: origin.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: origin.x + dx,
              y: origin.y + dy,
              scale: [0, 1.15, 0.9],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.7,
              delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: size,
              height: size,
              borderRadius: "9999px",
              background:
                "linear-gradient(180deg, var(--color-gold-bright), var(--color-gold-deep))",
              boxShadow: "0 0 8px oklch(83% 0.16 88 / 0.8)",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Crit banner — nat-20 double-reward flash, wax-red and proud.
 */
export function CritBanner({ roll, onDone }: { roll: number; onDone: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 1200 : 2400);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      role="status"
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4"
      initial={{ opacity: 0, y: reduce ? 0 : -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -12 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="crit-flash-anim jrpg-window jrpg-rivets flex items-center gap-4 px-6 py-4">
        <span className="pixel-text ledger-nums flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold-deep bg-gold text-lg text-[oklch(96%_0.02_85)]">
          {roll}
        </span>
        <div>
          <p className="pixel-text text-[11px] leading-relaxed text-gold">
            Critical Hit!
          </p>
          <p className="mt-0.5 text-sm text-ink-dim font-body">
            Nat 20 — <strong className="text-ink">double rewards</strong> stamped on this entry.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Level-up overlay — full-screen celebration with the JRPG announce window.
 * Honors prefers-reduced-motion (no shake, fade only).
 */
export function LevelUpOverlay({
  result,
  onDone,
}: {
  result: CompleteTaskResult;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 1600 : 3200);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  const subtitle =
    result.attribute_levels_gained > 0
      ? `${result.attribute.toUpperCase()} grew to a new height`
      : "The road goes ever upward";

  const gearLine = result.gear_granted
    ? `${result.gear_granted} added to your wardrobe`
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="assertive"
    >
      {/* dark scrim */}
      <div className="absolute inset-0 bg-field-far/80 backdrop-blur-[2px]" />

      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.7, y: 30, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="jrpg-window jrpg-rivets relative max-w-md w-full p-8 text-center"
      >
        <p className="pixel-text text-[10px] text-ink-dim mb-3 tracking-widest">
          ✦ ✦ ✦
        </p>
        <h2 className="pixel-text text-gold text-xl sm:text-2xl leading-relaxed">
          Level Up!
        </h2>
        <motion.p
          initial={reduce ? false : { scale: 1 }}
          animate={reduce ? {} : { scale: [1, 1.25, 1] }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pixel-text text-ink text-5xl my-6"
        >
          {result.new_level}
        </motion.p>
        <p className="text-ink-dim text-sm font-body">
          {subtitle}
        </p>
        {gearLine && (
          <p className="pixel-text mt-3 text-[10px] leading-relaxed text-rarity-uncommon">
            ✦ {gearLine}
          </p>
        )}
        <button
          onClick={onDone}
          className="btn-jrpg btn-primary mt-8 px-6 py-2.5 text-[11px]"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
