"use client";

import { pageEquipItemFrameMutation } from "@/__generated__/pageEquipItemFrameMutation.graphql";
import { pageInventoryForUserFrameQuery } from "@/__generated__/pageInventoryForUserFrameQuery.graphql";
import { pageUnequipItemFrameMutation } from "@/__generated__/pageUnequipItemFrameMutation.graphql";
import DecorationPopup from "@/components/items/DecorationPopup";
import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import DecoParser from "../../../../components/DecoParser";
import { useSort } from "./../SortContext";

export default function PicturePage() {
  const { sortBy, showLocked } = useSort();

  type DecorationItem = {
    id: string;
    [key: string]: any; // Damit auch weitere Eigenschaften erlaubt sind
  };

  const { inventoryForUser } = useLazyLoadQuery<pageInventoryForUserFrameQuery>(
    graphql`
      query pageInventoryForUserFrameQuery {
        inventoryForUser {
          items {
            equipped
            id
            uniqueDescription
            unlocked
          }
          unspentPoints
          userId
        }
      }
    `,
    {}
  );

  const [equipItem] = useMutation<pageEquipItemFrameMutation>(graphql`
    mutation pageEquipItemFrameMutation($itemId: UUID!) {
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

  const [unequipItem] = useMutation<pageUnequipItemFrameMutation>(graphql`
    mutation pageUnequipItemFrameMutation($itemId: UUID!) {
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

  const itemsParsed = DecoParser(itemIds, "profilePicFrames");

  const itemStatusMap = Object.fromEntries(
    inventoryForUser.items.map((item) => [
      item.id,
      { equipped: item.equipped, unlocked: item.unlocked },
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

  const handleToggleEquip = () => {
    if (!selectedItem) return;

    if (selectedItem.equipped) {
      unequipItem({
        variables: {
          itemId: selectedItem.id,
        },
        onError() {
          console.log("Cant unequip item", selectedItem.id);
        },
        onCompleted() {
          console.log("Unequiped item");
        },
      });
    } else {
      equipItem({
        variables: {
          itemId: selectedItem.id,
        },
        onError() {
          console.log("Cant equip item", selectedItem.id);
        },
        onCompleted() {
          console.log("Equiped item");
        },
      });
    }

    // Popup schließen oder beibehalten
    setSelectedItem(null);
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
              onClick={() => setSelectedItem(pic)}
              sx={{
                position: "relative",
                border: `3px solid ${
                  pic.equipped
                    ? "#096909" // grün
                    : pic.unlocked
                    ? colors.border // rarity-Farbe
                    : "#000000d3" // grau
                }`,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 0 0 3px ${
                  pic.equipped
                    ? "#096909" // grün
                    : pic.unlocked
                    ? colors.border // rarity-Farbe
                    : "#000000d3" // grau
                }33`, // leichter Glow
                backgroundColor: colors.bg,
                cursor: "pointer",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              {/* Bildbereich mit innerem schwarzen Rahmen (wie in deiner Skizze) */}
              <Box sx={{ p: 1 }}>
                <Box
                  sx={{
                    border: "3px solid #000",
                    borderRadius: 2,
                    overflow: "hidden",
                    aspectRatio: "1 / 1",
                    backgroundColor: "#fff",
                  }}
                >
                  <img
                    src={decodeURIComponent(pic.url)}
                    alt={pic.id}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
