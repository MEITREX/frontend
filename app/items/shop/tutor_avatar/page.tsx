"use client";

import { pageBuyItemTutorMutation } from "@/__generated__/pageBuyItemTutorMutation.graphql";
import { pageShopForUserTutorQuery } from "@/__generated__/pageShopForUserTutorQuery.graphql";
import DecorationPopup from "@/components/items/DecorationPopup";
import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import DecoParser from "../../../../components/DecoParser";
import { useSort } from "./../SortContextShop";

export default function PicturePage() {
  const { sortBy, showLocked } = useSort();

  type DecorationItem = {
    id: string;
    [key: string]: any; // Damit auch weitere Eigenschaften erlaubt sind
  };

  const { inventoryForUser } = useLazyLoadQuery<pageShopForUserTutorQuery>(
    graphql`
      query pageShopForUserTutorQuery {
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

  const [buyItem] = useMutation<pageBuyItemTutorMutation>(graphql`
    mutation pageBuyItemTutorMutation($itemId: UUID!) {
      buyItem(itemId: $itemId) {
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

  const itemsParsed = DecoParser(itemIds, "tutors");

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

  const [selectedItem, setSelectedItem] = useState(null);

  const onToggleEquip = () => {
    console.log("hi");
    if (!selectedItem) return;

    console.log("hiiii");
    buyItem({
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

    // Popup schließen oder beibehalten
    setSelectedItem(null);
  };

  return (
    <>
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
            onClick={() => setSelectedItem(pic)}
            sx={{
              position: "relative",
              border: pic.equipped ? "2px solid green" : "1px solid #ccc",
              borderRadius: 2,
              opacity: pic.unlocked ? 1 : 0.4,
              transition: "0.2s ease-in-out",
              cursor: "pointer", // 👈 hier
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

      {selectedItem && (
        <DecorationPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          imageSrc={decodeURIComponent(selectedItem.url)}
          imageAlt={selectedItem.id}
          description={selectedItem.description || "No description available."}
          equipped={selectedItem.equipped}
          onToggleEquip={onToggleEquip}
          name={selectedItem.name}
        />
      )}
    </>
  );
}
