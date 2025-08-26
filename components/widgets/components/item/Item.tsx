import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import { useMutation } from "react-relay";
import { LotteryApiLotteryEquipItemMutation } from "@/__generated__/LotteryApiLotteryEquipItemMutation.graphql";
import { lotteryApiLotteryEquipItemMutation } from "@/components/lottery/api/LotteryApi";
import { Rarity, rarityMap } from "@/components/items/types/Types";

type Properties = {
  item: {
    id: string;
    name: string;
    rarity: Rarity;
    unlockedTime: string | null;
    url: string | null;
    backColor: string | null;
    foreColor: string | null;
    description: string;
    sold?: boolean;
  }
  settings: {
    pictureWidth: string;
    pictureHeight: string;
  }
}

export default function Item({item, settings}: Properties) {
  const [equipNewItem] = useMutation<LotteryApiLotteryEquipItemMutation>(
    lotteryApiLotteryEquipItemMutation
  );

  const equipItem = (id: string) => {
    equipNewItem({
      variables: { itemId: id },
      onCompleted() {
      },
      onError(error) {
        console.error("Equipping failed", error);
      },
    });
  };

  return(
    <Box
      sx={{
        padding: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        borderRadius: 2,
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: rarityMap[item.rarity].border,
        background: rarityMap[item.rarity].bg,
      }}
    >
      {/* Name + Rarity */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body1"
          noWrap
          title={item.name}
          sx={{ fontWeight: "bold" }}
        >
          {item.name}
        </Typography>
        <Box
          sx={{
            px: 1,
            py: 0.3,
            borderRadius: 1,
            bgcolor:
              item.rarity === "common"
                ? "#e0e0e0"
                : item.rarity === "uncommon"
                  ? "#d4af37"
                  : item.rarity === "rare"
                    ? "#8e44ad"
                    : item.rarity === "ultra_rare" ? "#e53935"
                      : "#e0e0e0" ,
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {item.rarity.replace("_", " ").toUpperCase()}
        </Box>
      </Box>
      {/* Date */}
      {item.unlockedTime && (
        <Typography variant="caption" color="text.secondary">
          <strong>Unlocked: </strong>{new Date(item.unlockedTime).toLocaleDateString()}
        </Typography>
      )}
      {/* Picture */}
      <Box
        sx={{
          position: "relative",
          width: settings.pictureWidth,
          height: settings.pictureHeight,
          border: "3px solid black",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {item.url ? (
          <Image
            src={item.url}
            alt={item.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: item.backColor || "transparent",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "60%",
                height: "60%",
                bgcolor: item.foreColor || "transparent",
                transform: "translate(-50%, -50%)",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{ textAlign: "center", minHeight: 30, fontStyle: "italic"}}
      >
        {item.description || "No description"}
      </Typography>

      {/* Equip Button */}
      <Button onClick={() => equipItem(item.id)} variant="contained">
        Equip
      </Button>

    </Box>
  );
}