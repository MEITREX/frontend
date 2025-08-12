"use client";

import { pageEquipItemBackgroundMutation } from "@/__generated__/pageEquipItemBackgroundMutation.graphql";
import { pageInventoryForUserBackgroundQuery } from "@/__generated__/pageInventoryForUserBackgroundQuery.graphql";
import { pageUnequipItemBackgroundMutation } from "@/__generated__/pageUnequipItemBackgroundMutation.graphql";
import DecorationPopup from "@/components/items/DecorationPopup";
import UnequipCard from "@/components/items/UnequipCard";
import { Box, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import DecoParser from "../../../../components/DecoParser";
import { useSort } from "../../../contexts/SortContext";

export default function PicturePage() {
  const { sortBy, showLocked } = useSort();

  type DecorationItem = {
    id: string;
    [key: string]: any; // Damit auch weitere Eigenschaften erlaubt sind
  };

  const { inventoryForUser } =
    useLazyLoadQuery<pageInventoryForUserBackgroundQuery>(
      graphql`
        query pageInventoryForUserBackgroundQuery {
          inventoryForUser {
            items {
              equipped
              id
              uniqueDescription
              unlocked
              unlockedTime
            }
            unspentPoints
            userId
          }
        }
      `,
      {}
    );

  const [equipItem] = useMutation<pageEquipItemBackgroundMutation>(graphql`
    mutation pageEquipItemBackgroundMutation($itemId: UUID!) {
      equipItem(itemId: $itemId) {
        items {
          equipped
          id
          uniqueDescription
          unlocked
          unlockedTime
        }
        unspentPoints
        userId
      }
    }
  `);

  const [unequipItem] = useMutation<pageUnequipItemBackgroundMutation>(graphql`
    mutation pageUnequipItemBackgroundMutation($itemId: UUID!) {
      unequipItem(itemId: $itemId) {
        items {
          equipped
          id
          uniqueDescription
          unlocked
          unlockedTime
        }
        unspentPoints
        userId
      }
    }
  `);

  console.log(inventoryForUser, "invvvvvvvvvvvvv");

  const itemIds = inventoryForUser.items.map((item) => item.id);

  const itemsParsedPatterns = DecoParser(itemIds, "patternThemes");

  const itemsParsedColors = DecoParser(itemIds, "colorThemes");

  const itemsParsed = itemsParsedColors.concat(itemsParsedPatterns);

  const itemStatusMap = Object.fromEntries(
    inventoryForUser.items.map((item) => [
      item.id,
      {
        equipped: item.equipped,
        unlocked: item.unlocked,
        unlockedTime: item.unlockedTime,
      },
    ])
  );

  // 4. Parsed Items mit Status kombinieren
  const itemsParsedMerged = itemsParsed.map((item: DecorationItem) => ({
    ...item,
    ...itemStatusMap[item.id],
  }));

  const numberItemsUnlocked = itemsParsedMerged.filter(
    (item) => item.unlocked
  ).length;

  console.log(numberItemsUnlocked, "num");

  const equipedItem = itemsParsedMerged.find((item) => item.equipped);

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
      return 0;
    });
  }, [itemsParsedMerged, sortBy, showLocked]); // 👈 showLocked nicht vergessen!

  console.log(sortedItems);
  console.log(sortBy);

  const [selectedItem, setSelectedItem] = useState(null);

  const handleToggleEquip = (_e: any, itemParameter?: any) => {
    console.log("HandleToggleEquip");

    const item = itemParameter ? itemParameter : selectedItem;

    console.log(item, "DAS UNSER ITEM");

    if (item.equipped && !itemParameter) {
      unequipItem({
        variables: {
          itemId: item.id,
        },
        onError() {
          console.log("Cant unequip item", item.id);
          // Popup schließen oder beibehalten
          setSelectedItem(null);
        },
        onCompleted() {
          console.log("Unequiped item");
          // Popup schließen oder beibehalten
          setSelectedItem(null);
        },
      });
    } else {
      equipItem({
        variables: {
          itemId: item.id,
        },
        onError() {
          console.log("Cant equip item", item.id);
          // Popup schließen oder beibehalten
          setSelectedItem(null);
        },
        onCompleted() {
          console.log("Equiped item");
          // Popup schließen oder beibehalten
          setSelectedItem(null);
        },
      });
    }
  };

  const clickTimer = useRef<number | null>(null);

  const handleClick = (e: React.MouseEvent, pic: any) => {
    // Bei Doppelklick: Timer für Single-Click abbrechen und equip ausführen
    if (e.detail === 2) {
      if (clickTimer.current) {
        window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      if (pic.unlocked) handleToggleEquip(e, pic);
      return;
    }

    // Single-Click: leicht verzögern, falls gleich noch ein zweiter Klick kommt
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      setSelectedItem(pic);
      clickTimer.current = null;
    }, 220); // 200–300ms ist üblich
  };

  return (
    <>
      <Box sx={{ mb: 2, width: "100%" }}>
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
        <UnequipCard equippedItem={equipedItem}></UnequipCard>
        {sortedItems.map((pic) => {
          const rarityKey = (pic.rarity || "common")
            .toLowerCase()
            .replace(/\s+/g, ""); // z.B. "ultrarare"
          const rarityMap: Record<string, { border: string; bg: string }> = {
            common: { border: "#26a0f5", bg: "#e3f2fd" }, // blau
            uncommon: { border: "#d4af37", bg: "#fff8e1" }, // gold
            rare: { border: "#8e44ad", bg: "#f3e5f5" }, // lila
            ultra_rare: { border: "#e53935", bg: "#ffebee" }, // rot
          };
          const colors = rarityMap[rarityKey] ?? rarityMap.common;

          const price = pic.sellCompensation; // nimm, was du hast
          const rarityLabel =
            pic.rarity === "ultra_rare"
              ? "Ultra Rare"
              : pic.rarity?.charAt(0).toUpperCase() +
                (pic.rarity?.slice(1) ?? "Common");

          return (
            <Box
              key={pic.id}
              onClick={(e) => handleClick(e, pic)}
              sx={{
                position: "relative",
                border: pic.unlocked
                  ? `3px solid ${pic.equipped ? "#096909" : colors.border}`
                  : "none",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 0 0 3px ${
                  pic.equipped
                    ? "#096909" // grün
                    : pic.unlocked
                    ? colors.border // rarity-Farbe
                    : "#000000" // grau
                }33`, // leichter Glow
                backgroundColor: colors.bg,
                cursor: pic.unlocked ? "pointer" : "default",
                transition: pic.unlocked
                  ? "transform .15s ease, box-shadow .15s ease"
                  : "none",
                ...(pic.unlocked && {
                  "&:hover": { transform: "translateY(-2px)" },
                }),
              }}
            >
              {/* Bildbereich mit innerem schwarzen Rahmen (wie in deiner Skizze) */}
              <Box sx={{ p: 1 }}>
                {/* Outer box mit backColor */}
                <Box
                  sx={{
                    width: "171px",
                    height: "171px",
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundImage: pic.url
                      ? `url(${decodeURIComponent(pic.url)})`
                      : undefined,
                    backgroundColor: !pic.url ? pic.backColor : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto", // <-- zentriert im Eltern-Container
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: pic.foreColor,
                      borderRadius: 2,
                      width: "130px",
                      height: "130px",
                    }}
                  />
                </Box>
              </Box>

              {/* Info-Bereich */}
              <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                <Typography variant="body2">
                  <strong>Rarity:</strong> {rarityLabel || "Common"}
                </Typography>
              </Box>

              {/* Obtained-Overlay: deckt die ganze Karte ab */}
              {!pic.unlocked && (
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
                    pointerEvents: "none", // Klicks weiterreichen, wenn gewünscht
                    borderRadius: 0,
                  }}
                >
                  Locked
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {selectedItem && selectedItem.unlocked && (
        <DecorationPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          imageSrc={decodeURIComponent(selectedItem.url)}
          imageAlt={selectedItem.id}
          description={selectedItem.description || "No description available."}
          equipped={selectedItem.equipped}
          onToggleEquip={handleToggleEquip}
          name={selectedItem.name}
          rarity={selectedItem.rarity}
        />
      )}
    </>
  );
}
