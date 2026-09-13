"use client";

import { motion, useReducedMotion } from "motion/react";
import type { AttributeKey, GearMap } from "@/lib/game/types";
import { GEAR_SLOT_META } from "@/lib/game/types";

/**
 * Paper-doll hero: a layered SVG adventurer. Six gear slots (one per
 * attribute) each have 3 visible tiers; plain clothes = tier 0.
 * Every layer is drawn with hard ink lines + flat pigments — no gradients.
 */

const INK = "oklch(28% 0.03 55)";

type GearArt = {
  // svg path fragments per tier (1..3); tier 0 = nothing drawn
  layers: [string | null, string | null, string | null];
};

const GEAR_ART: Record<AttributeKey, GearArt> = {
  // STR — the weapon, held in the right hand (viewer's left)
  str: {
    layers: [
      // t1 oaken training sword
      '<line x1="63" y1="62" x2="50" y2="34" stroke="%INK%" stroke-width="2.5"/><rect x="47" y="33" width="6" height="9" fill="%INK%"/><rect x="59" y="59" width="8" height="3.5" fill="%INK%"/>',
      // t2 iron longsword
      '<line x1="63" y1="64" x2="44" y2="24" stroke="%INK%" stroke-width="3.5"/><path d="M47 24 L58 24 L52.5 12 Z" fill="oklch(75% 0.02 90)" stroke="%INK%" stroke-width="1.5"/><rect x="56" y="58" width="14" height="4" fill="%INK%""/><rect x="62" y="55" width="4" height="10" rx="1.5" fill="oklch(50% 0.04 60)" stroke="%INK%" stroke-width="1.5"/>',
      // t3 blade of the dawn — gold-leaf fuller
      '<line x1="63" y1="64" x2="40" y2="16" stroke="%INK%" stroke-width="4"/><path d="M43 16 L58 16 L50.5 0 L43 16 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5"/><line x1="61" y1="60" x2="46" y2="24" stroke="oklch(85% 0.1 92)" stroke-width="1.2"/><rect x="56" y="58" width="16" height="4.5" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5"/><rect x="62" y="54" width="4.5" height="12" rx="2" fill="oklch(50% 0.04 60)" stroke="%INK%" stroke-width="1.5"/>',
    ],
  },
  // INT — the tome, held at the left hip
  int: {
    layers: [
      '<rect x="22" y="58" width="13" height="10" rx="1.5" fill="oklch(62% 0.03 70)" stroke="%INK%" stroke-width="2"/>',
      '<rect x="20" y="54" width="15" height="13" rx="1.5" fill="oklch(46% 0.13 245)" stroke="%INK%" stroke-width="2"/><path d="M27.5 54 V67" stroke="%INK%" stroke-width="1.5"/>',
      '<rect x="18" y="50" width="17" height="15" rx="1.5" fill="oklch(46% 0.13 245)" stroke="%INK%" stroke-width="2.5"/><path d="M26.5 50 V65" stroke="%INK%" stroke-width="1.5"/><circle cx="26.5" cy="57.5" r="2.6" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5"/>',
    ],
  },
  // VIT — the armor, on the torso
  vit: {
    layers: [
      '<path d="M36 46 L50 50 L64 46 L66 60 L34 60 Z" fill="oklch(75% 0.05 80)" stroke="%INK%" stroke-width="2"/>',
      '<path d="M34 44 L50 49 L66 44 L68 62 L32 62 Z" fill="oklch(62% 0.06 65)" stroke="%INK%" stroke-width="2.5"/><line x1="50" y1="49" x2="50" y2="62" stroke="%INK%" stroke-width="1.5"/><line x1="41" y1="46.5" x2="41" y2="62" stroke="%INK%" stroke-width="1"/><line x1="59" y1="46.5" x2="59" y2="62" stroke="%INK%" stroke-width="1"/>',
      '<path d="M32 42 L50 48 L68 42 L70 63 L30 63 Z" fill="oklch(44% 0.10 155)" stroke="%INK%" stroke-width="2.5"/><line x1="50" y1="48" x2="50" y2="63" stroke="%INK%" stroke-width="2"/><circle cx="50" cy="53" r="3" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5"/><line x1="38" y1="45" x2="38" y2="63" stroke="%INK%" stroke-width="1"/><line x1="62" y1="45" x2="62" y2="63" stroke="%INK%" stroke-width="1"/>',
    ],
  },
  // DIS — the helm, on the head
  dis: {
    layers: [
      '<path d="M39 30 Q50 22 61 30 L61 36 L39 36 Z" fill="oklch(70% 0.06 60)" stroke="%INK%" stroke-width="2"/>',
      '<path d="M38 28 Q50 20 62 28 L62 37 L38 37 Z" fill="oklch(55% 0.04 60)" stroke="%INK%" stroke-width="2.5"/><rect x="38" y="30" width="24" height="2" fill="%INK%"/>',
      '<path d="M37 26 Q50 17 63 26 L64 38 L36 38 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="2.5"/><path d="M37 31 L63 31" stroke="%INK%" stroke-width="1.5"/><path d="M50 17 L50 26" stroke="%INK%" stroke-width="2"/>',
    ],
  },
  // CHA — the cloak, behind the shoulders
  cha: {
    layers: [
      '<path d="M33 44 Q26 54 27 72 L38 66 L34 44 Z M67 44 Q74 54 73 72 L62 66 L66 44 Z" fill="oklch(52% 0.16 345)" stroke="%INK%" stroke-width="2"/>',
      '<path d="M32 42 Q23 55 25 76 L40 68 L33 42 Z M68 42 Q77 55 75 76 L60 68 L67 42 Z" fill="oklch(50% 0.17 25)" stroke="%INK%" stroke-width="2.5"/><path d="M33 48 Q30 58 30 70 M67 48 Q70 58 70 70" stroke="%INK%" stroke-width="1" fill="none"/>',
      '<path d="M31 40 Q20 56 24 80 L42 70 L32 40 Z M69 40 Q80 56 76 80 L58 70 L68 40 Z" fill="oklch(52% 0.16 345)" stroke="%INK%" stroke-width="2.5"/><path d="M32 47 Q28 60 29 74 M68 47 Q72 60 71 74" stroke="%INK%" stroke-width="1.2" fill="none"/><circle cx="50" cy="41" r="2.2" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5"/>',
    ],
  },
  // CRA — the instrument, slung at the hip
  cra: {
    layers: [
      '<rect x="20" y="60" width="12" height="7" rx="2" fill="oklch(60% 0.13 70)" stroke="%INK%" stroke-width="2"/>',
      '<circle cx="24" cy="62" r="7" fill="oklch(60% 0.13 70)" stroke="%INK%" stroke-width="2.5"/><circle cx="24" cy="62" r="2.5" fill="oklch(85% 0.04 85)" stroke="%INK%" stroke-width="1.5"/>',
      '<path d="M20 58 Q24 50 30 52 L32 66 L18 64 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="2.5"/><circle cx="25" cy="61" r="2.8" fill="oklch(85% 0.04 85)" stroke="%INK%" stroke-width="1.5"/><line x1="30" y1="52" x2="36" y2="44" stroke="%INK%" stroke-width="1.5"/>',
    ],
  },
};

function gearSvg(slot: AttributeKey, tier: number): string | null {
  if (tier <= 0) return null;
  const art = GEAR_ART[slot].layers[tier - 1];
  return art ? art.replaceAll("%INK%", INK) : null;
}

/** The hero figure itself — same body for everyone, gear tells the story. */
function HeroBody({ cloakFirst }: { cloakFirst: string | null }) {
  return (
    <>
      {/* cloak sits behind the body */}
      {cloakFirst && <g dangerouslySetInnerHTML={{ __html: cloakFirst }} />}
      {/* legs */}
      <path
        d="M42 62 L42 78 L47 78 L49 64 L51 64 L53 78 L58 78 L58 62 Z"
        fill="oklch(62% 0.03 70)"
        stroke={INK}
        strokeWidth="2.5"
      />
      {/* torso */}
      <path
        d="M36 44 L50 48 L64 44 L66 60 Q50 66 34 60 Z"
        fill="oklch(85% 0.04 85)"
        stroke={INK}
        strokeWidth="2.5"
      />
      {/* arms */}
      <path
        d="M37 46 Q30 52 33 60 M63 46 Q70 52 67 60"
        stroke={INK}
        strokeWidth="2.5"
        fill="none"
      />
      {/* head */}
      <circle cx="50" cy="33" r="11" fill="oklch(91% 0.03 90)" stroke={INK} strokeWidth="2.5" />
      {/* face */}
      <circle cx="46.5" cy="32" r="1.4" fill={INK} />
      <circle cx="53.5" cy="32" r="1.4" fill={INK} />
      <path d="M47 37 Q50 39.5 53 37" stroke={INK} strokeWidth="1.5" fill="none" />
    </>
  );
}

/** Paper-doll avatar: 100x100 viewBox SVG. */
export function PaperDollAvatar({
  gear,
  level,
  size = 180,
  showLevelBadge = true,
  animateNewGear,
}: {
  gear: GearMap;
  level: number;
  size?: number;
  showLevelBadge?: boolean;
  animateNewGear?: string | null;
}) {
  const reduce = useReducedMotion();

  const slots: AttributeKey[] = ["str", "int", "vit", "dis", "cha", "cra"];
  const layers = slots
    .map((slot) => ({ slot, art: gearSvg(slot, gear[slot] ?? 0) }))
    .filter((l): l is { slot: AttributeKey; art: string } => l.art !== null);

  const cloak = layers.find((l) => l.slot === "cha");
  const front = layers.filter((l) => l.slot !== "cha");

  return (
    <div className="relative inline-block" aria-label={`Level ${level}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        className="block"
      >
        {/* parchment plaque */}
        <rect x="6" y="4" width="88" height="92" rx="2" fill="oklch(85% 0.04 85)" stroke={INK} strokeWidth="2.5" />
        <rect x="10" y="8" width="80" height="84" fill="none" stroke="oklch(62% 0.03 70 / 0.4)" strokeWidth="1" strokeDasharray="3 3" />

        <HeroBody cloakFirst={cloak?.art ?? null} />

        {/* front gear layers animate in when newly granted */}
        {front.map((l) => (
          <motion.g
            key={l.slot + (gear[l.slot] ?? 0)}
            initial={reduce || !animateNewGear ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
            dangerouslySetInnerHTML={{ __html: l.art }}
          />
        ))}
      </svg>

      {showLevelBadge && (
        <motion.span
          key={level}
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="pixel-text absolute -bottom-2 -right-2 flex h-9 min-w-9 items-center justify-center rounded-[6px] border-2 border-gold-deep bg-window-deep px-1.5 text-[11px] text-gold"
          aria-hidden="true"
        >
          {level}
        </motion.span>
      )}
    </div>
  );
}

/** Compact gear readout: 6 slots with tier pips. */
export function GearSlots({
  gear,
  attributes,
}: {
  gear: GearMap;
  attributes: { attribute: AttributeKey; level: number }[];
}) {
  const slots: AttributeKey[] = ["str", "int", "vit", "dis", "cha", "cra"];
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="Equipment">
      {slots.map((slot) => {
        const tier = gear[slot] ?? 0;
        const attr = attributes.find((a) => a.attribute === slot);
        const meta = GEAR_SLOT_META[slot];
        const nextTier = tier + 1;
        const nextAt =
          nextTier <= 3 ? meta.thresholds[nextTier - 1] : null;
        return (
          <li
            key={slot}
            className="flex flex-col gap-1 rounded-[4px] border-2 border-window-border bg-parchment-deep/50 px-2 py-1.5"
            title={
              nextAt && attr
                ? `${meta.label}: tier ${tier}. Tier ${nextTier} at ${meta.label.split(" ")[0]} level ${nextAt}.`
                : `${meta.label}: tier ${tier}${tier >= 3 ? " (max)" : ""}.`
            }
          >
            <span className="text-[9px] font-bold uppercase tracking-wide text-ink-dim">
              {meta.label}
            </span>
            <span className="flex gap-1" aria-hidden="true">
              {[1, 2, 3].map((t) => (
                <span
                  key={t}
                  className={`h-2 w-3.5 border-2 border-window-border ${
                    t <= tier ? "bg-gold" : "bg-transparent"
                  }`}
                />
              ))}
            </span>
            <span className="text-[9px] text-ink-faint">
              {tier >= 3 ? "max" : nextAt ? `Lv ${nextAt}` : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
