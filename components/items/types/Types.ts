// Types for items
export type ItemStringType =
  | "colorThemes"
  | "patternThemes"
  | "profilePicFrames"
  | "profilePics"
  | "tutors";

// Rarity type for item
export type Rarity = "default" | "common" | "uncommon" | "rare" | "ultra_rare";

// Decoration item type
export type DecorationItem = {
  id: string;
  backColor: string | null;
  description: string;
  url: string | null;
  foreColor: string | null;
  name: string;
  rarity: Rarity;
  sellCompensation: number;
  moneyCost: number;
  unlocked: boolean;
  equipped: boolean;
  unlockedTime: string | null;
  obtainableInShop: boolean | null;
};

interface RarityStyle {
  border: string;
  bg: string;
}

export const rarityMap: Record<Rarity, RarityStyle> = {
  default: { border: "#26a0f5", bg: "#e3f2fd" }, // blue
  common: { border: "#26a0f5", bg: "#e3f2fd" }, // blue
  uncommon: { border: "#d4af37", bg: "#fff8e1" }, // gold
  rare: { border: "#8e44ad", bg: "#f3e5f5" }, // purple
  ultra_rare: { border: "#e53935", bg: "#ffebee" }, // red
};
