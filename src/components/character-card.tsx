"use client";

import { motion, useReducedMotion } from "motion/react";
import { Coins, Flame, Sparkle, Sword } from "@phosphor-icons/react";
import type { Profile } from "@/lib/game/types";
import { StatBar, Window, WindowTitle } from "@/components/ui";

/** Needed XP for the next profile level (mirror of the server curve). */
export function xpNeeded(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

/** The character sheet header card. */
export function CharacterCard({
  profile,
  equippedTitle,
  equippedFrame,
}: {
  profile: Profile;
  equippedTitle?: string;
  equippedFrame?: string;
}) {
  const reduce = useReducedMotion();
  const need = xpNeeded(profile.level);

  const frameBorders: Record<string, string> = {
    "frame-bronze": "var(--color-rarity-common)",
    "frame-silver": "var(--color-rarity-uncommon)",
    "frame-gold": "var(--color-gold)",
    "frame-rainbow": "var(--color-rarity-legendary)",
  };

  return (
    <Window as="article" className="overflow-hidden">
      <WindowTitle>Character</WindowTitle>
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Avatar sigil */}
          <div className="relative shrink-0">
            <div
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[3px]"
              style={{
                borderColor:
                  equippedFrame && frameBorders[equippedFrame]
                    ? frameBorders[equippedFrame]
                    : "var(--color-window-border)",
                backgroundImage:
                  equippedFrame === "frame-rainbow"
                    ? "linear-gradient(135deg, var(--color-rarity-rare), var(--color-rarity-epic), var(--color-rarity-legendary))"
                    : undefined,
              }}
              aria-hidden="true"
            >
              <Sword
                size={34}
                weight="duotone"
                className="text-gold"
                aria-hidden="true"
              />
            </div>
            {/* level badge */}
            <motion.div
              key={profile.level}
              initial={reduce ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="pixel-text absolute -bottom-2 -right-2 flex h-9 min-w-9 items-center justify-center rounded-[6px] border-2 border-gold-deep bg-window-deep px-1.5 text-[11px] text-gold"
              aria-label={`Level ${profile.level}`}
            >
              {profile.level}
            </motion.div>
          </div>

          {/* Name + class + title */}
          <div className="min-w-0 flex-1">
            <h3 className="pixel-text truncate text-sm sm:text-base leading-relaxed text-ink">
              {profile.display_name}
            </h3>
            <p className="mt-1 text-sm text-ink-dim font-body">
              {profile.class_name}
              {equippedTitle && (
                <span className="text-rarity-rare"> · {equippedTitle}</span>
              )}
            </p>

            {/* Gold + streak */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-gold tabular-nums">
                <Coins size={16} weight="duotone" aria-hidden="true" />
                {profile.gold.toLocaleString()}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 tabular-nums ${
                  profile.streak_count > 0 ? "text-rarity-epic" : "text-ink-faint"
                }`}
                title="Consecutive active days"
              >
                <Flame
                  size={16}
                  weight={profile.streak_count > 0 ? "fill" : "duotone"}
                  aria-hidden="true"
                />
                {profile.streak_count}d streak
              </span>
              {profile.streak_best > 1 && (
                <span className="inline-flex items-center gap-1 text-ink-faint tabular-nums text-xs">
                  best {profile.streak_best}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP to next level */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="pixel-text inline-flex items-center gap-1.5 text-[9px] text-ink-dim">
              <Sparkle size={11} weight="fill" aria-hidden="true" />
              Next Level
            </span>
            <span className="text-xs text-ink-faint tabular-nums">
              {profile.xp} / {need} XP
            </span>
          </div>
          <StatBar value={profile.xp} max={need} size="lg" label={undefined} showNumbers={false} />
        </div>
      </div>
    </Window>
  );
}
