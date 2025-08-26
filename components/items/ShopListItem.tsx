import { ItemsApiBuyItemTutorMutation } from "@/__generated__/ItemsApiBuyItemTutorMutation.graphql";
import { ItemsApiInventoryForUserQuery } from "@/__generated__/ItemsApiInventoryForUserQuery.graphql";
import { useSort } from "@/app/contexts/SortContextShop";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import coins from "../../assets/lottery/coins.png";
import { buyItemMutation, inventoryForUserQuery } from "./api/ItemsApi";
import DecorationPopup from "./DecorationPopup";
import ItemInventoryPictureBackgrounds from "./ItemInventoryPictureBackgrounds";
import ItemInventoryPictureOnly from "./ItemInventoryPictureOnly";
import { getItemsMerged } from "./logic/GetItems";
import { DecorationItem, ItemStringType, rarityMap } from "./types/Types";

type ShopListItemProps = {
  itemStringType: ItemStringType;
};

export default function ShopListItem({ itemStringType }: ShopListItemProps) {
  // Currency of user
  const [points, setPoints] = useState<number | null>(null);
  const { sortBy } = useSort();
  const [selectedItem, setSelectedItem] = useState<DecorationItem | null>(null);

  const { inventoryForUser } = useLazyLoadQuery<ItemsApiInventoryForUserQuery>(
    inventoryForUserQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  const [buyItem] = useMutation<ItemsApiBuyItemTutorMutation>(buyItemMutation);

  // Setting current currency of user, either from inventory or from buy
  const currentPoints = points ?? inventoryForUser.unspentPoints;

  // Combine backend and JSON data
  const itemsParsedMerged = getItemsMerged(inventoryForUser, itemStringType);

  // Do the sorting depending on the context
  const sortedItems = useMemo(() => {
    const filtered = itemsParsedMerged.filter((item) => !item.unlocked);

    // Filter only items user does not have yet
    const withoutShopItems = filtered.filter((item) => item.obtainableInShop);

    return [...withoutShopItems].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rarity") {
        const rarityOrder = ["common", "uncommon", "rare", "ultra_rare"];
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
      }
      return 0;
    });
  }, [itemsParsedMerged, sortBy]);

  // Handles all the equipment and equipment of items
  const onToggleEquip = () => {
    if (!selectedItem) return;

    buyItem({
      variables: {
        itemId: selectedItem.id,
      },
      onError() {
        setSelectedItem(null);
      },
      onCompleted(data) {
        setPoints(data.buyItem!.unspentPoints);
        setSelectedItem(null);
      },
    });
  };

  return (
    <>
      <Box sx={{ mb: 2, width: "100%" }}>
        {/* Amount of owned currency */}
        <Button variant="contained" color="secondary">
          <Box
            component="span"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            {currentPoints}
            <Image src={coins} alt="Coins" width={18} height={18} />
          </Box>
        </Button>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 2,
          width: "100%",
        }}
      >
        {sortedItems.map((pic) => {
          // Get rarity
          const rarityKey = (pic.rarity || "common")
            .toLowerCase()
            .replace(/\s+/g, "");

          // Map rarity to color
          const colors = rarityMap[rarityKey] ?? rarityMap.common;

          const price = pic.moneyCost;

          // Define label to dsiplay
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
                width: "100%",
                border: `3px solid ${pic.unlocked ? "#80848c" : colors.border}`,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 0 0 3px ${colors.border}33`,
                backgroundColor: colors.bg,
                cursor: "pointer",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              {/* Display picture for item in list */}
              {pic.foreColor ? (
                <ItemInventoryPictureBackgrounds
                  url={pic.url ? pic.url : null}
                  backColor={pic.backColor ? pic.backColor : null}
                  foreColor={pic.foreColor}
                  ratio="1 / 1"
                />
              ) : (
                <ItemInventoryPictureOnly url={pic.url} id={pic.id} />
              )}

              {/* Informations about item */}
              <Box sx={{ px: 2, pb: 2, pt: 1 }}>
                {price != null && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Price:</strong> {price} DP
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Rarity:</strong> {rarityLabel || "Common"}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      {/* PopUp when unlocked card is single clicked */}
      {selectedItem && (
        <DecorationPopup
          open={true}
          onClose={() => setSelectedItem(null)}
          imageSrc={
            selectedItem.url ? decodeURIComponent(selectedItem.url) : undefined
          }
          imageAlt={selectedItem.id}
          description={selectedItem.description || "No description available."}
          equipped={selectedItem.moneyCost}
          onToggleEquip={onToggleEquip}
          name={selectedItem.name}
          rarity={selectedItem.rarity}
          unspentPoints={currentPoints}
          backColor={
            selectedItem.backColor ? selectedItem.backColor : undefined
          }
          foreColor={
            selectedItem.foreColor ? selectedItem.foreColor : undefined
          }
          publicProfil={false}
        />
      )}
    </>
  );
}
