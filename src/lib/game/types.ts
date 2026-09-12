// Shared game vocabulary — one source of truth for client + server shapes.

export type DifficultyTier = "trivial" | "easy" | "medium" | "hard" | "epic";
export type AttributeKey = "str" | "int" | "vit" | "dis" | "cha" | "cra";
export type ItemKind = "frame" | "title" | "badge" | "theme" | "consumable";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const ATTRIBUTE_META: Record<
  AttributeKey,
  { label: string; blurb: string; colorVar: string; examples: string }
> = {
  str: {
    label: "Strength",
    blurb: "Body and vigor",
    colorVar: "--color-str",
    examples: "gym, sports, chores",
  },
  int: {
    label: "Intellect",
    blurb: "Mind and study",
    colorVar: "--color-int",
    examples: "coding, reading, puzzles",
  },
  vit: {
    label: "Vitality",
    blurb: "Health and rest",
    colorVar: "--color-vit",
    examples: "sleep, cooking, hydration",
  },
  dis: {
    label: "Discipline",
    blurb: "Order and follow-through",
    colorVar: "--color-dis",
    examples: "admin, planning, deep work",
  },
  cha: {
    label: "Charisma",
    blurb: "Bonds and words",
    colorVar: "--color-cha",
    examples: "calls, socializing, outreach",
  },
  cra: {
    label: "Craft",
    blurb: "Making and art",
    colorVar: "--color-cra",
    examples: "music, drawing, building",
  },
};

export const TIER_META: Record<
  DifficultyTier,
  { label: string; xp: number; gold: number }
> = {
  trivial: { label: "Trivial", xp: 10, gold: 5 },
  easy: { label: "Easy", xp: 25, gold: 10 },
  medium: { label: "Medium", xp: 50, gold: 20 },
  hard: { label: "Hard", xp: 100, gold: 45 },
  epic: { label: "Epic", xp: 200, gold: 100 },
};

export const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

export const RARITY_CLASS: Record<Rarity, string> = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
};

// ——— DB row shapes (what PostgREST returns) ———

export interface Profile {
  id: string;
  display_name: string;
  class_name: string;
  level: number;
  xp: number;
  gold: number;
  streak_count: number;
  streak_best: number;
  last_active_date: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  profile_id: string;
  title: string;
  notes: string | null;
  tier: DifficultyTier;
  attribute: AttributeKey;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttributeRow {
  attribute: AttributeKey;
  xp: number;
  level: number;
  xp_needed: number;
}

export interface InventoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: ItemKind;
  rarity: Rarity;
  glyph: string;
  price: number;
  quantity: number;
  equipped: boolean;
}

export interface ShopItem extends Omit<InventoryItem, "quantity" | "equipped"> {
  purchasable: boolean;
}

// ——— RPC result shapes ———

export interface CompleteTaskResult {
  xp_gained: number;
  gold_gained: number;
  attribute: AttributeKey;
  attribute_levels_gained: number;
  leveled_up: boolean;
  levels_gained: number;
  new_level: number;
  streak_increased: boolean;
  streak_frozen: boolean;
  profile: Profile;
  attributes: AttributeRow[];
}
