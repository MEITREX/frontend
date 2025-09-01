import { ItemsApiInventoryForUserQuery } from "@/__generated__/ItemsApiInventoryForUserQuery.graphql";
import dinoPic from "@/assets/logo.svg";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useLazyLoadQuery } from "react-relay";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";
import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import { getItemsMerged } from "@/components/items/logic/GetItems";
import { inventoryForUserQuery } from "@/components/items/api/ItemsApi";

type Props = {
  openFeedback?: boolean;
  category?: GamificationCategory;
};

export default function TutorWidget({ openFeedback, category }: Props) {
  // TODO ADJUST LINKS OF THIS WIDGET
  const { inventoryForUser } = useLazyLoadQuery<ItemsApiInventoryForUserQuery>(
    inventoryForUserQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  // Combine backend and JSON data
  const itemsParsedMerged = getItemsMerged(inventoryForUser, "tutors");

  // Find the equiped item for the UnequipCard
  const equipedItem = itemsParsedMerged.find((item) => item.equipped);

  return (
    <WidgetWrapper
      title="AI Tutor"
      linkHref="/items/lottery"
      linkLabel="AI TUTOR"
      overflow="auto"
    >
      <WidgetFeedback openFeedback={openFeedback} category={category} />

      <Box display="flex" alignItems="flex-start" gap={2}>
        <Image
          src={decodeURIComponent(equipedItem ? equipedItem?.url : dinoPic)}
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
            Hallo! Ich bin dein Dino 🦖. Hier könnte dein Dummy-Text stehen.
          </Typography>

          <Box
            sx={{
              position: "absolute",
              left: -10,
              top: 20,
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
              top: 20,
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "8px solid #f5f5f5",
            }}
          />
        </Box>
      </Box>
    </WidgetWrapper>
  );
}
