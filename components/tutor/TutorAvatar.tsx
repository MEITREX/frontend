import React from "react";
import Image from "next/image";
import { getUnlockedItemAndEquiped } from "@/components/items/logic/GetItems";
import { useLazyLoadQuery } from "react-relay";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { Box } from "@mui/material";

export default function TutorAvatar() {
  const { inventoryForUser } =
    useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
      widgetApiItemInventoryForUserQuery,
      { fetchPolicy: "network-only" }
    );
  const tutor = getUnlockedItemAndEquiped(inventoryForUser, "tutors");
  return (
    <div className="avatar-container" draggable={false}>
      <Box width="80px" height="80px">
        <Image
          src={tutor?.url as string}
          alt={tutor?.name as string}
          fill
          className="avatar-img"
          style={{ objectFit: "contain" }}
        />
      </Box>
      <style jsx>{`
        .avatar-container {
          display: inline-block;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          cursor: grab;
        }
        .avatar-container:active {
          cursor: grabbing;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .avatar-container:hover .avatar-img {
          animation: shake 0.5s;
          animation-iteration-count: 1;
        }
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-5px);
          }
          40% {
            transform: translateX(5px);
          }
          60% {
            transform: translateX(-5px);
          }
          80% {
            transform: translateX(5px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
