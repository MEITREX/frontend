import DecoParser from "@/components/DecoParser";
import decorationsData from "@/itemSchema.json";

export type Rarity = "common" | "uncommon" | "rare" | "ultra_rare";

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
  obtainableInShop?: boolean;
};

type DecorationCategory = keyof typeof decorationsData;

export function getItemsMerged(
  inventoryForUser: any,
  itemStringType?: string
): DecorationItem[] {
  const itemIds = inventoryForUser.items.map((item: any) => item.id);

  let itemsParsed = DecoParser(itemIds, (itemStringType as DecorationCategory) ?? "colorThemes")
    .concat(DecoParser(itemIds, "patternThemes"))
    .concat(DecoParser(itemIds, "profilePics"))
    .concat(DecoParser(itemIds, "profilePicFrames"))
    .concat(DecoParser(itemIds, "tutors"));

  if (itemStringType) {
    itemsParsed = DecoParser(itemIds, itemStringType as DecorationCategory);
    if (itemStringType === "colorThemes") {
      itemsParsed = itemsParsed.concat(DecoParser(itemIds, "patternThemes"));
    } else if (itemStringType === "patternThemes") {
      itemsParsed = itemsParsed.concat(DecoParser(itemIds, "colorThemes"));
    }
  }

  const itemStatusMap = Object.fromEntries(
    inventoryForUser.items.map((item: any) => [
      item.id,
      {
        unlocked: item.unlocked,
        equipped: item.equipped,
        unlockedTime: item.unlockedTime,
      },
    ])
  );

  return itemsParsed.map((item) => ({
    ...(item as DecorationItem),
    ...itemStatusMap[item.id],
  })) as DecorationItem[];
}

export function getUnlockedItems(
  inventoryForUser: any,
  itemStringType?: string
): DecorationItem[] {
  return getItemsMerged(inventoryForUser, itemStringType).filter((item) => item.unlocked);
}

export function getUnlockedItemsAndNotEquiped(
  inventoryForUser: any,
  itemStringType?: string
): DecorationItem[] {
  return getItemsMerged(inventoryForUser, itemStringType).filter((item) => item.unlocked && !item.equipped);
}

