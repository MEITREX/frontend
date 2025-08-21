"use client";

import { PublicProfileListItemInventoryForUserByIdQuery } from "@/__generated__/PublicProfileListItemInventoryForUserByIdQuery.graphql";
import { useSort } from "@/app/contexts/SortContext";
import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import DecoParser from "../DecoParser";
import DecorationPopup from "./DecorationPopup";
import ItemInventoryPictureBackgrounds from "./ItemInventoryPictureBackgrounds";
import ItemInventoryPictureOnly from "./ItemInventoryPictureOnly";
import UnequipCard from "./UnequipCard";

// Types for items
export type ItemStringType =
  | "colorThemes"
  | "patternThemes"
  | "profilePicFrames"
  | "profilePics"
  | "tutors";

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

type PublicProfileListItemProps = {
  itemStringType: ItemStringType;
  publicProfile: boolean;
  userId: string;
};

export default function PublicProfileListItem({
  itemStringType,
  publicProfile,
  userId
}: PublicProfileListItemProps) {
  const { sortBy, showLocked } = useSort();
  const [selectedItem, setSelectedItem] = useState<DecorationItem | null>(null);


  const { itemsByUserId } =
    useLazyLoadQuery<PublicProfileListItemInventoryForUserByIdQuery>(
      graphql`
        query PublicProfileListItemInventoryForUserByIdQuery($userId: UUID!) {
          itemsByUserId(userId: $userId) {
              equipped
              id
              uniqueDescription
              unlocked
              unlockedTime

          }
        }
      `,
      {
        userId: userId
      },
      { fetchPolicy: "network-only" }
    );




  console.log(userId)
  // Get IDs of all items for DecoParser
  const itemIds = itemsByUserId.map((item) => item.id);

  console.log(itemIds)

  // Parse items of given type
  let itemsParsed = DecoParser(itemIds, itemStringType);

  // If the type is a profile background we need to merge the other profile background type into out items
  if (itemStringType === "colorThemes") {
    const itemsParsedPatternThemes = DecoParser(itemIds, "patternThemes");
    itemsParsed = itemsParsed.concat(itemsParsedPatternThemes);
  } else if (itemStringType === "patternThemes") {
    const itemsParsedColorThemes = DecoParser(itemIds, "colorThemes");
    itemsParsed = itemsParsed.concat(itemsParsedColorThemes);
  }

  // Map items from backend to JSON items
  const itemStatusMap = Object.fromEntries(
    itemsByUserId.map((item) => [
      item.id,
      {
        equipped: item.equipped,
        unlocked: item.unlocked,
        unlockedTime: item.unlockedTime,
      },
    ])
  );

  console.log(itemStatusMap)

  // Combine backend and JSON data
  const itemsParsedMerged = itemsParsed.map((item) => ({
    ...(item as Partial<DecorationItem>),
    ...itemStatusMap[item.id],
  })) as DecorationItem[];

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
          Items owned: {numberItemsUnlocked} / {itemsParsed.length}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 2,
        }}
      >
        {itemStringType !== "tutors" && publicProfile === false && (
          // UnequipCard is shwon at the start of the list for all categories but tutor
          <UnequipCard equippedItem={equipedItem}></UnequipCard>
        )}
        {sortedItems.map((item) => {
          // Get rarity
          const rarityKey = (item.rarity || "common")
            .toLowerCase()
            .replace(/\s+/g, "");

          // Define colors for rarity
          const rarityMap: Record<string, { border: string; bg: string }> = {
            common: { border: "#26a0f5", bg: "#e3f2fd" }, // blue
            uncommon: { border: "#d4af37", bg: "#fff8e1" }, // gold
            rare: { border: "#8e44ad", bg: "#f3e5f5" }, // purple
            ultra_rare: { border: "#e53935", bg: "#ffebee" }, // red
          };

          // Map rarity to color
          const colors = rarityMap[rarityKey] ?? rarityMap.common;

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
