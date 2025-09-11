import { Avatar, Box } from "@mui/material";
import Image from "next/image";
import React from "react";
import { DecorationItem } from "@/components/items/types/Types";

type Props = {
  height: number;
  profilePicFrame: DecorationItem | undefined;
  profilePic: DecorationItem | undefined;
};

export default function ProfilePicAndBorder({
                                              profilePicFrame,
                                              profilePic,
                                              height,
                                            }: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        width: `${height}px`,
        height: `${height}px`,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: profilePicFrame?.url ? "transparent" : "#089CDC",
      }}
    >
      {/* Frame */}
      {profilePicFrame?.url && (
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 2,
            backgroundImage: `url(${profilePicFrame.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Profile Picture */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "80%",
          borderRadius: 2,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {profilePic ? (
          <Image
            src={profilePic.url as string}
            alt={profilePic.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Avatar
            variant="square"
            sx={{
              width: "100%",
              height: "100%",
              fontSize: 40,
            }}
          >
            P
          </Avatar>
        )}
      </Box>
    </Box>
  );
}