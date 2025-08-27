import { Avatar, Box, Typography } from "@mui/material";
import { useLazyLoadQuery } from "react-relay";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { getUnlockedItemAndEquiped } from "@/components/items/logic/GetItems";
import Image from "next/image";
import React from "react";

export default function Customization() {

  const { inventoryForUser } = useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
    widgetApiItemInventoryForUserQuery,
    { fetchPolicy: "network-only" },
  );

  const profilePic = getUnlockedItemAndEquiped(inventoryForUser,"profilePics");
  const background = getUnlockedItemAndEquiped(inventoryForUser,"patternThemes");
  const profilePicFrame = getUnlockedItemAndEquiped(inventoryForUser,"profilePicFrames");
  const tutor = getUnlockedItemAndEquiped(inventoryForUser,"tutors");

  return(
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '200px',
        padding: "12px",
        border: '1px solid lightgray',
        borderRadius: '4px',
        ...(background // 1. Check for background
            ? background.url // 2. Check for url
              ? { // Case A: Url
                backgroundImage: `url(${background.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
              : { // Case B: background-color
                bgcolor: background.backColor,
              }
            : { // 3. 'background' undefined -> fallback color
              bgcolor: '#f0f0f0',
            }
        )
      }}
    >
      {/* Profile Picture + Frame*/}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Frame */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              ...(profilePicFrame?.url
                  ? { // 1. Use Frame
                    backgroundImage: `url(${profilePicFrame.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                  : { // 2. Fallback when no frame selected
                    bgcolor: '#089CDC',
                  }
              )
            }}
          />

          {/* Profile Picture */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {profilePic
              ? (
                <Image
                  src={profilePic.url as string}
                  alt={profilePic.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              )
              : (
                <Avatar
                  variant="square"
                  sx={{
                    width: '100%',
                    height: '100%',
                    fontSize: 40,
                  }}
                >
                  P
                </Avatar>
              )
            }
          </Box>
        </Box>

        <Typography
          sx={{
            mt: 1,
            ml: 2,
            fontWeight: 400,
            fontSize: '2rem',
            color: background?.foreColor || 'black',
          }}
        >
          Hi, Max Mustermann
        </Typography>
      </Box>

      {/* Tutor */}

      {tutor && (<Box
        sx={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '80px',
          height: '80px',
          overflow: 'hidden',
        }}
      >
        <Image
          src={tutor.url as string}
          alt={tutor.name as string}
          fill
          style={{ objectFit: "cover" }}
        />
      </Box>)}
    </Box>
  );
}
