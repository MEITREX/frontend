"use client";

import { ItemsApiEquipItemMutation } from "@/__generated__/ItemsApiEquipItemMutation.graphql";
import { ItemsApiInventoryForUserQuery } from "@/__generated__/ItemsApiInventoryForUserQuery.graphql";
import { ItemsApiUnequipItemMutation } from "@/__generated__/ItemsApiUnequipItemMutation.graphql";
import { useSort } from "@/app/contexts/SortContext";
import { Box, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import {
  equipItemMutation,
  inventoryForUserQuery,
  unequipItemMutation,
} from "./api/ItemsApi";
import DecorationPopup from "./DecorationPopup";
import FeaturedItemCard from "./FeaturedItemCard";
import ItemInventoryPictureBackgrounds from "./ItemInventoryPictureBackgrounds";
import ItemInventoryPictureOnly from "./ItemInventoryPictureOnly";
import { getItemsMerged } from "./logic/GetItems";
import {
  DecorationItem,
  ItemStringType,
  Rarity,
  rarityMap,
} from "./types/Types";
import UnequipCard from "./UnequipCard";

type InventoryListItemProps = {
  itemStringType: ItemStringType;
  publicProfile: boolean;
};

export default function InventoryListItem({
  itemStringType,
  publicProfile,
}: InventoryListItemProps) {
  const { sortBy, showLocked } = useSort();
  const [selectedItem, setSelectedItem] = useState<DecorationItem | null>(null);
  // Timer for double click
  const clickTimer = useRef<number | null>(null);

  const { inventoryForUser } = useLazyLoadQuery<ItemsApiInventoryForUserQuery>(
    inventoryForUserQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  const [equipItem] = useMutation<ItemsApiEquipItemMutation>(equipItemMutation);

  const [unequipItem] =
    useMutation<ItemsApiUnequipItemMutation>(unequipItemMutation);

  // Combine backend and JSON data
  const itemsParsedMerged = getItemsMerged(inventoryForUser, itemStringType);

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

  // Handles all the equipment and equipment of items
  const handleToggleEquip = (_e?: any, itemParameter?: any) => {
    const item = itemParameter ? itemParameter : selectedItem;

    if (item.equipped && !itemParameter) {
      unequipItem({
        variables: {
          itemId: item.id,
        },
        onError() {
          setSelectedItem(null);
        },
        onCompleted() {
          setSelectedItem(null);
        },
      });
    } else {
      equipItem({
        variables: {
          itemId: item.id,
        },
        onError() {
          setSelectedItem(null);
        },
        onCompleted() {
          setSelectedItem(null);
        },
      });
    }
  };

  // Handels all clicks on cards and also manages double click
  const handleClick = (e: React.MouseEvent, item: any) => {
    // When double click, do equip and not show PopUp
    if (e.detail === 2) {
      if (clickTimer.current) {
        window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      if (item.unlocked) handleToggleEquip(e, item);
      return;
    }

    // When single click show PopUp
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      setSelectedItem(item);
      clickTimer.current = null;
    }, 220); // 200–300ms
  };

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
          <FeaturedItemCard item={equipedItem} onClick={handleClick} />
        ) : (
          // Platzhalter, damit Unequip rechts bleibt, falls nichts equipped
          <Box />
        )}

        {itemStringType !== "tutors" &&
          publicProfile === false &&
          equipedItem && <UnequipCard equippedItem={equipedItem} />}
      </Box>

      {/* 2) Divider wie im Screenshot */}
      {equipedItem && (
        <Box
          sx={{
            height: 0,
            borderTop: "3px solid #000",
            mb: 2,
          }}
        />
      )}

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

            // Define colors for rarity

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
                onClick={(e) => handleClick(e, item)}
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
                    ratio="1 / 1"
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
          onToggleEquip={handleToggleEquip}
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
