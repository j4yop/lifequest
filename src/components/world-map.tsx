"use client";

import { useReducedMotion } from "motion/react";
import { useState, useRef, useMemo, useCallback } from "react";
import {
  LockSimple,
  MapTrifold,
  Crosshair,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsCounterClockwise,
  SpeakerHigh,
  SpeakerSimpleSlash,
  Television,
  GridFour,
  CheckCircle,
  Sparkle,
  Compass,
  ArrowLeft,
  ArrowRight,
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  Path,
} from "@phosphor-icons/react";
import type { Profile, Zone, AttributeRow, AttributeKey } from "@/lib/game/types";
import { ATTRIBUTE_META } from "@/lib/game/types";
import { Window, WindowTitle, Chip, StatBar } from "@/components/ui";
import { playMapBlip, playRouteChirp } from "@/lib/audio/fanfare";

/**
 * LIFE QUEST — ARCADE POKÉMON-STYLE WORLD MAP
 * An expansive 960x640 overworld map of "The Sunken Road" inspired by
 * classic Game Boy Advance / Pokémon Town Maps (RSE, FRLG, GSC).
 *
 * Features:
 * - 8 Hand-crafted biomes: Coastal Haven, Ancient Canopy, River Rapids,
 *   Metropolis, Volcanic Crags, Highland Citadel, Mystic Swamp, Snow Summit
 * - Interactive Pan & Zoom (100% -> 175%) + D-Pad & Drag Navigation
 * - Classic Pokémon Route network with route stones (RT 1 -> RT 7)
 * - 16-bit Adventurer Hero Sprite ("YOU ARE HERE") with locator beacon
 * - Dynamic Fog-of-War with drifting clouds and mysterious lock gates
 * - Authentic Retro Arcade / Game Boy console frame with blinking power LED
 * - Scanline CRT filter & 8-bit WebAudio chiptune sound feedback
 * - Classic Pokémon Town Map text banner & dialogue HUD
 * - Chronicle Expedition Ledger with instant snap-to-zone
 */

export interface ZoneMeta {
  id: number;
  x: number;
  y: number;
  routeTitle: string;
  landmarkTitle: string;
  biome: "coastal" | "forest" | "river" | "metropolis" | "volcanic" | "fortress" | "swamp" | "mountain";
  biomeLabel: string;
  attribute: AttributeKey;
  dangerRating: string;
  encounterAdvice: string;
  color: string;
  gridCoord: string;
}

export const ZONE_METAS: Record<number, ZoneMeta> = {
  1: {
    id: 1,
    x: 170,
    y: 500,
    routeTitle: "ROUTE 1 · HEARTHWAY",
    landmarkTitle: "The Hearthstead Hamlet",
    biome: "coastal",
    biomeLabel: "Coastal Haven",
    attribute: "vit",
    dangerRating: "Safe Haven",
    encounterAdvice: "Home chores, deep sleep, morning hydration, and tending to personal wellbeing.",
    color: "oklch(44% 0.10 155)",
    gridCoord: "B-5",
  },
  2: {
    id: 2,
    x: 170,
    y: 320,
    routeTitle: "ROUTE 2 · CANOPY TRAIL",
    landmarkTitle: "Milkwood Ancient Grove",
    biome: "forest",
    biomeLabel: "Dense Canopy",
    attribute: "cra",
    dangerRating: "Wild Woods",
    encounterAdvice: "Artistic crafting, morning creative writing, and building practical projects.",
    color: "oklch(60% 0.13 70)",
    gridCoord: "B-3",
  },
  3: {
    id: 3,
    x: 400,
    y: 320,
    routeTitle: "ROUTE 3 · INKFALL RIVER",
    landmarkTitle: "The Grand Inkfall Bridge",
    biome: "river",
    biomeLabel: "River Rapids",
    attribute: "int",
    dangerRating: "Deep Crossing",
    encounterAdvice: "Studying technical manuscripts, programming challenges, and puzzle solving.",
    color: "oklch(46% 0.13 245)",
    gridCoord: "D-3",
  },
  4: {
    id: 4,
    x: 610,
    y: 360,
    routeTitle: "ROUTE 4 · MERCHANTS RUN",
    landmarkTitle: "Coppergate Trade Square",
    biome: "metropolis",
    biomeLabel: "Trade Capital",
    attribute: "cha",
    dangerRating: "Bustling Urban",
    encounterAdvice: "Social outreach, reconnecting with colleagues, negotiations, and calls.",
    color: "oklch(52% 0.16 345)",
    gridCoord: "F-4",
  },
  5: {
    id: 5,
    x: 800,
    y: 500,
    routeTitle: "ROUTE 5 · SMELTER PASS",
    landmarkTitle: "The Obsidian Forgeways",
    biome: "volcanic",
    biomeLabel: "Volcanic Crags",
    attribute: "str",
    dangerRating: "Molten Peril",
    encounterAdvice: "Gym training, endurance athletics, heavy lifting, and physical discipline.",
    color: "oklch(48% 0.15 28)",
    gridCoord: "H-5",
  },
  6: {
    id: 6,
    x: 400,
    y: 160,
    routeTitle: "ROUTE 6 · SENTINEL PASS",
    landmarkTitle: "Vigil Keep Citadel",
    biome: "fortress",
    biomeLabel: "Highland Bastion",
    attribute: "dis",
    dangerRating: "Iron Stronghold",
    encounterAdvice: "Administrative organization, structured schedules, and completing overdue tasks.",
    color: "oklch(48% 0.04 60)",
    gridCoord: "D-2",
  },
  7: {
    id: 7,
    x: 680,
    y: 160,
    routeTitle: "ROUTE 7 · MIST BOARDWALK",
    landmarkTitle: "The Sunken Mirror Fen",
    biome: "swamp",
    biomeLabel: "Mystic Wetlands",
    attribute: "vit",
    dangerRating: "Misty Mire",
    encounterAdvice: "Mindful meditation, reflection on growth, and clearing mental obstacles.",
    color: "oklch(44% 0.10 155)",
    gridCoord: "G-2",
  },
  8: {
    id: 8,
    x: 540,
    y: 70,
    routeTitle: "ROUTE 8 · CELESTIAL STAIR",
    landmarkTitle: "Mount Ledgerline Summit",
    biome: "mountain",
    biomeLabel: "Glacial Pinnacle",
    attribute: "int",
    dangerRating: "Legendary Apex",
    encounterAdvice: "Synthesizing masteries across all six attributes to seal the ultimate chronicle.",
    color: "oklch(72% 0.14 92)",
    gridCoord: "E-1",
  },
};

// Route ribbons between locations
interface RouteSegment {
  id: number;
  name: string;
  fromId: number;
  toId: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  mid: { x: number; y: number };
  label: string;
}

const ROUTES: RouteSegment[] = [
  {
    id: 1,
    name: "Route 1",
    fromId: 1,
    toId: 2,
    from: { x: 170, y: 500 },
    to: { x: 170, y: 320 },
    mid: { x: 170, y: 410 },
    label: "RT 1",
  },
  {
    id: 2,
    name: "Route 2",
    fromId: 2,
    toId: 3,
    from: { x: 170, y: 320 },
    to: { x: 400, y: 320 },
    mid: { x: 285, y: 320 },
    label: "RT 2",
  },
  {
    id: 3,
    name: "Route 3",
    fromId: 3,
    toId: 4,
    from: { x: 400, y: 320 },
    to: { x: 610, y: 360 },
    mid: { x: 505, y: 340 },
    label: "RT 3",
  },
  {
    id: 4,
    name: "Route 4",
    fromId: 4,
    toId: 5,
    from: { x: 610, y: 360 },
    to: { x: 800, y: 500 },
    mid: { x: 705, y: 430 },
    label: "RT 4",
  },
  {
    id: 5,
    name: "Route 5",
    fromId: 3,
    toId: 6,
    from: { x: 400, y: 320 },
    to: { x: 400, y: 160 },
    mid: { x: 400, y: 240 },
    label: "RT 5",
  },
  {
    id: 6,
    name: "Route 6",
    fromId: 6,
    toId: 7,
    from: { x: 400, y: 160 },
    to: { x: 680, y: 160 },
    mid: { x: 540, y: 160 },
    label: "RT 6",
  },
  {
    id: 7,
    name: "Route 7",
    fromId: 6,
    toId: 8,
    from: { x: 540, y: 160 },
    to: { x: 540, y: 70 },
    mid: { x: 540, y: 115 },
    label: "RT 7",
  },
];

// Color palette constants for pixel terrains
const C = {
  oceanDeep: "#1a3654",
  oceanMid: "#254b73",
  oceanShallow: "#3a6994",
  oceanWave: "#4d82b0",
  beachSand: "#deb87a",
  beachSandLight: "#ebd59b",
  grassBase: "#5c943b",
  grassDark: "#4a7a2e",
  grassLight: "#73ad4b",
  flowerYellow: "#edd653",
  flowerRed: "#e04b4b",
  forestDark: "#1e4726",
  forestMid: "#2c6436",
  forestLight: "#3e854b",
  forestTrunk: "#543823",
  riverBase: "#2b6b9e",
  riverFoam: "#bde4ff",
  stoneDark: "#403d39",
  stoneMid: "#6b665f",
  stoneLight: "#99938b",
  stonePave: "#c4b097",
  roofRed: "#c24436",
  roofBlue: "#2b659c",
  roofGreen: "#3b8053",
  roofGold: "#c98f28",
  volcanoRock: "#48261e",
  volcanoRed: "#783b28",
  volcanoLava: "#f97316",
  keepGranite: "#3e4854",
  keepLight: "#5a6878",
  keepRoof: "#293747",
  swampDark: "#153d40",
  swampLily: "#22c55e",
  snowBase: "#e8eff7",
  snowRock: "#3f4957",
  snowHighlight: "#ffffff",
  ink: "#2b2724",
  inkDim: "#4a453f",
  inkFaint: "#736c64",
  roadBorder: "#1f1d1b",
  roadFill: "#e4cfab",
  roadFillActive: "#f0dfb8",
  roadDash: "#806d4e",
};

/**
 * Pixel tree generator helper component
 */
function PixelTree({
  x,
  y,
  kind = "pine",
  scale = 1,
}: {
  x: number;
  y: number;
  kind?: "pine" | "round" | "swamp";
  scale?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Drop shadow */}
      <ellipse cx="0" cy="11" rx="9" ry="3.5" fill="rgba(24, 38, 20, 0.35)" />
      {/* Trunk */}
      <rect x="-2" y="3" width="4" height="8" fill={kind === "swamp" ? "#312a23" : C.forestTrunk} />
      {kind === "pine" ? (
        <>
          {/* Bottom tier */}
          <polygon points="0,-2 -11,8 11,8" fill={C.forestDark} />
          <polygon points="0,-2 -9,7 0,7" fill={C.forestLight} />
          {/* Middle tier */}
          <polygon points="0,-8 -9,0 9,0" fill={C.forestDark} />
          <polygon points="0,-8 -7,-1 0,-1" fill={C.forestLight} />
          {/* Top tier */}
          <polygon points="0,-14 -6,-6 6,-6" fill={C.forestMid} />
          <polygon points="0,-14 -5,-7 0,-7" fill={C.forestLight} />
        </>
      ) : kind === "swamp" ? (
        <>
          {/* Weeping willow / swamp tree */}
          <circle cx="0" cy="-4" r="10" fill={C.swampDark} />
          <circle cx="-3" cy="-6" r="6" fill="#2d5e5c" />
          <path d="M-8 2 Q-10 10 -7 14 M-4 4 Q-5 11 -3 13 M4 4 Q5 12 3 14 M8 2 Q10 11 7 13" stroke="#2d5e5c" strokeWidth="1.5" fill="none" />
        </>
      ) : (
        <>
          {/* Round oak tree */}
          <circle cx="0" cy="-2" r="9" fill={C.forestDark} />
          <circle cx="0" cy="-4" r="8" fill={C.forestMid} />
          <circle cx="-3" cy="-6" r="5" fill={C.forestLight} />
          <circle cx="3" cy="-3" r="4" fill={C.forestLight} />
        </>
      )}
    </g>
  );
}

/**
 * Retro Pixel Hero Sprite ("YOU ARE HERE")
 */
function RetroPlayerSprite({
  x,
  y,
  level,
}: {
  x: number;
  y: number;
  level: number;
}) {
  return (
    <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
      {/* Radar pulse rings under feet */}
      <circle r="22" fill="none" stroke="oklch(45% 0.13 30)" strokeWidth="2" strokeDasharray="4 3" className="map-radar-pulse" />
      <circle r="13" fill="none" stroke="oklch(72% 0.14 92)" strokeWidth="1.8" />
      <circle r="7" fill="rgba(217, 105, 36, 0.25)" />

      {/* Hero animated bob */}
      <g className="hero-idle-bob" transform="translate(0, -18)">
        {/* Floating "YOU / 1P" Retro arcade badge */}
        <g transform="translate(0, -22)">
          <rect x="-19" y="-11" width="38" height="13" rx="2" fill="#c02626" stroke="#ffffff" strokeWidth="1.5" />
          <text x="0" y="-2" textAnchor="middle" fontSize="7" fontFamily="var(--font-display)" fontWeight="bold" fill="#ffffff">
            LV {level}
          </text>
          {/* Downward triangle indicator */}
          <polygon points="-4,2 4,2 0,6" fill="#c02626" />
        </g>

        {/* 16-bit adventurer sprite */}
        {/* Shadow */}
        <ellipse cx="0" cy="18" rx="8" ry="3" fill="rgba(0,0,0,0.4)" />
        {/* Boots */}
        <rect x="-5" y="14" width="4" height="4" fill="#3b251a" />
        <rect x="1" y="14" width="4" height="4" fill="#3b251a" />
        {/* Pants */}
        <rect x="-4" y="11" width="8" height="4" fill="#2d3748" />
        {/* Tunic / Body */}
        <rect x="-5" y="4" width="10" height="8" rx="1" fill="#2b6cb0" />
        {/* Gold belt */}
        <rect x="-5" y="8" width="10" height="2" fill="#d69e2e" />
        <rect x="-1.5" y="7.5" width="3" height="3" fill="#ecc94b" />
        {/* Red Adventurer Cape / Scarf */}
        <path d="M-6 4 Q-9 10 -7 13 L-4 13 Q-5 8 -4 4 Z" fill="#e53e3e" />
        {/* Head / Face */}
        <rect x="-4" y="-3" width="8" height="7" rx="1" fill="#fed7aa" />
        {/* Eyes (pixel dots) */}
        <rect x="-2" y="-1" width="1.5" height="1.5" fill="#1a202c" />
        <rect x="1.5" y="-1" width="1.5" height="1.5" fill="#1a202c" />
        {/* Cap / Headband (Red cap with visor like Pokemon trainer) */}
        <path d="M-5 -3 L5 -3 L4 -7 L-4 -7 Z" fill="#e53e3e" />
        <rect x="-6" y="-3" width="12" height="2" rx="0.5" fill="#c53030" />
        <rect x="2" y="-3" width="4" height="1.5" fill="#ffffff" />
        {/* Walking Staff / Sword */}
        <line x1="7" y1="16" x2="7" y2="-4" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7" cy="-5" r="2" fill="#ecc94b" />
      </g>
    </g>
  );
}

/**
 * Interactive Zone Landmark Sprite & Pin
 */
function ZoneLandmark({
  zone,
  meta,
  unlocked,
  isLatest,
  isSelected,
  onSelect,
}: {
  zone: Zone;
  meta: ZoneMeta;
  unlocked: boolean;
  isLatest: boolean;
  isSelected: boolean;
  onSelect: (z: Zone) => void;
}) {
  const { x, y } = meta;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={() => onSelect(zone)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(zone);
        }
      }}
      aria-label={`${zone.name} (${unlocked ? "Walked" : "Locked at Lv " + zone.unlock_level})`}
      className="cursor-pointer group"
    >
      {/* Broad interactive hit area */}
      <circle r="26" fill="transparent" />

      {/* Selected Halo / Target Ring */}
      {isSelected && (
        <circle
          r="23"
          fill="none"
          stroke="oklch(45% 0.13 30)"
          strokeWidth="2.5"
          strokeDasharray="4 3"
          className="cursor-blink"
        />
      )}

      {/* Latest Unlocked Beacon Glow */}
      {unlocked && isLatest && !isSelected && (
        <circle
          r="20"
          fill="none"
          stroke="oklch(72% 0.14 92)"
          strokeWidth="2"
          strokeDasharray="3 3"
          className="cursor-blink"
        />
      )}

      {/* Landmark Building / Visual Art */}
      <g transform="translate(0, -6)">
        {meta.biome === "coastal" && (
          /* Hearthstead Cottage: Thatch roof, brick chimney, wooden door */
          <g>
            <rect x="-14" y="-3" width="28" height="15" rx="1" fill="#d9c39e" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-16 -18,-2 18,-2" fill={unlocked ? C.roofRed : "#554c46"} stroke={C.ink} strokeWidth="1.5" />
            <rect x="7" y="-14" width="4" height="7" fill="#8c4436" stroke={C.ink} strokeWidth="1" />
            {unlocked && <circle cx="9" cy="-17" r="1.8" fill="rgba(255,255,255,0.7)" />}
            <rect x="-3" y="2" width="6" height="10" fill="#694022" />
            <rect x="-10" y="2" width="4" height="4" fill={unlocked ? "#fef08a" : "#69635b"} stroke={C.ink} strokeWidth="0.8" />
            <rect x="7" y="2" width="4" height="4" fill={unlocked ? "#fef08a" : "#69635b"} stroke={C.ink} strokeWidth="0.8" />
          </g>
        )}

        {meta.biome === "forest" && (
          /* Milkwood Forest Lodge */
          <g>
            <rect x="-13" y="-2" width="26" height="14" rx="1" fill="#826647" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-16 -17,-1 17,-1" fill={unlocked ? C.roofGreen : "#444a45"} stroke={C.ink} strokeWidth="1.5" />
            <rect x="-3" y="2" width="6" height="10" fill="#4d321d" />
            <circle cx="0" cy="-8" r="3.5" fill={unlocked ? "#fef08a" : "#555"} stroke={C.ink} strokeWidth="1" />
          </g>
        )}

        {meta.biome === "river" && (
          /* Inkfall Bridge Pier & Sage Shrine */
          <g>
            <rect x="-16" y="2" width="32" height="8" rx="2" fill="#756f67" stroke={C.ink} strokeWidth="1.5" />
            <path d="M-12 10 Q-6 4 0 10 Q6 4 12 10" fill="none" stroke={C.riverBase} strokeWidth="2" />
            {/* Shrine tower */}
            <rect x="-6" y="-12" width="12" height="14" fill="#94918a" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-20 -9,-11 9,-11" fill={unlocked ? C.roofBlue : "#465057"} stroke={C.ink} strokeWidth="1.5" />
            <circle cx="0" cy="-6" r="2.5" fill={unlocked ? "#60a5fa" : "#555"} />
          </g>
        )}

        {meta.biome === "metropolis" && (
          /* Coppergate Grand Guildhouse & Clocktower */
          <g>
            <rect x="-18" y="-4" width="36" height="16" fill="#ba9f7f" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="-8,-4 -19,-4 -14,-13" fill={unlocked ? C.roofGold : "#444"} stroke={C.ink} strokeWidth="1" />
            <polygon points="8,-4 19,-4 14,-13" fill={unlocked ? C.roofGold : "#444"} stroke={C.ink} strokeWidth="1" />
            {/* Center Clocktower */}
            <rect x="-8" y="-18" width="16" height="14" fill="#d1b897" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-27 -10,-17 10,-17" fill={unlocked ? C.roofRed : "#553b3b"} stroke={C.ink} strokeWidth="1.5" />
            <circle cx="0" cy="-10" r="3.5" fill="#fef08a" stroke={C.ink} strokeWidth="1" />
            <line x1="0" y1="-10" x2="0" y2="-12" stroke={C.ink} strokeWidth="1" />
            <line x1="0" y1="-10" x2="2" y2="-10" stroke={C.ink} strokeWidth="1" />
          </g>
        )}

        {meta.biome === "volcanic" && (
          /* Forgeways Anvil & Smelter Furnace */
          <g>
            <rect x="-15" y="-3" width="30" height="15" fill="#593226" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-15 -18,-2 18,-2" fill={unlocked ? "#853621" : "#3b2b27"} stroke={C.ink} strokeWidth="1.5" />
            {/* Chimney with orange ember */}
            <rect x="7" y="-17" width="5" height="10" fill="#3b2b27" stroke={C.ink} strokeWidth="1" />
            {unlocked && <circle cx="9.5" cy="-19" r="2" fill="#f97316" />}
            <rect x="-4" y="2" width="8" height="10" fill={unlocked ? "#ea580c" : "#2e1e19"} />
          </g>
        )}

        {meta.biome === "fortress" && (
          /* Vigil Keep Citadel & Crenellated Watchtowers */
          <g>
            <rect x="-16" y="-6" width="32" height="18" fill="#4d5a6b" stroke={C.ink} strokeWidth="1.5" />
            {/* Crenellations */}
            <rect x="-16" y="-9" width="5" height="4" fill="#4d5a6b" stroke={C.ink} strokeWidth="1" />
            <rect x="-7" y="-9" width="5" height="4" fill="#4d5a6b" stroke={C.ink} strokeWidth="1" />
            <rect x="2" y="-9" width="5" height="4" fill="#4d5a6b" stroke={C.ink} strokeWidth="1" />
            <rect x="11" y="-9" width="5" height="4" fill="#4d5a6b" stroke={C.ink} strokeWidth="1" />
            {/* Gatehouse portcullis */}
            <path d="M-5 12 L-5 2 Q0 -2 5 2 L5 12 Z" fill="#242930" stroke={C.ink} strokeWidth="1.2" />
            {/* Royal pennant */}
            {unlocked && (
              <polygon points="13,-18 21,-14 13,-10" fill="#e53e3e" stroke={C.ink} strokeWidth="0.8" />
            )}
            <line x1="13" y1="-8" x2="13" y2="-18" stroke={C.ink} strokeWidth="1.2" />
          </g>
        )}

        {meta.biome === "swamp" && (
          /* Mirror Fen Stilt Sanctuary */
          <g>
            {/* Stilt legs */}
            <line x1="-10" y1="5" x2="-10" y2="13" stroke="#2c2720" strokeWidth="1.8" />
            <line x1="10" y1="5" x2="10" y2="13" stroke="#2c2720" strokeWidth="1.8" />
            <rect x="-14" y="-4" width="28" height="10" rx="1" fill="#435e5a" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-15 -17,-3 17,-3" fill={unlocked ? "#24615a" : "#2d3836"} stroke={C.ink} strokeWidth="1.5" />
            <circle cx="0" cy="1" r="3" fill={unlocked ? "#38bdf8" : "#444"} />
          </g>
        )}

        {meta.biome === "mountain" && (
          /* Mount Ledgerline Peak Temple & Star */
          <g>
            <polygon points="0,-24 -18,10 18,10" fill="#64748b" stroke={C.ink} strokeWidth="1.5" />
            <polygon points="0,-24 -11,-8 11,-8" fill="#f8fafc" stroke={C.ink} strokeWidth="1" />
            {/* Golden Star Altar */}
            <polygon
              points="0,-31 2.5,-25 8,-25 3.5,-21 5.5,-16 0,-19 -5.5,-16 -3.5,-21 -8,-25 -2.5,-25"
              fill={unlocked ? "#fbbf24" : "#64748b"}
              stroke={C.ink}
              strokeWidth="0.8"
            />
          </g>
        )}
      </g>

      {/* Classic Pokémon Pin / Badge Marker */}
      <g transform="translate(0, 16)">
        {unlocked ? (
          <>
            {/* Outer badge */}
            <rect
              x="-11"
              y="-7"
              width="22"
              height="14"
              rx="3"
              fill={meta.color}
              stroke={C.ink}
              strokeWidth="1.8"
            />
            <text
              x="0"
              y="3.2"
              textAnchor="middle"
              fontSize="8"
              fontFamily="var(--font-display)"
              fontWeight="bold"
              fill="#ffffff"
            >
              {zone.id}
            </text>
          </>
        ) : (
          <>
            {/* Locked badge with lock */}
            <rect
              x="-12"
              y="-7"
              width="24"
              height="14"
              rx="3"
              fill="#6b665f"
              stroke={C.ink}
              strokeWidth="1.6"
              strokeDasharray="2 1.5"
            />
            <text
              x="-2"
              y="3.2"
              textAnchor="middle"
              fontSize="7"
              fontFamily="var(--font-display)"
              fontWeight="bold"
              fill="#d6d1ca"
            >
              ?
            </text>
            <circle cx="6" cy="0" r="2.5" fill="#383531" />
          </>
        )}
      </g>

      {/* Zone Name Label Pill */}
      <g transform="translate(0, 31)">
        <rect
          x="-38"
          y="-6"
          width="76"
          height="12"
          rx="2"
          fill="rgba(245, 238, 222, 0.95)"
          stroke={C.ink}
          strokeWidth="1"
        />
        <text
          x="0"
          y="2.5"
          textAnchor="middle"
          fontSize="6"
          fontFamily="var(--font-display)"
          fontWeight="bold"
          fill={unlocked ? C.ink : C.inkFaint}
          className="tracking-wider uppercase"
        >
          {unlocked ? zone.name.slice(0, 14) : `Lv ${zone.unlock_level} Required`}
        </text>
      </g>
    </g>
  );
}

/**
 * Main WorldMap Component
 */
export function WorldMap({
  zones,
  profile,
  attributes = [],
}: {
  zones: Zone[];
  profile: Profile;
  attributes?: AttributeRow[];
}) {
  const reduce = useReducedMotion();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map state
  const ordered = useMemo(() => [...zones].sort((a, b) => a.order_index - b.order_index), [zones]);
  const unlocked = useMemo(() => ordered.filter((z) => profile.level >= z.unlock_level), [ordered, profile.level]);
  const latestZone = unlocked.length > 0 ? unlocked[unlocked.length - 1] : ordered[0];

  const [selectedZone, setSelectedZone] = useState<Zone>(latestZone ?? ordered[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Arcade retro toggles
  const [crtScanlines, setCrtScanlines] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const selectedMeta = ZONE_METAS[selectedZone?.id ?? 1] ?? ZONE_METAS[1];
  const isSelectedUnlocked = profile.level >= (selectedZone?.unlock_level ?? 1);

  // Sound handler
  const playSfx = useCallback(
    (type: "blip" | "chirp") => {
      if (!soundEnabled) return;
      if (type === "blip") playMapBlip();
      else playRouteChirp();
    },
    [soundEnabled]
  );

  // Focus & Center on a specific zone
  const focusZone = useCallback(
    (z: Zone) => {
      setSelectedZone(z);
      playSfx("blip");
      const meta = ZONE_METAS[z.id];
      if (meta && zoomLevel > 1) {
        // Smoothly adjust pan so the zone is centered
        const targetX = (480 - meta.x) * (zoomLevel - 1);
        const targetY = (320 - meta.y) * (zoomLevel - 1);
        setPanOffset({
          x: Math.max(-200, Math.min(200, targetX)),
          y: Math.max(-160, Math.min(160, targetY)),
        });
      }
    },
    [playSfx, zoomLevel]
  );

  // Reset viewport to default
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    playSfx("blip");
  };

  // Center specifically on the player's active location
  const centerOnPlayer = () => {
    if (latestZone) {
      focusZone(latestZone);
      playSfx("chirp");
    }
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Bounds limit based on zoom
    const maxPanX = 260 * zoomLevel;
    const maxPanY = 200 * zoomLevel;
    setPanOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // D-Pad pan nudge
  const nudgePan = (dx: number, dy: number) => {
    setPanOffset((prev) => ({
      x: Math.max(-300, Math.min(300, prev.x + dx)),
      y: Math.max(-250, Math.min(250, prev.y + dy)),
    }));
    playSfx("blip");
  };

  // Next / Previous zone selection (Game Boy D-pad feeling)
  const stepZone = (delta: number) => {
    const currentIndex = ordered.findIndex((z) => z.id === selectedZone?.id);
    const nextIndex = (currentIndex + delta + ordered.length) % ordered.length;
    focusZone(ordered[nextIndex]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ================= MAIN ARCADE CABINET FRAME ================= */}
      <Window
        as="section"
        className="overflow-hidden border-2 border-window-border bg-window shadow-2xl"
      >
        {/* Arcade Console Top Bezel */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-window-border bg-[#2c2621] px-4 py-2.5 text-[#f4ecd8]">
          <div className="flex items-center gap-2.5">
            {/* Blinking Arcade Power LED */}
            <span
              className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444] animate-pulse"
              title="Arcade GPS Active"
            />
            <span className="pixel-text text-[10px] tracking-wider text-[#e6cf9f]">
              TOWN MAP SYSTEM // REV 2.6
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[#9c8e76] font-mono">
              [SUNKEN ROAD REGION]
            </span>
          </div>

          {/* Console Controls & Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playMapBlip();
              }}
              className={`flex h-7 items-center gap-1 px-2 rounded border text-[10px] font-bold uppercase transition-colors ${
                soundEnabled
                  ? "border-[#d4a359] bg-[#4a3a27] text-[#fbe1b3]"
                  : "border-[#4a4238] bg-[#211c17] text-[#7d7162]"
              }`}
              title="Toggle 8-Bit Chiptune SFX"
              aria-label="Toggle sound"
            >
              {soundEnabled ? <SpeakerHigh size={13} weight="fill" /> : <SpeakerSimpleSlash size={13} />}
              <span className="hidden md:inline">SFX</span>
            </button>

            {/* CRT Scanline Toggle */}
            <button
              onClick={() => setCrtScanlines(!crtScanlines)}
              className={`flex h-7 items-center gap-1 px-2 rounded border text-[10px] font-bold uppercase transition-colors ${
                crtScanlines
                  ? "border-[#60a5fa] bg-[#1e2f47] text-[#bfdbfe]"
                  : "border-[#4a4238] bg-[#211c17] text-[#7d7162]"
              }`}
              title="Toggle Retro CRT Scanlines"
              aria-label="Toggle CRT filter"
            >
              <Television size={13} weight="duotone" />
              <span className="hidden md:inline">CRT</span>
            </button>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex h-7 items-center gap-1 px-2 rounded border text-[10px] font-bold uppercase transition-colors ${
                showGrid
                  ? "border-[#4ade80] bg-[#1c3826] text-[#bbf7d0]"
                  : "border-[#4a4238] bg-[#211c17] text-[#7d7162]"
              }`}
              title="Toggle Coordinate Grid"
              aria-label="Toggle grid"
            >
              <GridFour size={13} weight="bold" />
              <span className="hidden md:inline">GRID</span>
            </button>

            {/* Center on Hero */}
            <button
              onClick={centerOnPlayer}
              className="btn-jrpg btn-primary h-7 px-2.5 text-[9px] font-bold tracking-wide"
              title="Snap to Current Location"
            >
              <Crosshair size={12} weight="bold" />
              <span>HERO</span>
            </button>
          </div>
        </div>

        {/* Arcade Viewport Container */}
        <div
          ref={mapContainerRef}
          className={`relative select-none overflow-hidden bg-[#183656] ${
            crtScanlines ? "retro-crt-screen" : ""
          } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ touchAction: "none" }}
        >
          {/* Floating On-Screen Navigation Controls (Top Right) */}
          <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 pointer-events-auto">
            {/* Zoom Controls Pill */}
            <div className="flex flex-col rounded-md border-2 border-window-border bg-parchment/95 p-1 shadow-md">
              <button
                onClick={() => {
                  setZoomLevel((z) => Math.min(1.75, z + 0.25));
                  playSfx("blip");
                }}
                disabled={zoomLevel >= 1.75}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-window-raised disabled:opacity-40 text-ink"
                title="Zoom In"
              >
                <MagnifyingGlassPlus size={15} weight="bold" />
              </button>
              <div className="my-0.5 border-t border-window-border/30 text-center font-mono text-[9px] font-bold text-ink-dim">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                onClick={() => {
                  setZoomLevel((z) => Math.max(1, z - 0.25));
                  playSfx("blip");
                }}
                disabled={zoomLevel <= 1}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-window-raised disabled:opacity-40 text-ink"
                title="Zoom Out"
              >
                <MagnifyingGlassMinus size={15} weight="bold" />
              </button>
              <button
                onClick={resetView}
                className="mt-1 flex h-7 w-7 items-center justify-center rounded border-t border-window-border/40 hover:bg-window-raised text-ink"
                title="Reset View"
              >
                <ArrowsCounterClockwise size={13} weight="bold" />
              </button>
            </div>

            {/* Mini D-Pad for Precise Pan Controls */}
            <div className="hidden sm:grid grid-cols-3 gap-0.5 rounded-md border-2 border-window-border bg-[#2c2621] p-1 shadow-md">
              <div />
              <button
                onClick={() => nudgePan(0, 40)}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#423a33] text-[#f4ecd8] hover:bg-[#5a4f45]"
                title="Pan North"
              >
                <CaretUp size={14} weight="bold" />
              </button>
              <div />
              <button
                onClick={() => nudgePan(40, 0)}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#423a33] text-[#f4ecd8] hover:bg-[#5a4f45]"
                title="Pan West"
              >
                <CaretLeft size={14} weight="bold" />
              </button>
              <button
                onClick={resetView}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#c02626] text-white text-[8px] font-bold"
                title="Center"
              >
                ●
              </button>
              <button
                onClick={() => nudgePan(-40, 0)}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#423a33] text-[#f4ecd8] hover:bg-[#5a4f45]"
                title="Pan East"
              >
                <CaretRight size={14} weight="bold" />
              </button>
              <div />
              <button
                onClick={() => nudgePan(0, -40)}
                className="flex h-6 w-6 items-center justify-center rounded bg-[#423a33] text-[#f4ecd8] hover:bg-[#5a4f45]"
                title="Pan South"
              >
                <CaretDown size={14} weight="bold" />
              </button>
              <div />
            </div>
          </div>

          {/* Compass Rose (Top Left) */}
          <div className="absolute top-3 left-3 z-30 pointer-events-none flex items-center gap-2 rounded-md border-2 border-window-border bg-parchment/90 px-2.5 py-1.5 shadow-md">
            <Compass size={22} weight="duotone" className="text-gold" />
            <div className="flex flex-col">
              <span className="pixel-text text-[9px] font-bold text-ink leading-none">
                SUNKEN ROAD
              </span>
              <span className="text-[8px] text-ink-faint font-mono mt-0.5">
                {selectedMeta.gridCoord} · {selectedMeta.biomeLabel}
              </span>
            </div>
          </div>

          {/* ================= SVG OVERWORLD MAP CANVAS ================= */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: reduce || isDragging ? "none" : "transform 250ms ease-out",
            }}
          >
            <svg
              viewBox="0 0 960 640"
              className="block w-full h-auto min-w-[720px] sm:min-w-full"
              style={{ shapeRendering: "geometricPrecision" }}
            >
              {/* Definitions */}
              <defs>
                {/* Ocean Waves Pattern */}
                <pattern id="wavePattern" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 0 10 Q 10 6 20 10 Q 30 14 40 10"
                    fill="none"
                    stroke={C.oceanWave}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.45"
                  />
                  <path
                    d="M 20 18 Q 25 15 30 18"
                    fill="none"
                    stroke={C.oceanWave}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                </pattern>

                {/* Coordinate Grid Pattern */}
                <pattern id="coordGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="60" height="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                </pattern>

                {/* Fog Cloud Radial */}
                <radialGradient id="fogGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8d99ae" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#64748b" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#475569" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 1. Deep Ocean Base */}
              <rect width="960" height="640" fill={C.oceanDeep} />
              <rect width="960" height="640" fill="url(#wavePattern)" className="map-water-drift" />

              {/* 2. Coastal Shallow Water Layer */}
              <path
                d="M 60 580 Q 90 620 180 620 Q 320 620 380 570 Q 480 540 560 560 Q 680 590 840 580 Q 920 540 920 420 Q 920 300 890 200 Q 860 100 760 70 Q 640 40 540 40 Q 420 40 320 70 Q 180 110 110 200 Q 50 300 60 440 Z"
                fill={C.oceanMid}
                stroke={C.oceanShallow}
                strokeWidth="8"
              />

              {/* 3. Sandy Beach Shoreline Contour */}
              <path
                d="M 80 560 Q 110 590 190 590 Q 310 590 370 540 Q 460 510 550 530 Q 660 560 810 550 Q 880 510 880 410 Q 880 310 850 210 Q 820 120 730 90 Q 630 60 540 60 Q 430 60 340 90 Q 210 130 140 210 Q 80 300 90 430 Z"
                fill={C.beachSand}
                stroke={C.beachSandLight}
                strokeWidth="4"
              />

              {/* 4. Main Grassy Continental Shelf */}
              <path
                d="M 100 540 Q 130 570 190 570 Q 290 570 350 520 Q 440 490 530 510 Q 640 540 780 530 Q 850 490 850 400 Q 850 300 820 210 Q 800 130 710 100 Q 620 75 540 75 Q 440 75 360 100 Q 240 140 160 210 Q 110 300 110 420 Z"
                fill={C.grassBase}
                stroke={C.grassDark}
                strokeWidth="3"
              />

              {/* ================= BIOME TERRAINS ================= */}

              {/* Biome 1: South-West Coastal Plains & Pier (The Hearthstead) */}
              <g id="terrain-hearthstead">
                {/* Village clearing grass */}
                <ellipse cx="170" cy="500" rx="90" ry="60" fill={C.grassLight} />
                {/* Coastal Wooden Pier extending into the sea */}
                <rect x="155" y="555" width="28" height="42" rx="1" fill="#785538" stroke={C.ink} strokeWidth="1.5" />
                <line x1="155" y1="565" x2="183" y2="565" stroke={C.ink} strokeWidth="1" />
                <line x1="155" y1="575" x2="183" y2="575" stroke={C.ink} strokeWidth="1" />
                <line x1="155" y1="585" x2="183" y2="585" stroke={C.ink} strokeWidth="1" />
                {/* Moored Sailboat */}
                <polygon points="190,578 206,578 202,586 186,586" fill="#8c5836" stroke={C.ink} strokeWidth="1" />
                <polygon points="196,564 196,576 204,576" fill="#f8fafc" stroke={C.ink} strokeWidth="0.8" />
                {/* Flower Patches */}
                <circle cx="120" cy="510" r="2" fill={C.flowerRed} />
                <circle cx="124" cy="513" r="1.5" fill={C.flowerYellow} />
                <circle cx="118" cy="516" r="2" fill={C.flowerRed} />
                <circle cx="215" cy="480" r="2" fill={C.flowerYellow} />
                <circle cx="220" cy="483" r="1.8" fill={C.flowerRed} />
                {/* Fences */}
                <line x1="110" y1="465" x2="145" y2="465" stroke="#66462c" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="110" y1="480" x2="145" y2="480" stroke="#66462c" strokeWidth="2" strokeDasharray="3 3" />
              </g>

              {/* Biome 2: West Forest Canopy (Milkwood) */}
              <g id="terrain-milkwood">
                {/* Dark mossy woodland floor */}
                <ellipse cx="170" cy="320" rx="95" ry="85" fill={C.forestDark} />
                {/* Dense Cluster of Trees */}
                <PixelTree x={120} y={260} kind="pine" scale={1.2} />
                <PixelTree x={145} y={250} kind="pine" scale={1.1} />
                <PixelTree x={185} y={255} kind="round" scale={1.2} />
                <PixelTree x={220} y={270} kind="pine" scale={1.3} />
                <PixelTree x={105} y={290} kind="round" scale={1.1} />
                <PixelTree x={135} y={300} kind="pine" scale={1.0} />
                <PixelTree x={230} y={310} kind="round" scale={1.2} />
                <PixelTree x={110} y={345} kind="pine" scale={1.2} />
                <PixelTree x={130} y={365} kind="pine" scale={1.1} />
                <PixelTree x={215} y={355} kind="pine" scale={1.3} />
                <PixelTree x={190} y={375} kind="round" scale={1.0} />
                {/* Toadstools in a fairy ring */}
                <ellipse cx="205" cy="335" rx="3.5" ry="2.5" fill="#dc2626" />
                <circle cx="205" cy="334" r="0.7" fill="#fff" />
                <ellipse cx="212" cy="338" rx="2.5" ry="2" fill="#dc2626" />
              </g>

              {/* Biome 3: Central Inkfall River & Waterfall Rapids */}
              <g id="terrain-inkfall">
                {/* Wide Rushing River meandering from mountain to sea */}
                <path
                  d="M 520 80 Q 490 150 440 220 Q 380 290 400 370 Q 420 440 370 510 Q 340 560 330 640 L 370 640 Q 390 570 420 520 Q 460 450 440 370 Q 420 290 480 210 Q 520 140 550 80 Z"
                  fill={C.riverBase}
                  stroke={C.riverFoam}
                  strokeWidth="2.5"
                />
                {/* Rapids foam marks */}
                <path
                  d="M 410 240 Q 420 244 430 240 M 395 350 Q 410 355 425 350 M 380 460 Q 395 465 410 460"
                  stroke={C.riverFoam}
                  strokeWidth="2"
                  fill="none"
                />
                {/* Stepping Stones */}
                <ellipse cx="380" cy="410" rx="5" ry="3.5" fill={C.stoneMid} stroke={C.ink} strokeWidth="1" />
                <ellipse cx="395" cy="420" rx="4.5" ry="3" fill={C.stoneMid} stroke={C.ink} strokeWidth="1" />
                <ellipse cx="415" cy="415" rx="5" ry="3.5" fill={C.stoneMid} stroke={C.ink} strokeWidth="1" />
              </g>

              {/* Biome 4: Eastern Metropolis (Coppergate Market) */}
              <g id="terrain-coppergate">
                {/* Cobblestone Town Square Base */}
                <rect x="530" y="300" width="160" height="120" rx="6" fill={C.stonePave} stroke={C.stoneDark} strokeWidth="2" />
                {/* Cobble Grid Texture lines */}
                <line x1="530" y1="330" x2="690" y2="330" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="530" y1="360" x2="690" y2="360" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="530" y1="390" x2="690" y2="390" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="4 4" />
                {/* Town Center Water Fountain */}
                <circle cx="610" cy="395" r="9" fill={C.stoneMid} stroke={C.ink} strokeWidth="1.5" />
                <circle cx="610" cy="395" r="6" fill={C.riverBase} />
                <circle cx="610" cy="395" r="2" fill="#ffffff" />
                {/* Street Lamps */}
                <circle cx="545" cy="315" r="2" fill="#fbbf24" stroke={C.ink} strokeWidth="1" />
                <circle cx="675" cy="315" r="2" fill="#fbbf24" stroke={C.ink} strokeWidth="1" />
                <circle cx="545" cy="405" r="2" fill="#fbbf24" stroke={C.ink} strokeWidth="1" />
                <circle cx="675" cy="405" r="2" fill="#fbbf24" stroke={C.ink} strokeWidth="1" />
              </g>

              {/* Biome 5: South-East Volcanic Crags (The Forgeways) */}
              <g id="terrain-forgeways">
                {/* Scorched clay & basalt rock base */}
                <polygon
                  points="700,430 860,420 880,560 750,570 680,510"
                  fill={C.volcanoRed}
                  stroke={C.volcanoRock}
                  strokeWidth="3"
                />
                {/* Tiered Step-Cliffs */}
                <polygon points="730,460 840,450 820,530 740,540" fill={C.volcanoRock} />
                {/* Molten Lava Fissure */}
                <path
                  d="M 720 480 Q 750 495 780 485 Q 810 475 830 500"
                  fill="none"
                  stroke={C.volcanoLava}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Minecart tracks */}
                <line x1="710" y1="525" x2="770" y2="525" stroke="#713f12" strokeWidth="2.5" />
                <line x1="715" y1="520" x2="715" y2="530" stroke="#333" strokeWidth="1" />
                <line x1="730" y1="520" x2="730" y2="530" stroke="#333" strokeWidth="1" />
                <line x1="745" y1="520" x2="745" y2="530" stroke="#333" strokeWidth="1" />
                <line x1="760" y1="520" x2="760" y2="530" stroke="#333" strokeWidth="1" />
              </g>

              {/* Biome 6: North-West Highland Fortress (Vigil Keep) */}
              <g id="terrain-vigil-keep">
                {/* Elevated Granite Mesa Plateau */}
                <polygon
                  points="320,130 480,120 490,210 330,220"
                  fill={C.keepGranite}
                  stroke={C.ink}
                  strokeWidth="2.5"
                />
                <polygon points="320,130 330,220 310,235 300,145" fill={C.stoneDark} />
                {/* Sparring Courtyard Dummies */}
                <circle cx="355" cy="180" r="3" fill="#ca8a04" stroke={C.ink} strokeWidth="1" />
                <line x1="355" y1="183" x2="355" y2="190" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="370" cy="185" r="3" fill="#ca8a04" stroke={C.ink} strokeWidth="1" />
                <line x1="370" y1="188" x2="370" y2="195" stroke="#78350f" strokeWidth="1.5" />
                {/* Cliff Pine Trees */}
                <PixelTree x={325} y={115} kind="pine" scale={0.9} />
                <PixelTree x={475} y={110} kind="pine" scale={0.9} />
              </g>

              {/* Biome 7: North-East Mystic Wetlands (The Mirror Fen) */}
              <g id="terrain-mirror-fen">
                {/* Murky Marshwater Pool */}
                <ellipse cx="680" cy="165" rx="80" ry="55" fill={C.swampDark} stroke="#1f4f4a" strokeWidth="2" />
                {/* Giant Glowing Lilypads */}
                <circle cx="630" cy="150" r="8" fill={C.swampLily} opacity="0.85" />
                <polygon points="630,150 638,148 638,152" fill={C.swampDark} />
                <circle cx="730" cy="155" r="10" fill={C.swampLily} opacity="0.85" />
                <polygon points="730,155 740,153 740,157" fill={C.swampDark} />
                <circle cx="670" cy="200" r="7" fill={C.swampLily} opacity="0.85" />
                {/* Stilted Wooden Boardwalk */}
                <path
                  d="M 610 165 L 660 165 L 685 180 L 730 180"
                  stroke="#7c5328"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 610 165 L 660 165 L 685 180 L 730 180"
                  stroke="#4a3015"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  fill="none"
                />
                {/* Swamp Weeping Trees */}
                <PixelTree x={615} y={130} kind="swamp" scale={1.1} />
                <PixelTree x={740} y={135} kind="swamp" scale={1.1} />
              </g>

              {/* Biome 8: Far North Glacial Summit (Mount Ledgerline) */}
              <g id="terrain-mount-ledgerline">
                {/* High Slate Mountain Base */}
                <polygon points="430,130 540,30 650,130" fill={C.snowRock} stroke={C.ink} strokeWidth="2.5" />
                {/* Snow Clad Summit Peak */}
                <polygon points="480,85 540,30 600,85 570,95 540,80 510,95" fill={C.snowBase} stroke="#ffffff" strokeWidth="1.5" />
                {/* Switchback Cliff Stairway */}
                <path
                  d="M 530 140 L 550 120 L 530 100 L 550 80 L 540 60"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                  fill="none"
                />
                {/* Drifting Summit Cloud Tufts */}
                <g className="map-cloud-drift">
                  <ellipse cx="490" cy="65" rx="16" ry="6" fill="rgba(255,255,255,0.7)" />
                  <ellipse cx="585" cy="55" rx="20" ry="7" fill="rgba(255,255,255,0.7)" />
                </g>
              </g>

              {/* ================= POKEMON ROUTE HIGHWAYS ================= */}
              <g id="routes-layer">
                {ROUTES.map((route) => {
                  const fromUnlocked = profile.level >= (ZONE_METAS[route.fromId]?.id ? (zones.find((z) => z.id === route.fromId)?.unlock_level ?? 99) : 1);
                  const toUnlocked = profile.level >= (ZONE_METAS[route.toId]?.id ? (zones.find((z) => z.id === route.toId)?.unlock_level ?? 99) : 1);
                  const isRouteActive = fromUnlocked && toUnlocked;

                  return (
                    <g key={route.id} className="cursor-pointer" onClick={() => playSfx("chirp")}>
                      {/* Outer Route Border */}
                      <line
                        x1={route.from.x}
                        y1={route.from.y}
                        x2={route.to.x}
                        y2={route.to.y}
                        stroke={C.roadBorder}
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Inner Paved Road Track */}
                      <line
                        x1={route.from.x}
                        y1={route.from.y}
                        x2={route.to.x}
                        y2={route.to.y}
                        stroke={isRouteActive ? C.roadFillActive : C.roadFill}
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                      {/* Dashed Center Route Dividers */}
                      <line
                        x1={route.from.x}
                        y1={route.from.y}
                        x2={route.to.x}
                        y2={route.to.y}
                        stroke={isRouteActive ? "oklch(45% 0.13 30)" : C.roadDash}
                        strokeWidth="1.8"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                      />

                      {/* Route Milestone Badge / Signpost */}
                      <g transform={`translate(${route.mid.x}, ${route.mid.y})`}>
                        <rect
                          x="-14"
                          y="-7"
                          width="28"
                          height="14"
                          rx="2"
                          fill={isRouteActive ? "#ffffff" : "#d8cfbe"}
                          stroke={C.ink}
                          strokeWidth="1.5"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="6.5"
                          fontFamily="var(--font-display)"
                          fontWeight="bold"
                          fill={isRouteActive ? "#c02626" : C.inkDim}
                        >
                          {route.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* ================= ZONE LANDMARKS & PINS ================= */}
              <g id="landmarks-layer">
                {ordered.map((z) => {
                  const meta = ZONE_METAS[z.id] ?? ZONE_METAS[1];
                  const un = profile.level >= z.unlock_level;
                  const isLatest = latestZone?.id === z.id;
                  const isSelected = selectedZone?.id === z.id;

                  return (
                    <ZoneLandmark
                      key={z.id}
                      zone={z}
                      meta={meta}
                      unlocked={un}
                      isLatest={isLatest}
                      isSelected={isSelected}
                      onSelect={focusZone}
                    />
                  );
                })}
              </g>

              {/* ================= FOG OF WAR LAYER ================= */}
              <g id="fog-layer" className="pointer-events-none">
                {ordered.map((z) => {
                  const un = profile.level >= z.unlock_level;
                  if (un) return null;
                  const meta = ZONE_METAS[z.id];
                  if (!meta) return null;

                  return (
                    <g key={`fog-${z.id}`} transform={`translate(${meta.x}, ${meta.y})`}>
                      {/* Fog cloud bank */}
                      <circle r="65" fill="url(#fogGlow)" />
                      {/* Cloud clusters */}
                      <circle cx="-25" cy="-15" r="28" fill="#94a3b8" opacity="0.65" />
                      <circle cx="25" cy="-20" r="32" fill="#cbd5e1" opacity="0.6" />
                      <circle cx="0" cy="20" r="34" fill="#94a3b8" opacity="0.7" />
                      {/* Big Iron Mystery Lock Gate */}
                      <g transform="translate(0, -6)">
                        <circle r="16" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1.8" />
                        <LockSimple size={18} weight="bold" className="text-amber-400" transform="translate(-9, -9)" />
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* ================= PLAYER HERO SPRITE ================= */}
              {latestZone && ZONE_METAS[latestZone.id] && (
                <RetroPlayerSprite
                  x={ZONE_METAS[latestZone.id].x}
                  y={ZONE_METAS[latestZone.id].y}
                  level={profile.level}
                />
              )}

              {/* Optional Retro Coordinate Grid (A-H, 1-6) */}
              {showGrid && (
                <g id="grid-overlay" className="pointer-events-none">
                  <rect width="960" height="640" fill="url(#coordGrid)" />
                  {/* Grid Letter Labels */}
                  {["A", "B", "C", "D", "E", "F", "G", "H"].map((letter, i) => (
                    <text
                      key={letter}
                      x={60 + i * 110}
                      y="18"
                      fontSize="9"
                      fontFamily="var(--font-display)"
                      fontWeight="bold"
                      fill="rgba(255,255,255,0.4)"
                    >
                      {letter}
                    </text>
                  ))}
                  {/* Grid Number Labels */}
                  {[1, 2, 3, 4, 5, 6].map((num, i) => (
                    <text
                      key={num}
                      x="14"
                      y={60 + i * 100}
                      fontSize="9"
                      fontFamily="var(--font-display)"
                      fontWeight="bold"
                      fill="rgba(255,255,255,0.4)"
                    >
                      {num}
                    </text>
                  ))}
                </g>
              )}
            </svg>
          </div>

          {/* Map Footer Bar with Drag & Zoom Instruction */}
          <div className="absolute bottom-2 left-3 z-30 pointer-events-none hidden sm:flex items-center gap-2 rounded bg-black/60 px-2 py-1 text-[9px] font-mono text-[#e5e7eb] backdrop-blur-sm">
            <span>🖱️ CLICK & DRAG TO PAN</span>
            <span>·</span>
            <span>🔍 ZOOM {Math.round(zoomLevel * 100)}%</span>
            <span>·</span>
            <span>📍 CLICK ANY ROUTE TO INSPECT</span>
          </div>
        </div>

        {/* ================= POKEMON-STYLE DIALOGUE HUD ================= */}
        <div className="border-t-2 border-window-border bg-[#ece1c3] p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Classic Dialogue Banner */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="pixel-text text-[10px] font-bold text-gold tracking-widest uppercase">
                  {selectedMeta.routeTitle}
                </span>
                <span className="text-ink-faint">·</span>
                <Chip
                  colorClass="text-ink font-bold"
                  className="bg-window-raised border-window-border text-[9px]"
                >
                  {selectedMeta.biomeLabel}
                </Chip>
                <Chip
                  colorClass="text-ink font-bold"
                  className="bg-window-deep border-window-border text-[9px]"
                >
                  Grid {selectedMeta.gridCoord}
                </Chip>
                {isSelectedUnlocked ? (
                  <span className="inline-flex items-center gap-1 pixel-text text-[9px] text-green-700 font-bold">
                    <CheckCircle size={12} weight="fill" /> DISCOVERED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 pixel-text text-[9px] text-red-700 font-bold">
                    <LockSimple size={12} weight="fill" /> LOCKED (LV {selectedZone.unlock_level})
                  </span>
                )}
              </div>

              {/* Landmark Title */}
              <h3 className="pixel-text text-sm sm:text-base text-ink font-bold leading-tight">
                {isSelectedUnlocked ? selectedZone.name : `Zone ${selectedZone.id} — Fog of War`}
              </h3>

              {/* Dialogue Box Flavor / Lore */}
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-dim font-body max-w-3xl">
                {isSelectedUnlocked
                  ? selectedZone.lore
                  : `Dense enchanted fog blankets this territory. The path will open when your character achieves Total Level ${selectedZone.unlock_level}. (${
                      selectedZone.unlock_level - profile.level > 0
                        ? `${selectedZone.unlock_level - profile.level} more levels to reach`
                        : "Ready to explore"
                    })`}
              </p>

              {/* Recommended Real-World Quest Habit advice */}
              <div className="mt-3 flex items-start gap-2 rounded border border-window-border/50 bg-window-raised/50 p-2 text-xs text-ink-faint font-body">
                <Sparkle size={15} weight="duotone" className="shrink-0 text-gold mt-0.5" />
                <span>
                  <strong className="text-ink-dim font-semibold">Recommended Quests: </strong>
                  {selectedMeta.encounterAdvice}
                </span>
              </div>
            </div>

            {/* Right: Quick Zone Step Buttons & Attribute Affinity */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
              {/* Attribute badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-faint font-semibold uppercase tracking-wider">
                  Attunement:
                </span>
                {(() => {
                  const userAttr = attributes.find((a) => a.attribute === selectedMeta.attribute);
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-[4px] border border-window-border px-2 py-0.5 text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: selectedMeta.color }}
                    >
                      <span>{ATTRIBUTE_META[selectedMeta.attribute]?.label}</span>
                      {userAttr && (
                        <span className="rounded bg-black/25 px-1 py-0.2 text-[10px] font-mono">
                          Lv {userAttr.level}
                        </span>
                      )}
                    </span>
                  );
                })()}
              </div>

              {/* Prev / Next Route Step D-Pad buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => stepZone(-1)}
                  className="btn-jrpg btn-ghost px-2.5 py-1 text-[10px]"
                  title="Previous Zone (Left)"
                >
                  <ArrowLeft size={12} weight="bold" />
                  <span>PREV</span>
                </button>
                <button
                  onClick={() => stepZone(1)}
                  className="btn-jrpg btn-ghost px-2.5 py-1 text-[10px]"
                  title="Next Zone (Right)"
                >
                  <span>NEXT</span>
                  <ArrowRight size={12} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Window>

      {/* ================= EXPEDITION CHRONICLE & ROSTER ================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expedition Progress Card */}
        <Window as="section" className="overflow-hidden lg:col-span-1">
          <WindowTitle right={<MapTrifold size={14} weight="duotone" />}>
            Chronicle Status
          </WindowTitle>
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="pixel-text text-[10px] text-ink-dim">
                  Discovered Regions
                </span>
                <span className="text-xs font-bold text-gold tabular-nums">
                  {unlocked.length} / {ordered.length} ({Math.round((unlocked.length / ordered.length) * 100)}%)
                </span>
              </div>
              <StatBar
                value={unlocked.length}
                max={ordered.length}
                color="var(--color-gold)"
                showNumbers={false}
                size="md"
              />
            </div>

            <div className="rounded border border-window-border bg-window-raised p-3 text-xs leading-relaxed text-ink-dim font-body">
              <p>
                <strong>The Sunken Road</strong> winds across eight sovereign biomes.
                Each tier unlocks as your character sheet grows stronger.
              </p>
              <div className="mt-2.5 pt-2 border-t border-window-border/40 flex items-center justify-between text-[11px] text-ink-faint">
                <span>Current Level: <strong>Lv {profile.level}</strong></span>
                <span>Active: <strong>{latestZone?.name ?? "None"}</strong></span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button
                onClick={centerOnPlayer}
                className="btn-jrpg btn-primary flex-1 py-1.5 text-[10px]"
              >
                <Crosshair size={13} weight="bold" />
                <span>Locate Hero</span>
              </button>
              <button
                onClick={resetView}
                className="btn-jrpg btn-ghost px-3 py-1.5 text-[10px]"
                title="Reset View to Overview"
              >
                <ArrowsCounterClockwise size={13} weight="bold" />
              </button>
            </div>
          </div>
        </Window>

        {/* 8-Zone Fast Travel Directory */}
        <Window as="section" className="overflow-hidden lg:col-span-2">
          <WindowTitle right={<Path size={14} weight="duotone" />}>
            Sunken Road Waypoints (Tap to Fly-To)
          </WindowTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 sm:p-4">
            {ordered.map((z) => {
              const meta = ZONE_METAS[z.id] ?? ZONE_METAS[1];
              const un = profile.level >= z.unlock_level;
              const isSelected = selectedZone?.id === z.id;
              const isCurrent = latestZone?.id === z.id;

              return (
                <button
                  key={z.id}
                  onClick={() => focusZone(z)}
                  className={`flex items-center gap-3 p-2.5 rounded border text-left transition-all ${
                    isSelected
                      ? "border-gold bg-window-raised shadow-sm scale-[1.01]"
                      : "border-window-border/50 bg-parchment hover:bg-window-raised/80"
                  }`}
                  aria-pressed={isSelected}
                >
                  {/* Zone badge number */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 text-[10px] font-bold"
                    style={{
                      backgroundColor: un ? meta.color : "var(--color-parchment-deep)",
                      color: un ? "#ffffff" : "var(--color-ink-faint)",
                      borderColor: isSelected ? "var(--color-gold)" : "var(--color-window-border)",
                    }}
                  >
                    {un ? z.id : "?"}
                  </span>

                  {/* Zone info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`truncate text-xs font-bold ${un ? "text-ink" : "text-ink-faint"}`}>
                        {un ? z.name : "??? (Fog of War)"}
                      </span>
                      {isCurrent && (
                        <span className="pixel-text text-[8px] bg-red-600 text-white px-1 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-ink-faint">
                      <span>{meta.biomeLabel}</span>
                      <span>·</span>
                      <span className="tabular-nums">Lv {z.unlock_level}+</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Window>
      </div>
    </div>
  );
}
