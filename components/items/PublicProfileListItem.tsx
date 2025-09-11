"use client";

import { ItemsApiItemInventoryForUserByIdQuery } from "@/__generated__/ItemsApiItemInventoryForUserByIdQuery.graphql";
import { useSort } from "@/components/contexts/SortContext";
import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import DecorationPopup from "./DecorationPopup";
import FeaturedItemCard from "./FeaturedItemCard";
import ItemInventoryPictureBackgrounds from "./ItemInventoryPictureBackgrounds";
import ItemInventoryPictureOnly from "./ItemInventoryPictureOnly";
import UnequipCard from "./UnequipCard";
import { getItemsByUserQuery } from "./api/ItemsApi";
import { getPublicProfileItemsMerged } from "./logic/GetItems";
import {
  DecorationItem,
  ItemStringType,
  Rarity,
  rarityMap,
} from "./types/Types";

type PublicProfileListItemProps = {
  itemStringType: ItemStringType;
  publicProfile: boolean;
  userId: string;
};

export default function PublicProfileListItem({
  itemStringType,
  publicProfile,
  userId,
}: PublicProfileListItemProps) {
  const { sortBy, showLocked } = useSort();
  const [selectedItem, setSelectedItem] = useState<DecorationItem | null>(null);

  const { itemsByUserId } =
    useLazyLoadQuery<ItemsApiItemInventoryForUserByIdQuery>(
      getItemsByUserQuery,
      {
        userId: userId,
      },
      {
        fetchPolicy: "network-only",
        fetchKey: userId,
      }
    );

  // Combine backend and JSON data
  const itemsParsedMerged = getPublicProfileItemsMerged(
    itemsByUserId,
    itemStringType
  );

  // Get amount of items user has in inventory to display later
  const numberItemsUnlocked = itemsParsedMerged.filter(
    (item) => item.unlocked
  ).length;

  // Find the equiped item for the UnequipCard
  const equipedItem = itemsParsedMerged.find((item) => item.equipped);

  // Do the sorting depending on the context
  const sortedItems = useMemo(() => {
    const filtered = showLocked
      ? itemsParsedMerged
      : itemsParsedMerged.filter((item) => item.unlocked);

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rarity") {
        const rarityOrder = ["common", "uncommon", "rare", "ultra_rare"];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      }
      // Sort newest first
      if (sortBy === "unlockedTime") {
        const ta = a.unlockedTime
          ? new Date(a.unlockedTime).getTime()
          : -Infinity;
        const tb = b.unlockedTime
          ? new Date(b.unlockedTime).getTime()
          : -Infinity;
        return tb - ta;
      }
      return 0;
    });
  }, [itemsParsedMerged, sortBy, showLocked]);

  return (
    <>
      <Box sx={{ mb: 2, width: "100%" }}>
        {/* Amount of owned items */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Items owned: {numberItemsUnlocked} / {itemsParsedMerged.length}
        </Typography>
      </Box>

      {/* 1) FEATURE-ROW: equipped (grün) + Unequip (orange) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 2,
          alignItems: "start",
          mb: 1.5,
        }}
      >
        {equipedItem ? (
          <FeaturedItemCard item={equipedItem} onClick={() => {}} />
        ) : (
          // Platzhalter, damit Unequip rechts bleibt, falls nichts equipped
          <Box />
        )}

        {itemStringType !== "tutors" && publicProfile === false && (
          <UnequipCard equippedItem={equipedItem} />
        )}
      </Box>

      {/* 2) Divider */}
      <Box
        sx={{
          height: 0,
          borderTop: "3px solid #000",
          mb: 2,
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 2,
        }}
      >
        {sortedItems
          .filter((item) => !item.equipped)
          .map((item) => {
            // Get rarity
            const rarityKey = (item.rarity || "common")
              .toLowerCase()
              .replace(/\s+/g, "");

            // Map rarity to color
            const colors = rarityMap[rarityKey as Rarity] ?? rarityMap.common;

            // Define label to dsiplay
            const rarityLabel =
              item.rarity === "ultra_rare"
                ? "Ultra Rare"
                : item.rarity?.charAt(0).toUpperCase() +
                  (item.rarity?.slice(1) ?? "Common");

            return (
              <Box
                key={item.id}
                onClick={() => setSelectedItem(item)}
                sx={{
                  position: "relative",
                  border: item.unlocked
                    ? `3px solid ${item.equipped ? "#096909" : colors.border}`
                    : "none",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: `0 0 0 3px ${
                    item.equipped
                      ? "#096909" // green for equiped
                      : item.unlocked
                      ? colors.border // rarity color for unlocked
                      : "#000000d3" // grey for locked
                  }33`, // small glow
                  backgroundColor: colors.bg,
                  cursor: item.unlocked ? "pointer" : "default",
                  transition: item.unlocked
                    ? "transform .15s ease, box-shadow .15s ease"
                    : "none",
                  ...(item.unlocked && {
                    "&:hover": { transform: "translateY(-2px)" },
                  }),
                }}
              >
                {/* Display picture for item in list */}
                {item.foreColor ? (
                  <ItemInventoryPictureBackgrounds
                    url={item.url ? item.url : null}
                    backColor={item.backColor ? item.backColor : null}
                    foreColor={item.foreColor}
                  />
                ) : (
                  <ItemInventoryPictureOnly
                    url={item.url ? item.url : null}
                    id={item.id}
                  />
                )}

                {/* Informations about item */}
                <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                  <Typography variant="body2">
                    <strong>Rarity:</strong> {rarityLabel || "Common"}
                  </Typography>
                </Box>

                {/* Obtained-Overlay: Covers item when locked */}
                {!item.unlocked && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.85)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  >
                    Locked
                  </Box>
                )}
              </Box>
            );
          })}
      </Box>
      {/* PopUp when unlocked card is single clicked */}
      {selectedItem && selectedItem.unlocked && (
        <DecorationPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          imageSrc={
            selectedItem.url ? decodeURIComponent(selectedItem.url) : undefined
          }
          imageAlt={selectedItem.id}
          description={selectedItem.description || "No description available."}
          equipped={selectedItem.equipped}
          onToggleEquip={() => {}}
          name={selectedItem.name}
          rarity={selectedItem.rarity ? selectedItem.rarity : undefined}
          backColor={
            selectedItem.backColor ? selectedItem.backColor : undefined
          }
          foreColor={
            selectedItem.foreColor ? selectedItem.foreColor : undefined
          }
          category={itemStringType}
          publicProfil={publicProfile}
        />
      )}
    </>
  );
}
