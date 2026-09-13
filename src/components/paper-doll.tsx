"use client";

import { motion, useReducedMotion } from "motion/react";
import type { AttributeKey, GearMap } from "@/lib/game/types";
import { GEAR_SLOT_META } from "@/lib/game/types";

/**
 * LIFE QUEST — HERO PAPER-DOLL AVATAR
 * A fully realized, expressive 16-bit JRPG / Anime-styled adventurer.
 *
 * Replaces the old stick-figure with:
 * - Proper hero proportions, windswept hair, expressive eyes, and confident stance
 * - Sturdy adventurer attire (tunic, utility belt with potion vial, leather cuffed boots)
 * - 6 Upgradable gear slots (Weapon, Tome, Armor, Helm, Cloak, Instrument) across 3 tiers
 * - Base fit evolutions as character level rises (Lv 1 -> 18+)
 * - Crisp ink outlines + medieval pigments (Ledgerlight palette)
 */

const INK = "oklch(28% 0.03 55)";

type GearArt = {
  layers: [string | null, string | null, string | null];
};

const GEAR_ART: Record<AttributeKey, GearArt> = {
  // ================= STR: THE WEAPON (Right Hand) =================
  str: {
    layers: [
      // Tier 1: Oaken Training Sword — seasoned oak with wrapped leather grip
      `
        <g id="gear-str-1">
          <!-- Blade -->
          <polygon points="63,60 52,28 58,26 67,58" fill="oklch(62% 0.08 70)" stroke="%INK%" stroke-width="1.8" />
          <line x1="55" y1="30" x2="65" y2="58" stroke="oklch(75% 0.09 72)" stroke-width="1" />
          <!-- Crossguard -->
          <rect x="58" y="56" width="13" height="4" rx="1" fill="oklch(45% 0.06 60)" stroke="%INK%" stroke-width="1.5" />
          <!-- Leather wrapped grip -->
          <line x1="64" y1="59" x2="68" y2="69" stroke="%INK%" stroke-width="3" />
          <circle cx="68.5" cy="70" r="2.2" fill="oklch(55% 0.08 70)" stroke="%INK%" stroke-width="1.2" />
        </g>
      `,
      // Tier 2: Knight's Forged Steel Longsword — fuller channel, brass ring pommel
      `
        <g id="gear-str-2">
          <!-- Steel Blade with Fuller -->
          <polygon points="64,58 45,16 52,14 69,56" fill="oklch(78% 0.02 90)" stroke="%INK%" stroke-width="2" />
          <!-- Fuller groove -->
          <line x1="50" y1="20" x2="66" y2="55" stroke="oklch(55% 0.02 90)" stroke-width="1.6" />
          <!-- Gleaming blade bevel -->
          <polygon points="46,17 48,15 50,19" fill="#ffffff" />
          <!-- Swept Crossguard -->
          <path d="M56 57 Q65 54 74 53 L74 57 Q65 58 56 61 Z" fill="oklch(48% 0.04 60)" stroke="%INK%" stroke-width="1.6" />
          <circle cx="65" cy="56" r="2" fill="oklch(72% 0.14 92)" />
          <!-- Grip & Brass Pommel -->
          <line x1="65" y1="58" x2="70" y2="70" stroke="%INK%" stroke-width="3.5" />
          <circle cx="71" cy="71.5" r="2.8" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5" />
          <!-- Sparkle -->
          <polygon points="46,14 47,11 48,14 51,15 48,16 47,19 46,16 43,15" fill="#ffffff" />
        </g>
      `,
      // Tier 3: Blade of the Dawn — golden fuller, glowing ruby sun guard, serrated runic edges
      `
        <g id="gear-str-3">
          <!-- Radiant Gold Blade -->
          <polygon points="65,58 41,8 49,6 71,56" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="2.2" />
          <!-- Inner glowing sun fuller -->
          <line x1="47" y1="12" x2="68" y2="54" stroke="oklch(88% 0.16 95)" stroke-width="2" />
          <line x1="46" y1="13" x2="65" y2="52" stroke="#ffffff" stroke-width="1" />
          <!-- Serrated runic edges -->
          <polygon points="56,36 53,33 58,32" fill="oklch(88% 0.16 95)" stroke="%INK%" stroke-width="0.8" />
          <polygon points="62,46 59,43 64,42" fill="oklch(88% 0.16 95)" stroke="%INK%" stroke-width="0.8" />
          <!-- Winged Golden Crossguard -->
          <path d="M54 59 Q66 52 78 51 L77 56 Q66 58 55 63 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.8" />
          <!-- Center Sun Jewel -->
          <circle cx="66" cy="56" r="3.2" fill="oklch(50% 0.17 25)" stroke="%INK%" stroke-width="1.2" />
          <circle cx="65.2" cy="55.2" r="1" fill="#ffffff" />
          <!-- Grip & Sunburst Pommel -->
          <line x1="66" y1="59" x2="72" y2="72" stroke="oklch(34% 0.10 30)" stroke-width="3.5" />
          <circle cx="73" cy="74" r="3.6" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.5" />
          <circle cx="73" cy="74" r="1.5" fill="oklch(50% 0.17 25)" />
          <!-- Radiance Sparkles -->
          <polygon points="42,7 43,2 44,7 49,8 44,9 43,14 42,9 37,8" fill="#ffffff" />
          <polygon points="73,48 74,45 75,48 78,49 75,50 74,53 73,50 70,49" fill="#fef08a" />
        </g>
      `,
    ],
  },

  // ================= INT: THE TOME (Left Hip) =================
  int: {
    layers: [
      // Tier 1: Apprentice's Leatherbound Grimoire
      `
        <g id="gear-int-1">
          <!-- Book body -->
          <rect x="21" y="55" width="14" height="13" rx="1.5" fill="oklch(55% 0.08 65)" stroke="%INK%" stroke-width="1.8" />
          <rect x="23" y="57" width="10" height="9" fill="oklch(82% 0.04 80)" />
          <!-- Spine & Brass corners -->
          <line x1="24" y1="55" x2="24" y2="68" stroke="%INK%" stroke-width="1.5" />
          <polygon points="31,55 35,55 35,59" fill="oklch(70% 0.10 80)" />
          <!-- Silk bookmark ribbon -->
          <path d="M28 68 Q29 74 32 76 L30 72 Z" fill="oklch(50% 0.17 25)" stroke="%INK%" stroke-width="0.8" />
        </g>
      `,
      // Tier 2: Cobalt Arcane Codex — silver constellation & silver clasp
      `
        <g id="gear-int-2">
          <!-- Book cover -->
          <rect x="19" y="53" width="16" height="15" rx="2" fill="oklch(46% 0.13 245)" stroke="%INK%" stroke-width="2" />
          <!-- Spine & Silver filigree corner caps -->
          <rect x="19" y="53" width="4" height="15" fill="oklch(36% 0.11 245)" stroke="%INK%" stroke-width="1.2" />
          <polygon points="31,53 35,53 35,57" fill="oklch(85% 0.02 90)" stroke="%INK%" stroke-width="0.8" />
          <polygon points="31,68 35,68 35,64" fill="oklch(85% 0.02 90)" stroke="%INK%" stroke-width="0.8" />
          <!-- Star constellation sigil -->
          <circle cx="28" cy="60.5" r="3.2" fill="none" stroke="oklch(85% 0.02 90)" stroke-width="1" />
          <circle cx="28" cy="60.5" r="1.2" fill="#ffffff" />
          <!-- Lock clasp -->
          <rect x="33" y="59" width="3" height="4" rx="0.5" fill="oklch(85% 0.02 90)" stroke="%INK%" stroke-width="1" />
        </g>
      `,
      // Tier 3: Arch-Mage's Sunken Chronicle — gold leaf, glowing runes, floating motes
      `
        <g id="gear-int-3">
          <!-- Arcane Aura Glow -->
          <rect x="16" y="50" width="20" height="18" rx="3" fill="oklch(46% 0.13 245 / 0.25)" />
          <!-- Book cover -->
          <rect x="17" y="51" width="18" height="16" rx="2" fill="oklch(46% 0.13 245)" stroke="%INK%" stroke-width="2.2" />
          <!-- Gold leaf spine -->
          <rect x="17" y="51" width="4.5" height="16" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.2" />
          <!-- Gold filigree corners -->
          <polygon points="30,51 35,51 35,56" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1" />
          <polygon points="30,67 35,67 35,62" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1" />
          <!-- Glowing Eye of Providence / Mystic Seal -->
          <circle cx="27" cy="59" r="4" fill="none" stroke="oklch(72% 0.14 92)" stroke-width="1.4" />
          <circle cx="27" cy="59" r="2" fill="oklch(88% 0.16 95)" />
          <circle cx="27" cy="59" r="0.8" fill="#ffffff" />
          <!-- Hanging celestial pendant -->
          <line x1="27" y1="67" x2="27" y2="73" stroke="oklch(72% 0.14 92)" stroke-width="1" />
          <polygon points="27,73 29,76 27,78 25,76" fill="oklch(88% 0.16 95)" stroke="%INK%" stroke-width="0.8" />
          <!-- Sparkle motes -->
          <circle cx="15" cy="53" r="1" fill="#60a5fa" />
          <circle cx="36" cy="49" r="1.2" fill="#fbbf24" />
        </g>
      `,
    ],
  },

  // ================= VIT: BODY ARMOR (Torso & Shoulders) =================
  vit: {
    layers: [
      // Tier 1: Riveted Leather Brigandine & Pauldrons
      `
        <g id="gear-vit-1">
          <!-- Torso cuirass -->
          <path d="M36 43 L50 47 L64 43 L66 59 Q50 63 34 59 Z" fill="oklch(62% 0.08 65)" stroke="%INK%" stroke-width="2" />
          <!-- Center seam & bronze rivets -->
          <line x1="50" y1="47" x2="50" y2="61" stroke="%INK%" stroke-width="1.2" />
          <circle cx="44" cy="51" r="1" fill="oklch(70% 0.10 80)" />
          <circle cx="44" cy="56" r="1" fill="oklch(70% 0.10 80)" />
          <circle cx="56" cy="51" r="1" fill="oklch(70% 0.10 80)" />
          <circle cx="56" cy="56" r="1" fill="oklch(70% 0.10 80)" />
          <!-- Shoulder guards -->
          <path d="M33 42 Q30 45 32 50 L36 48 Z" fill="oklch(55% 0.08 65)" stroke="%INK%" stroke-width="1.5" />
          <path d="M67 42 Q70 45 68 50 L64 48 Z" fill="oklch(55% 0.08 65)" stroke="%INK%" stroke-width="1.5" />
        </g>
      `,
      // Tier 2: Forged Steel Breastplate & Pauldrons — ridge line, eagle crest
      `
        <g id="gear-vit-2">
          <!-- Steel Breastplate -->
          <path d="M35 41 L50 46 L65 41 L67 60 Q50 64 33 60 Z" fill="oklch(76% 0.03 90)" stroke="%INK%" stroke-width="2.2" />
          <!-- Center ridge reflection -->
          <line x1="50" y1="46" x2="50" y2="62" stroke="%INK%" stroke-width="1.8" />
          <line x1="49" y1="47" x2="49" y2="60" stroke="#ffffff" stroke-width="1" />
          <!-- Segmented fauld plates -->
          <path d="M37 56 Q50 60 63 56" stroke="%INK%" stroke-width="1.2" fill="none" />
          <!-- Engraved Eagle / Guild Crest -->
          <path d="M47 50 L50 48 L53 50 L50 53 Z" fill="oklch(48% 0.04 60)" stroke="%INK%" stroke-width="0.8" />
          <!-- Layered Steel Shoulder Pauldrons -->
          <path d="M31 39 Q26 44 28 51 L35 46 Z" fill="oklch(70% 0.03 90)" stroke="%INK%" stroke-width="1.8" />
          <line x1="29" y1="45" x2="33" y2="44" stroke="%INK%" stroke-width="1" />
          <circle cx="31" cy="42" r="1.2" fill="oklch(72% 0.14 92)" />
          <path d="M69 39 Q74 44 72 51 L65 46 Z" fill="oklch(70% 0.03 90)" stroke="%INK%" stroke-width="1.8" />
          <line x1="71" y1="45" x2="67" y2="44" stroke="%INK%" stroke-width="1" />
          <circle cx="69" cy="42" r="1.2" fill="oklch(72% 0.14 92)" />
        </g>
      `,
      // Tier 3: Titan's Emerald Plate — gold-chased paladin cuirass, lion pauldrons, heart gem
      `
        <g id="gear-vit-3">
          <!-- Emerald Armor Base -->
          <path d="M34 40 L50 45 L66 40 L68 61 Q50 65 32 61 Z" fill="oklch(44% 0.10 155)" stroke="%INK%" stroke-width="2.4" />
          <!-- Pure Gold Filigree Borders -->
          <path d="M35 42 L50 47 L65 42" stroke="oklch(72% 0.14 92)" stroke-width="2" fill="none" />
          <path d="M35 59 Q50 63 65 59" stroke="oklch(72% 0.14 92)" stroke-width="1.8" fill="none" />
          <!-- Glowing Heartstone Jewel -->
          <circle cx="50" cy="52" r="3.5" fill="oklch(85% 0.14 155)" stroke="%INK%" stroke-width="1.4" />
          <polygon points="50,49 52.5,52 50,55 47.5,52" fill="#ffffff" />
          <!-- Golden Wing Flairs on Chest -->
          <path d="M43 51 Q40 48 45 47 M57 51 Q60 48 55 47" stroke="oklch(72% 0.14 92)" stroke-width="1.2" fill="none" />
          <!-- Sculpted Golden Lion-Head Pauldrons -->
          <path d="M29 38 Q22 43 25 53 L35 46 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="2" />
          <circle cx="28" cy="44" r="2.2" fill="oklch(44% 0.10 155)" stroke="%INK%" stroke-width="1" />
          <path d="M71 38 Q78 43 75 53 L65 46 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="2" />
          <circle cx="72" cy="44" r="2.2" fill="oklch(44% 0.10 155)" stroke="%INK%" stroke-width="1" />
        </g>
      `,
    ],
  },

  // ================= DIS: THE HELM (Head) =================
  dis: {
    layers: [
      // Tier 1: Warrior's Iron Brow Circlet with Sapphire
      `
        <g id="gear-dis-1">
          <!-- Iron headband -->
          <path d="M39 28 Q50 25 61 28 L61 32 Q50 29 39 32 Z" fill="oklch(62% 0.04 60)" stroke="%INK%" stroke-width="1.8" />
          <!-- Center Sapphire Cabochon -->
          <polygon points="50,26 52.5,29 50,32 47.5,29" fill="oklch(46% 0.13 245)" stroke="%INK%" stroke-width="1" />
          <circle cx="49.5" cy="28.5" r="0.7" fill="#ffffff" />
        </g>
      `,
      // Tier 2: Vigil Knight's Steel Bascinet with T-Visor
      `
        <g id="gear-dis-2">
          <!-- Helmet Dome -->
          <path d="M37 28 Q50 17 63 28 L63 36 Q50 37 37 36 Z" fill="oklch(70% 0.03 90)" stroke="%INK%" stroke-width="2.2" />
          <!-- Brow Ridge Band -->
          <path d="M37 29 Q50 27 63 29" stroke="%INK%" stroke-width="1.6" fill="none" />
          <!-- T-Visor Eye Slit -->
          <rect x="42" y="30" width="16" height="2.5" rx="0.5" fill="%INK%" />
          <line x1="50" y1="30" x2="50" y2="35" stroke="%INK%" stroke-width="2" />
          <!-- Cheek Guards -->
          <path d="M37 36 L39 41 L43 38 M63 36 L61 41 L57 38" stroke="%INK%" stroke-width="1.5" fill="none" />
        </g>
      `,
      // Tier 3: Valkyrie Winged War-Crown — soaring gold wings, ruby crest
      `
        <g id="gear-dis-3">
          <!-- Golden War-Crown Dome -->
          <path d="M36 27 Q50 16 64 27 L64 35 Q50 36 36 35 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="2.4" />
          <path d="M36 28 Q50 25 64 28" stroke="%INK%" stroke-width="1.5" fill="none" />
          <!-- Front Visor Plate with Gem -->
          <polygon points="50,22 54,27 50,32 46,27" fill="oklch(50% 0.17 25)" stroke="%INK%" stroke-width="1.4" />
          <circle cx="49.5" cy="26" r="1" fill="#ffffff" />
          <!-- Majestic Left Golden Wing -->
          <path d="M37 27 Q30 20 28 8 Q34 16 38 23 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.8" />
          <path d="M35 25 Q30 18 31 11" stroke="#fef08a" stroke-width="1" fill="none" />
          <!-- Majestic Right Golden Wing -->
          <path d="M63 27 Q70 20 72 8 Q66 16 62 23 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.8" />
          <path d="M65 25 Q70 18 69 11" stroke="#fef08a" stroke-width="1" fill="none" />
        </g>
      `,
    ],
  },

  // ================= CHA: THE CLOAK (Behind Shoulders) =================
  cha: {
    layers: [
      // Tier 1: Traveler's Rose Wool Mantle
      `
        <g id="gear-cha-1">
          <!-- Left and Right Draped Tails -->
          <path d="M33 42 Q25 54 26 74 L38 68 L34 42 Z" fill="oklch(52% 0.16 345)" stroke="%INK%" stroke-width="2" />
          <path d="M67 42 Q75 54 74 74 L62 68 L66 42 Z" fill="oklch(52% 0.16 345)" stroke="%INK%" stroke-width="2" />
          <!-- Inner folds -->
          <line x1="32" y1="52" x2="30" y2="70" stroke="%INK%" stroke-width="1" />
          <line x1="68" y1="52" x2="70" y2="70" stroke="%INK%" stroke-width="1" />
        </g>
      `,
      // Tier 2: Noble Carmine Mantle — gold fringe hem, lion clasps
      `
        <g id="gear-cha-2">
          <!-- Flowing Body with Folds -->
          <path d="M32 40 Q21 56 23 79 L41 71 L33 40 Z" fill="oklch(50% 0.17 25)" stroke="%INK%" stroke-width="2.2" />
          <path d="M68 40 Q79 56 77 79 L59 71 L67 40 Z" fill="oklch(50% 0.17 25)" stroke="%INK%" stroke-width="2.2" />
          <!-- Gold fringe trim at hem -->
          <line x1="23" y1="78" x2="41" y2="70" stroke="oklch(72% 0.14 92)" stroke-width="1.8" />
          <line x1="77" y1="78" x2="59" y2="70" stroke="oklch(72% 0.14 92)" stroke-width="1.8" />
          <!-- Fold shadows -->
          <path d="M31 46 Q27 60 28 73 M69 46 Q73 60 72 73" stroke="%INK%" stroke-width="1.2" fill="none" />
        </g>
      `,
      // Tier 3: Imperial Sovereign Robes — oxblood & purple, gold borders, ermine trim
      `
        <g id="gear-cha-3">
          <!-- Grand Billowing Mantle -->
          <path d="M30 38 Q17 58 20 84 L43 74 L32 38 Z" fill="oklch(40% 0.16 330)" stroke="%INK%" stroke-width="2.5" />
          <path d="M70 38 Q83 58 80 84 L57 74 L68 38 Z" fill="oklch(40% 0.16 330)" stroke="%INK%" stroke-width="2.5" />
          <!-- Pure Gold Leaf Borders -->
          <path d="M20 83 L43 73 L41 71 L21 81 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1" />
          <path d="M80 83 L57 73 L59 71 L79 81 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1" />
          <!-- White Ermine Fur Trim on Shoulders -->
          <circle cx="33" cy="40" r="3.2" fill="#ffffff" stroke="%INK%" stroke-width="1" />
          <circle cx="67" cy="40" r="3.2" fill="#ffffff" stroke="%INK%" stroke-width="1" />
          <circle cx="50" cy="41" r="2.5" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.2" />
        </g>
      `,
    ],
  },

  // ================= CRA: THE INSTRUMENT (Hip / Back) =================
  cra: {
    layers: [
      // Tier 1: Bard's Handcrafted Cedar Lute
      `
        <g id="gear-cra-1">
          <!-- Teardrop body -->
          <ellipse cx="23" cy="62" rx="7" ry="6" fill="oklch(60% 0.13 70)" stroke="%INK%" stroke-width="1.8" />
          <circle cx="23" cy="62" r="2.2" fill="oklch(35% 0.05 60)" stroke="%INK%" stroke-width="1" />
          <!-- Neck & Peghead -->
          <line x1="26" y1="58" x2="33" y2="48" stroke="oklch(45% 0.08 65)" stroke-width="2" />
          <rect x="32" y="46" width="3" height="4" fill="%INK%" />
        </g>
      `,
      // Tier 2: Verdigris Master Mandolin — emerald inlays, dual f-holes
      `
        <g id="gear-cra-2">
          <!-- Mandolin Body -->
          <circle cx="23" cy="62" r="7.5" fill="oklch(44% 0.10 155)" stroke="%INK%" stroke-width="2" />
          <!-- Inner spruce table -->
          <circle cx="23" cy="62" r="5" fill="oklch(68% 0.11 75)" stroke="%INK%" stroke-width="1" />
          <!-- Dual f-holes -->
          <path d="M21 59 Q20 62 21 65 M25 59 Q26 62 25 65" stroke="%INK%" stroke-width="1" fill="none" />
          <!-- Neck with frets -->
          <line x1="27" y1="57" x2="35" y2="45" stroke="oklch(40% 0.05 60)" stroke-width="2.5" />
          <line x1="29" y1="54" x2="31" y2="53" stroke="oklch(72% 0.14 92)" stroke-width="1" />
        </g>
      `,
      // Tier 3: Apollo's Celestial Winged Lyre — gold frame, silver chords, radiant sun
      `
        <g id="gear-cra-3">
          <!-- Winged Golden Horns -->
          <path d="M17 66 Q15 54 22 48 L25 51 Q20 56 22 66 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.8" />
          <path d="M31 66 Q33 54 26 48 L23 51 Q28 56 26 66 Z" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.8" />
          <!-- Crossbar & Soundbox -->
          <rect x="20" y="49" width="8" height="2.5" rx="0.5" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1" />
          <ellipse cx="24" cy="66" rx="6" ry="4" fill="oklch(72% 0.14 92)" stroke="%INK%" stroke-width="1.8" />
          <circle cx="24" cy="66" r="2" fill="oklch(46% 0.13 245)" />
          <!-- Silver Strings -->
          <line x1="22" y1="51" x2="22" y2="65" stroke="#ffffff" stroke-width="0.8" />
          <line x1="24" y1="51" x2="24" y2="65" stroke="#ffffff" stroke-width="0.8" />
          <line x1="26" y1="51" x2="26" y2="65" stroke="#ffffff" stroke-width="0.8" />
          <!-- Floating Music Note Sparkle -->
          <circle cx="16" cy="46" r="1.2" fill="#fef08a" />
          <line x1="17" y1="46" x2="17" y2="42" stroke="#fef08a" stroke-width="0.8" />
        </g>
      `,
    ],
  },
};

function gearSvg(slot: AttributeKey, tier: number): string | null {
  if (tier <= 0) return null;
  const art = GEAR_ART[slot].layers[tier - 1];
  return art ? art.replaceAll("%INK%", INK) : null;
}

/**
 * The Hero Figure itself — athletic JRPG anime adventurer body with
 * styled hair, expressive eyes, tailored tunic, utility belt, and cuffed boots.
 */
function HeroBody({
  cloakFirst,
  level,
}: {
  cloakFirst: string | null;
  level: number;
}) {
  return (
    <g id="hero-base-figure">
      {/* 1. Cloak Layer in Background */}
      {cloakFirst && <g dangerouslySetInnerHTML={{ __html: cloakFirst }} />}

      {/* 2. Soft Ground Shadow */}
      <ellipse cx="50" cy="88" rx="22" ry="4.5" fill="rgba(43, 39, 36, 0.25)" />

      {/* 3. Boots & Legs */}
      {/* Adventurer Trousers */}
      <path
        d="M40 59 L60 59 L59 74 L53 74 L50 64 L47 74 L41 74 Z"
        fill="oklch(38% 0.04 250)"
        stroke={INK}
        strokeWidth="2.2"
      />
      {/* Left Boot (Viewer's Left) */}
      <g>
        <path
          d="M38 72 L47 72 L46 84 L37 84 L34 83 Z"
          fill="oklch(45% 0.08 55)"
          stroke={INK}
          strokeWidth="2.2"
        />
        {/* Boot cuff & sole */}
        <line x1="37" y1="74" x2="47" y2="74" stroke="oklch(35% 0.07 50)" strokeWidth="2" />
        <rect x="34" y="83" width="13" height="2" rx="0.5" fill="oklch(26% 0.04 50)" />
        {/* Brass buckle */}
        <rect x="42" y="76" width="3" height="2.5" rx="0.5" fill="oklch(72% 0.14 92)" stroke={INK} strokeWidth="0.8" />
        {level >= 8 && <circle cx="41" cy="71" r="1.5" fill="oklch(72% 0.14 92)" />}
      </g>
      {/* Right Boot (Viewer's Right) */}
      <g>
        <path
          d="M53 72 L62 72 L65 83 L63 84 L54 84 Z"
          fill="oklch(45% 0.08 55)"
          stroke={INK}
          strokeWidth="2.2"
        />
        <line x1="53" y1="74" x2="63" y2="74" stroke="oklch(35% 0.07 50)" strokeWidth="2" />
        <rect x="53" y="83" width="13" height="2" rx="0.5" fill="oklch(26% 0.04 50)" />
        <rect x="55" y="76" width="3" height="2.5" rx="0.5" fill="oklch(72% 0.14 92)" stroke={INK} strokeWidth="0.8" />
        {level >= 8 && <circle cx="59" cy="71" r="1.5" fill="oklch(72% 0.14 92)" />}
      </g>

      {/* 4. Torso & Tunic */}
      <path
        d="M34 42 L50 46 L66 42 L67 59 Q50 64 33 59 Z"
        fill="oklch(88% 0.04 85)"
        stroke={INK}
        strokeWidth="2.4"
      />
      {/* V-Neck Adventurer Collar with Lacing */}
      <polygon points="50,42 45,38 55,38" fill="oklch(84% 0.05 70)" stroke={INK} strokeWidth="1.2" />
      <line x1="48" y1="40" x2="52" y2="40" stroke={INK} strokeWidth="1" />
      <line x1="49" y1="42" x2="51" y2="42" stroke={INK} strokeWidth="1" />

      {/* 5. Leather Utility Belt with Brass Buckle & Potion Flask */}
      <rect x="34" y="55" width="32" height="5" fill="oklch(42% 0.08 55)" stroke={INK} strokeWidth="2" />
      {/* Buckle */}
      <rect x="47" y="54.5" width="6" height="6" rx="1" fill="oklch(72% 0.14 92)" stroke={INK} strokeWidth="1.2" />
      <rect x="49" y="56" width="2" height="3" fill="oklch(35% 0.07 50)" />
      {/* Potion Flask on belt */}
      <circle cx="39" cy="62" r="3.2" fill="oklch(50% 0.17 25)" stroke={INK} strokeWidth="1.2" />
      <rect x="38" y="58" width="2" height="2" fill="oklch(60% 0.08 70)" stroke={INK} strokeWidth="0.8" />
      <circle cx="38" cy="61" r="0.8" fill="#ffffff" />

      {/* 6. Arms & Hands */}
      {/* Left Arm (holding tome / resting on hip) */}
      <path
        d="M35 44 Q26 50 28 60 L33 58 Q31 50 38 46 Z"
        fill="oklch(88% 0.04 85)"
        stroke={INK}
        strokeWidth="2"
      />
      {/* Leather Bracer */}
      <rect x="27" y="54" width="5" height="5" rx="1" fill="oklch(45% 0.08 55)" stroke={INK} strokeWidth="1.2" />
      {/* Left Hand */}
      <circle cx="29" cy="60.5" r="2.8" fill="oklch(84% 0.05 70)" stroke={INK} strokeWidth="1.4" />

      {/* Right Arm (raised ready with weapon) */}
      <path
        d="M65 44 Q74 50 71 60 L66 58 Q69 50 62 46 Z"
        fill="oklch(88% 0.04 85)"
        stroke={INK}
        strokeWidth="2"
      />
      <rect x="68" y="54" width="5" height="5" rx="1" fill="oklch(45% 0.08 55)" stroke={INK} strokeWidth="1.2" />
      {/* Right Hand gripping weapon */}
      <circle cx="68" cy="60.5" r="3" fill="oklch(84% 0.05 70)" stroke={INK} strokeWidth="1.4" />

      {/* 7. Neck & Sculpted Head */}
      <rect x="46" y="34" width="8" height="7" fill="oklch(84% 0.05 70)" stroke={INK} strokeWidth="1.8" />
      {/* Defined Jawline & Face */}
      <path
        d="M39 27 Q38 38 50 41 Q62 38 61 27 Q62 16 50 16 Q38 16 39 27 Z"
        fill="oklch(86% 0.05 70)"
        stroke={INK}
        strokeWidth="2.2"
      />

      {/* 8. Expressive Heroic Face */}
      {/* Eyebrows (Determined) */}
      <path d="M42 25 L47 26.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M58 25 L53 26.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      {/* Hero Eyes: anime styling with sclera, vibrant iris, and specular white shine */}
      {/* Left Eye */}
      <ellipse cx="44.5" cy="29.5" rx="2.8" ry="3.2" fill="#ffffff" stroke={INK} strokeWidth="1" />
      <circle cx="44.8" cy="29.5" r="1.9" fill="oklch(46% 0.13 245)" />
      <circle cx="44.8" cy="29.5" r="1.1" fill={INK} />
      <circle cx="44" cy="28.5" r="0.8" fill="#ffffff" />
      <path d="M41.8 27 Q44.5 25.8 47.2 27" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Right Eye */}
      <ellipse cx="55.5" cy="29.5" rx="2.8" ry="3.2" fill="#ffffff" stroke={INK} strokeWidth="1" />
      <circle cx="55.2" cy="29.5" r="1.9" fill="oklch(46% 0.13 245)" />
      <circle cx="55.2" cy="29.5" r="1.1" fill={INK} />
      <circle cx="54.4" cy="28.5" r="0.8" fill="#ffffff" />
      <path d="M52.8 27 Q55.5 25.8 58.2 27" stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M50 30 L49 32.5 L51 32.5" stroke={INK} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Cheerful Confident Smile */}
      <path d="M46.5 35 Q50 38 53.5 35" stroke={INK} strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* 9. Handsome Windswept Adventurer Hair */}
      {/* Back locks */}
      <path
        d="M37 25 Q32 20 34 33 Q36 37 39 36"
        fill="oklch(42% 0.08 55)"
        stroke={INK}
        strokeWidth="1.8"
      />
      <path
        d="M63 25 Q68 20 66 33 Q64 37 61 36"
        fill="oklch(42% 0.08 55)"
        stroke={INK}
        strokeWidth="1.8"
      />
      {/* Top Volume & Spiky Tufts */}
      <path
        d="M36 24 Q32 14 42 12 Q46 8 52 11 Q59 9 63 15 Q68 18 64 25 Q58 20 50 20 Q42 20 36 24 Z"
        fill="oklch(48% 0.09 55)"
        stroke={INK}
        strokeWidth="2.2"
      />
      {/* Front Sweeping Bangs */}
      <path
        d="M39 20 Q43 25 43 27 Q45 22 49 22 Q50 27 52 26 Q55 21 60 23 Q55 19 49 19 Q43 19 39 20 Z"
        fill="oklch(56% 0.10 60)"
        stroke={INK}
        strokeWidth="1.6"
      />
      {/* Hair highlight tuft */}
      <path d="M44 14 Q48 11 53 13" stroke="oklch(70% 0.11 65)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </g>
  );
}

/**
 * Paper-Doll Avatar: 100x100 viewBox SVG.
 * High-definition JRPG hero with real anatomy and layered equipment upgrades.
 */
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
    <div className="relative inline-block" aria-label={`Level ${level} Adventurer`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        role="img"
        className="block drop-shadow-md"
        style={{ shapeRendering: "geometricPrecision" }}
      >
        <defs>
          <radialGradient id="plaqueGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="oklch(94% 0.04 88)" />
            <stop offset="85%" stopColor="oklch(85% 0.04 85)" />
            <stop offset="100%" stopColor="oklch(78% 0.045 80)" />
          </radialGradient>
        </defs>

        {/* 1. Parchment Plaque Card Surface */}
        <rect
          x="5"
          y="4"
          width="90"
          height="92"
          rx="3"
          fill="url(#plaqueGlow)"
          stroke={INK}
          strokeWidth="2.5"
        />
        {/* Inked Border Ruled Inset */}
        <rect
          x="8.5"
          y="7.5"
          width="83"
          height="85"
          fill="none"
          stroke="oklch(62% 0.03 70 / 0.5)"
          strokeWidth="1"
          strokeDasharray="3.5 2.5"
        />

        {/* Hero Arch Pedestal Backing */}
        <path
          d="M20 90 L20 40 Q50 20 80 40 L80 90"
          fill="none"
          stroke="oklch(62% 0.03 70 / 0.25)"
          strokeWidth="1.5"
        />

        {/* 2. Hero Body Figure with Cloak */}
        <HeroBody cloakFirst={cloak?.art ?? null} level={level} />

        {/* 3. Front Gear Layers (Armor, Helm, Weapon, Tome, Instrument) */}
        {front.map((l) => (
          <motion.g
            key={l.slot + (gear[l.slot] ?? 0)}
            initial={reduce || !animateNewGear ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
            dangerouslySetInnerHTML={{ __html: l.art }}
          />
        ))}

        {/* 4. Level Milestone Accents on Plaque */}
        {level >= 10 && (
          <g>
            <circle cx="11" cy="10" r="1.8" fill="oklch(72% 0.14 92)" stroke={INK} strokeWidth="0.8" />
            <circle cx="89" cy="10" r="1.8" fill="oklch(72% 0.14 92)" stroke={INK} strokeWidth="0.8" />
          </g>
        )}
      </svg>

      {/* Level Badge Pill */}
      {showLevelBadge && (
        <motion.span
          key={level}
          initial={reduce ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="pixel-text absolute -bottom-2 -right-2 flex h-9 min-w-9 items-center justify-center rounded-[6px] border-2 border-gold-deep bg-window-deep px-1.5 text-[11px] text-gold shadow-md"
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
        const nextAt = nextTier <= 3 ? meta.thresholds[nextTier - 1] : null;

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
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wide text-ink-dim">
                {meta.label}
              </span>
              <span className="text-[9px] font-mono text-ink-faint">
                {tier > 0 ? `T${tier}` : "-"}
              </span>
            </div>
            <span className="flex gap-1" aria-hidden="true">
              {[1, 2, 3].map((t) => (
                <span
                  key={t}
                  className={`h-2 flex-1 border-2 border-window-border transition-colors ${
                    t <= tier ? "bg-gold" : "bg-transparent"
                  }`}
                />
              ))}
            </span>
            <span className="text-[9px] text-ink-faint">
              {tier >= 3 ? "MAX" : nextAt ? `Lv ${nextAt}` : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
