"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { LockSimple, MapTrifold } from "@phosphor-icons/react";
import type { Profile, Zone } from "@/lib/game/types";
import { Window, WindowTitle } from "@/components/ui";

/**
 * The Sunken Road — SVG world map with fog-of-war.
 * 8 zones unlock by total character level. Locked zones sit under fog:
 * named but unreadable, lore revealed only when walked.
 */

// hand-placed waystations along a winding road (viewBox 100x150)
const ZONE_POS: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 132 },
  2: { x: 33, y: 114 },
  3: { x: 62, y: 100 },
  4: { x: 34, y: 82 },
  5: { x: 60, y: 66 },
  6: { x: 37, y: 48 },
  7: { x: 58, y: 30 },
  8: { x: 50, y: 12 },
};

const INK = "oklch(28% 0.03 55)";

function zoneRibbon(id: number): string {
  const palettes = [
    "oklch(44% 0.10 155)", // verdigris
    "oklch(46% 0.13 245)", // cobalt
    "oklch(60% 0.13 70)", // ochre
    "oklch(48% 0.04 60)", // umber
  ];
  return palettes[id % palettes.length];
}

/** One zone marker on the map. */
function ZoneMarker({
  zone,
  unlocked,
  isLatest,
  onSelect,
}: {
  zone: Zone;
  unlocked: boolean;
  isLatest: boolean;
  onSelect: (z: Zone) => void;
}) {
  const pos = ZONE_POS[zone.id] ?? { x: 50, y: 70 };
  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      onClick={() => onSelect(zone)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(zone);
        }
      }}
      aria-label={`${zone.name}${unlocked ? "" : " (locked)"}`}
      className="cursor-pointer"
    >
      {/* hit area */}
      <rect x="-11" y="-11" width="22" height="22" fill="transparent" />
      {unlocked ? (
        <>
          {isLatest && (
            <circle r="9" fill="none" stroke="oklch(45% 0.13 30)" strokeWidth="1.6" strokeDasharray="3 2.5" className="cursor-blink" />
          )}
          <circle r="6.5" fill={zoneRibbon(zone.id)} stroke={INK} strokeWidth="2" />
          <text x="0" y="2.6" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="oklch(96% 0.02 85)">
            {zone.id}
          </text>
        </>
      ) : (
        <>
          <circle r="6.5" fill="oklch(78% 0.045 80)" stroke={INK} strokeWidth="1.6" strokeDasharray="2.5 2" />
          <path d="M-3.4 -0.2 L3.4 -0.2 M0 -3.4 L0 3.4" stroke={INK} strokeWidth="1.6" />
        </>
      )}
    </g>
  );
}

/** The world map — SVG with fog + a road polyline through unlocked zones. */
export function WorldMap({
  zones,
  profile,
}: {
  zones: Zone[];
  profile: Profile;
}) {
  const reduce = useReducedMotion();
  const ordered = [...zones].sort((a, b) => a.order_index - b.order_index);
  const unlocked = ordered.filter((z) => profile.level >= z.unlock_level);
  const latest = unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
  const [selected, setSelected] = useState<Zone | null>(latest);

  const roadPath = ordered
    .map((z, i) => {
      const p = ZONE_POS[z.id] ?? { x: 50, y: 70 };
      return i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      {/* the map itself */}
      <Window as="section" className="overflow-hidden">
        <WindowTitle
          right={
            <span className="pixel-text ledger-nums text-[10px] text-ink-dim">
              Lv {profile.level} · {unlocked.length}/{ordered.length} discovered
            </span>
          }
        >
          The Sunken Road
        </WindowTitle>
        <div className="bg-parchment p-4">
          <svg
            viewBox="0 0 100 150"
            className="mx-auto block w-full max-w-md"
            role="group"
            aria-label="World map of the Sunken Road"
          >
            {/* parchment ground + ruled border */}
            <rect x="2" y="2" width="96" height="146" rx="2" fill="oklch(88% 0.035 86)" stroke={INK} strokeWidth="2" />
            <rect x="5.5" y="5.5" width="89" height="139" fill="none" stroke="oklch(62% 0.03 70 / 0.45)" strokeWidth="1" strokeDasharray="3.5 3" />

            {/* decorative hills — ink hatching only */}
            <path d="M8 40 Q16 32 24 40 M76 92 Q84 84 92 92 M8 104 Q14 98 20 104" fill="none" stroke="oklch(62% 0.03 70 / 0.5)" strokeWidth="1.2" />

            {/* the road */}
            <path d={roadPath} fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="4 3" strokeLinecap="round" />

            {/* markers */}
            {ordered.map((z) => (
              <ZoneMarker
                key={z.id}
                zone={z}
                unlocked={profile.level >= z.unlock_level}
                isLatest={latest?.id === z.id}
                onSelect={setSelected}
              />
            ))}
          </svg>
        </div>
      </Window>

      {/* zone detail */}
      <div className="flex flex-col gap-6">
        <Window as="aside" className="overflow-hidden">
          <WindowTitle right={<MapTrifold size={14} weight="duotone" aria-hidden="true" />}>
            {selected ? (profile.level >= selected.unlock_level ? selected.name : "Fog of War") : "Choose a zone"}
          </WindowTitle>
          <div className="p-4 sm:p-5">
            {selected ? (
              profile.level >= selected.unlock_level ? (
                <motion.div
                  key={selected.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                    Zone {selected.id} · unlocked at level {selected.unlock_level}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim font-body">
                    {selected.lore}
                  </p>
                  <p className="mt-4 pixel-text ledger-nums text-[10px] text-gold">
                    ✓ Walked
                  </p>
                </motion.div>
              ) : (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                    Zone {selected.id}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-ink-dim font-body">
                    <LockSimple size={14} weight="bold" aria-hidden="true" />
                    The fog lifts at level {selected.unlock_level}.
                  </p>
                  <p className="mt-2 text-xs text-ink-faint font-body">
                    {profile.level < selected.unlock_level
                      ? `${selected.unlock_level - profile.level} more level${selected.unlock_level - profile.level === 1 ? "" : "s"} to go.`
                      : ""}
                  </p>
                </div>
              )
            ) : (
              <p className="text-sm text-ink-dim font-body">
                Tap a marker to read its chronicle entry.
              </p>
            )}
          </div>
        </Window>

        {/* zone roster */}
        <Window as="section" className="overflow-hidden">
          <WindowTitle>The Chronicle</WindowTitle>
          <ul className="divide-y divide-window-border/40" aria-label="Zone roster">
            {ordered.map((z) => {
              const un = profile.level >= z.unlock_level;
              return (
                <li key={z.id}>
                  <button
                    onClick={() => setSelected(z)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-window-raised/60 ${
                      selected?.id === z.id ? "bg-window-raised/60" : ""
                    }`}
                    aria-pressed={selected?.id === z.id}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border-2 border-window-border text-[10px] font-bold"
                      style={{
                        background: un ? zoneRibbon(z.id) : "var(--color-parchment-deep)",
                        color: un ? "oklch(96% 0.02 85)" : "var(--color-ink-faint)",
                      }}
                    >
                      {un ? z.id : "?"}
                    </span>
                    <span className={`flex-1 truncate text-sm ${un ? "text-ink" : "text-ink-faint"}`}>
                      {un ? z.name : "???".repeat(1)}
                    </span>
                    <span className="ledger-nums shrink-0 text-[10px] text-ink-faint">
                      Lv {z.unlock_level}+
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Window>
      </div>
    </div>
  );
}
