"use client";

import { ItemsApiInventoryForUserQuery } from "@/__generated__/ItemsApiInventoryForUserQuery.graphql";
import { WidgetApiTutorTextQuery } from "@/__generated__/WidgetApiTutorTextQuery.graphql";
import dinoPic from "@/assets/logo.svg";
import { inventoryForUserQuery } from "@/components/items/api/ItemsApi";
import { getItemsMerged } from "@/components/items/logic/GetItems";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useLazyLoadQuery } from "react-relay";
import { widgetApiTutorTextQuery } from "../../api/WidgetApi";

export default function TutorWidgetInner({ courseId }: { courseId: string }) {
  const { inventoryForUser } = useLazyLoadQuery<ItemsApiInventoryForUserQuery>(
    inventoryForUserQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  const { tutorImmersiveWidgetSpeechContent } =
    useLazyLoadQuery<WidgetApiTutorTextQuery>(
      widgetApiTutorTextQuery,
      { courseId },
      { fetchPolicy: "network-only" }
    );

  const itemsParsedMerged = getItemsMerged(inventoryForUser, "tutors");
  const equipedItem = itemsParsedMerged.find((item) => item.equipped);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: 300 }}
      gap={2}
    >
      <Image
        src={decodeURIComponent(equipedItem ? equipedItem.url : dinoPic)}
        alt="Dino"
        width={100}
        height={100}
        style={{ objectFit: "contain" }}
      />
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: 2,
          p: 2,
          position: "relative",
          maxWidth: "70%",
        }}
      >
        <Typography variant="body2">
          {tutorImmersiveWidgetSpeechContent}
        </Typography>
        <Box
          sx={{
            position: "absolute",
            left: -10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderRight: "10px solid #ccc",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid #f5f5f5",
          }}
        />
      </Box>
    </Box>
  );
}
