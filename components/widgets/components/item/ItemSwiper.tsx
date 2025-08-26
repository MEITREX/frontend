"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Box } from "@mui/material";
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { useLazyLoadQuery, useMutation } from "react-relay";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import Item from "@/components/widgets/components/item/Item";
import { getUnlockedItemsAndNotEquiped } from "@/components/items/logic/GetItems";

export default function ItemSwiper() {
  //TBD: What are we doing when we equip item here?: Add array of equiped items with caterogy and then change when one of the category changes beim swipen wird dann die liste geupdated

  const { inventoryForUser } = useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
    widgetApiItemInventoryForUserQuery,
    { fetchPolicy: "network-only" },
  );

  const unlockedItems = getUnlockedItemsAndNotEquiped(inventoryForUser);

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
        {
          (unlockedItems ?? []).length > 0 ? (
            unlockedItems.map((item) => (
              <SwiperSlide key={item.id}>
                <Item item={item} settings={{ pictureWidth: '170px', pictureHeight: '170px' }} />
              </SwiperSlide>
            ))
          ) : (
            <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
              There are currently no unlocked items!
            </Box>
          )
        }
      </Swiper>
    </Box>
  );
}
