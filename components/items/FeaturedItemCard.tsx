// … imports bleiben gleich

import { Box, Typography } from "@mui/material";
import ItemInventoryPictureBackgrounds from "./ItemInventoryPictureBackgrounds";
import ItemInventoryPictureOnly from "./ItemInventoryPictureOnly";

// Rarity type for item
type Rarity = "common" | "uncommon" | "rare" | "ultra_rare";

// Decoration item type
type DecorationItem = {
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
};

// Kleine Featured-Karte (grüner Rand) für das equipte Item
export default function FeaturedItemCard({
  item,
  onClick,
}: {
  item: DecorationItem;
  onClick: (e: React.MouseEvent, item: DecorationItem) => void;
}) {
  // Farben wie unten im Hauptgrid
  const rarityKey = (item.rarity || "common").toLowerCase().replace(/\s+/g, "");
  const rarityMap: Record<string, { border: string; bg: string }> = {
    common: { border: "#26a0f5", bg: "#e3f2fd" },
    uncommon: { border: "#d4af37", bg: "#fff8e1" },
    rare: { border: "#8e44ad", bg: "#f3e5f5" },
    ultra_rare: { border: "#e53935", bg: "#ffebee" },
  };
  const colors = rarityMap[rarityKey] ?? rarityMap.common;

  return (
    <Box
      onClick={(e) => onClick(e, item)}
      sx={{
        position: "relative",
        border: "3px solid #16c172", // saftiges Grün
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 0 0 3px #16c17233",
        backgroundColor: colors.bg,
        cursor: "pointer",
      }}
    >
      {item.foreColor ? (
        <ItemInventoryPictureBackgrounds
          url={item.url ?? null}
          backColor={item.backColor ?? null}
          foreColor={item.foreColor}
        />
      ) : (
        <ItemInventoryPictureOnly url={item.url ?? null} id={item.id} />
      )}

      {/* Informations about item */}
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <Typography variant="body2">
          <strong>Rarity:</strong> {item.rarity || "Common"}
        </Typography>
      </Box>
    </Box>
  );
}
