import decorationsData from "./../itemSchema.json";

// Rarity type for item
type Rarity = "common" | "uncommon" | "rare" | "ultra_rare";

// Decoration item type
type DecorationItem = {
  id: string;
  description: string;
  url: string | null;
  name: string;
  rarity: Rarity;
  sellCompensation: number;
  moneyCost: number;
};

type DecorationCategory = keyof typeof decorationsData;

export default function parseDecorations(
  ids: string[],
  category: DecorationCategory
): DecorationItem[] {
  const categoryArray = decorationsData[category];

  if (!Array.isArray(categoryArray)) {
    console.warn(`Category "${category}" is not an array`);
    return [];
  }

  return ids.flatMap((id) => {
    const match = (categoryArray as DecorationItem[]).find(
      (item) => item.id === id
    );
    return match ? [match] : [];
  });
}
