import { Avatar, Box, Typography } from "@mui/material";
import { useLazyLoadQuery } from "react-relay";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { getUnlockedItemAndEquiped } from "@/components/items/logic/GetItems";
import Image from "next/image";
import React from "react";
import ProfilePicAndBorder from "@/components/profile/header/common/ProfilePicAndBorder";

type Props = {
  componentHeight?: number;
  displayName: string;
  readonly inventoryForUser?: {
    readonly items: readonly {
      readonly equipped: boolean;
      readonly id: string;
      readonly unlocked: boolean;
      readonly unlockedTime: string | null;
    }[];
  };
};

export default function ProfileCustomHeader({
  inventoryForUser,
  displayName,
  componentHeight = 200,
}: Props) {
  const profilePic = getUnlockedItemAndEquiped(inventoryForUser, "profilePics");
  const background = getUnlockedItemAndEquiped(
    inventoryForUser,
    "patternThemes"
  );
  const profilePicFrame = getUnlockedItemAndEquiped(
    inventoryForUser,
    "profilePicFrames"
  );
  const tutor = getUnlockedItemAndEquiped(inventoryForUser, "tutors");

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: `${componentHeight}px`,
        padding: "12px",
        border: "1px solid lightgray",
        borderRadius: "4px",
        ...(background // 1. Check for background
          ? background.url // 2. Check for url
            ? {
                // Case A: Url
                backgroundImage: `url(${background.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : {
                // Case B: background-color
                bgcolor: background.backColor,
              }
          : {
              // 3. 'background' undefined -> fallback color
              bgcolor: "#f0f0f0",
            }),
      }}
    >
      {/* Profile Picture + Frame*/}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <ProfilePicAndBorder
          height={componentHeight * 0.8}
          profilePic={profilePic}
          profilePicFrame={profilePicFrame}
        />
        <Typography
          sx={{
            mt: 1,
            ml: 2,
            fontWeight: 400,
            fontSize: "2rem",
            color: background?.foreColor || "black",
          }}
        >
          {displayName}
        </Typography>
      </Box>

      {/* Tutor */}

      {tutor && (
        <Box
          sx={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: `${componentHeight * 0.4}px`,
            height: `${componentHeight * 0.4}px`,
            overflow: "hidden",
          }}
        >
          <Image
            src={tutor.url as string}
            alt={tutor.name as string}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>
      )}
    </Box>
  );
}
