"use client";

import { pageInventoryForUserQuery } from "@/__generated__/pageInventoryForUserQuery.graphql";
import { Box } from "@mui/material";
import { useMemo } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import DecoParser from "../../../../components/DecoParser";
import { useSort } from "./../SortContext";

export default function PicturePage() {
  const { sortBy, showLocked } = useSort();

  type DecorationItem = {
    id: string;
    [key: string]: any; // Damit auch weitere Eigenschaften erlaubt sind
  };

  const { inventoryForUser } = useLazyLoadQuery<pageInventoryForUserQuery>(
    graphql`
      query pageInventoryForUserQuery {
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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 2,
      }}
    >
      {sortedItems.map((pic) => (
        <Box
          key={pic.id}
          sx={{
            position: "relative",
            border: pic.equipped ? "2px solid green" : "1px solid #ccc",
            borderRadius: 2,
            opacity: pic.unlocked ? 1 : 0.4,
            transition: "0.2s ease-in-out",
          }}
        >
          <img
            src={decodeURIComponent(pic.url)}
            alt={pic.id}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
          {!pic.unlocked && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9rem",
                borderRadius: 2,
              }}
            >
              Locked
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
