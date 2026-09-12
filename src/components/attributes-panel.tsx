"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Barbell,
  Brain,
  Heart,
  Target,
  ChatCircle,
  Hammer,
} from "@phosphor-icons/react";
import type { AttributeKey, AttributeRow } from "@/lib/game/types";
import { ATTRIBUTE_META } from "@/lib/game/types";
import { StatBar, Window, WindowTitle } from "@/components/ui";

const ICONS: Record<AttributeKey, React.ReactNode> = {
  str: <Barbell size={16} weight="duotone" aria-hidden="true" />,
  int: <Brain size={16} weight="duotone" aria-hidden="true" />,
  vit: <Heart size={16} weight="duotone" aria-hidden="true" />,
  dis: <Target size={16} weight="duotone" aria-hidden="true" />,
  cha: <ChatCircle size={16} weight="duotone" aria-hidden="true" />,
  cra: <Hammer size={16} weight="duotone" aria-hidden="true" />,
};

/** The six-stat attribute panel. */
export function AttributesPanel({
  attributes,
}: {
  attributes: AttributeRow[];
}) {
  const reduce = useReducedMotion();

  return (
    <Window as="section" className="overflow-hidden">
      <WindowTitle>Attributes</WindowTitle>
      <ul className="divide-y divide-window-border/40">
        {attributes.map((attr) => {
          const meta = ATTRIBUTE_META[attr.attribute];
          return (
            <motion.li
              key={attr.attribute}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-3 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-window-border bg-window-deep"
                  style={{ color: `var(${meta.colorVar})` }}
                >
                  {ICONS[attr.attribute]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-bold text-ink">
                      {meta.label}
                      <span className="ml-2 text-ink-faint text-xs font-medium tabular-nums">
                        Lv {attr.level}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-faint tabular-nums">
                      {attr.xp}/{attr.xp_needed}
                    </span>
                  </div>
                  <StatBar
                    value={attr.xp}
                    max={attr.xp_needed}
                    color={`var(${meta.colorVar})`}
                    showNumbers={false}
                    size="sm"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Window>
  );
}
