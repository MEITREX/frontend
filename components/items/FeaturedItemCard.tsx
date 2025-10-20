import { Box, Chip } from "@mui/material";
import ItemInventoryPictureBackgrounds from "./ItemInventoryPictureBackgrounds";
import ItemInventoryPictureOnly from "./ItemInventoryPictureOnly";
import { DecorationItem, Rarity, rarityMap } from "./types/Types";

// Displays the equiped card
export default function FeaturedItemCard({
  item,
  onClick,
}: {
  item: DecorationItem;
  onClick: (e: React.MouseEvent, item: DecorationItem) => void;
}) {
  // Colors like background
  const rarityKey = (item.rarity || "common").toLowerCase().replace(/\s+/g, "");

  const colors = rarityMap[rarityKey as Rarity] ?? rarityMap.common;

  // Define label to dsiplay
  const rarityLabel =
    item.rarity === "ultra_rare"
      ? "Ultra Rare"
      : item.rarity?.charAt(0).toUpperCase() +
        (item.rarity?.slice(1) ?? "Common");

  return (
    <Box
      onClick={(e) => onClick(e, item)}
      sx={{
        position: "relative",
        border: "3px solid #16c172",
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
      <Box
        sx={{
          px: 2,
          pb: 2,
          pt: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Chip
          label={rarityLabel.replace("_", " ").toUpperCase()}
          size="small"
          sx={{
            bgcolor: rarityMap[rarityKey as Rarity].border ?? rarityMap.common,
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "bold",
            borderRadius: 1,
            height: 20, 
            "& .MuiChip-label": {
              px: 1.2, 
              py: 0, 
            },
          }}
        />
      </Box>
    </Box>
  );
}
