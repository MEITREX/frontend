"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Box, Button, Typography } from "@mui/material";
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { useLazyLoadQuery, useMutation } from "react-relay";
import { getUnlockedItemsAndNotEquiped } from "@/components/widgets/components/item/utils/items";
import Image from "next/image";
import React, { useState } from "react";
import { LotteryApiLotteryEquipItemMutation } from "@/__generated__/LotteryApiLotteryEquipItemMutation.graphql";
import {
  lotteryApiLotteryEquipItemMutation,
} from "@/components/lottery/api/LotteryApi";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";

interface RarityStyle {
  border: string;
  background: string;
}

export type Rarity = "default" | "common" | "uncommon" | "rare" | "ultra_rare";

const rarityStyles: Record<Rarity, RarityStyle> = {
  default: {
    border: "2px solid #B0B0B0",
    background: "#e3f2fd",
  },
  common: {
    border: "2px solid #26a0f5",
    background: "#e3f2fd",
  },
  uncommon: {
    border: "2px solid #d4af37",
    background: "#fff8e1",
  },
  rare: {
    border: "2px solid #8e44ad",
    background: "#f3e5f5",
  },
  ultra_rare: {
    border: "2px solid #e53935",
    background: "#ffebee",
  },
};

export default function ItemSwiper() {
  //TBD: What are we doing when we equip item here?: Add array of equiped items with caterogy and then change when one of the category changes beim swipen wird dann die liste geupdated
  const [equipNewItem] = useMutation<LotteryApiLotteryEquipItemMutation>(
    lotteryApiLotteryEquipItemMutation
  );

  const { inventoryForUser } = useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
    widgetApiItemInventoryForUserQuery,
    { fetchPolicy: "network-only" },
  );

  const unlockedItems = getUnlockedItemsAndNotEquiped(inventoryForUser);

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

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay:5000,
          disableOnInteraction: false
        }}
        loop={true}
        speed={800}
        className="mySwiper"
        style={{ width: "100%", height: "100%" }}
      >
        {unlockedItems.map((item) => (
          <SwiperSlide key={item.id}>
            <Box
              sx={{
                padding: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                borderRadius: 2,
                ...rarityStyles[item.rarity],
              }}
            >
              {/* Name + Rarity */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body1"
                  noWrap
                  title={item.name}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", fontWeight: "bold" }}
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
                  width: 170,
                  height: 170,
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
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
