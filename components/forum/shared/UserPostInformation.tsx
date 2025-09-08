import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import { ItemsApiInventoryForUserQuery } from "@/__generated__/ItemsApiInventoryForUserQuery.graphql";
import {
  forumApiUserInfoByIdQuery,
  forumApiUserInfoQuery,
} from "@/components/forum/api/ForumApi";
import { ThreadType } from "@/components/forum/types";
import { HoverCard } from "@/components/HoverCard";
import { inventoryForUserQuery } from "@/components/items/api/ItemsApi";
import { getItemsMerged } from "@/components/items/logic/GetItems";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Avatar, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";

type Props = {
  creatorId: ThreadType["creatorId"];
  creationTime: ThreadType["creationTime"];
  numberOfPosts?: ThreadType["numberOfPosts"] | undefined;
  displayDate?: boolean;
  displayPB?: boolean;
};

export default function UserPostInformation({
  creationTime,
  numberOfPosts,
  displayDate = true,
  displayPB = true,
  creatorId,
}: Props) {
  // TODO: Refactor: We should add the username in the backend to the post, so we don't have to fetch for it for every post
  const router = useRouter();

  const loggedInUser = useLazyLoadQuery<ForumApiUserInfoQuery>(
    forumApiUserInfoQuery,
    {}
  );

  const userInfos = useLazyLoadQuery<ForumApiUserInfoByIdQuery>(
    forumApiUserInfoByIdQuery,
    {
      id: creatorId,
    }
  );

  const userInfo = userInfos.findUserInfos[0];

  // Styles vorbereiten
  const cardStyle: React.CSSProperties = {
    padding: 8,
    borderRadius: 8,
    minWidth: 220, // damit man das Muster sieht
    minHeight: 120,
    backgroundPosition: "center",
  };

  const { inventoryForUser } = useLazyLoadQuery<ItemsApiInventoryForUserQuery>(
    inventoryForUserQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  // Combine backend and JSON data
  const itemsParsedMergedPic = getItemsMerged(inventoryForUser, "profilePics");

  // Find the equiped item for the UnequipCard
  const equipedItemPic = itemsParsedMergedPic.find((item) => item.equipped);

  // Combine backend and JSON data
  const itemsParsedMergedColorTheme = getItemsMerged(
    inventoryForUser,
    "colorThemes"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemColorTheme = itemsParsedMergedColorTheme.find(
    (item) => item.equipped
  );

  // Combine backend and JSON data
  const itemsParsedMergedPatternTheme = getItemsMerged(
    inventoryForUser,
    "patternThemes"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemPatternTheme = itemsParsedMergedPatternTheme.find(
    (item) => item.equipped
  );

  // Combine backend and JSON data
  const itemsParsedMergedPicFrame = getItemsMerged(
    inventoryForUser,
    "profilePicFrames"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemPicFrame = itemsParsedMergedPicFrame.find(
    (item) => item.equipped
  );

  let foreground = "#000000";

  // Farben/Pattern setzen
  if (equipedItemColorTheme) {
    cardStyle.backgroundColor = equipedItemColorTheme.backColor ?? "#ffffff";
    cardStyle.color = equipedItemColorTheme.foreColor ?? "#000000";
    foreground = equipedItemColorTheme.foreColor ?? "#000000";
  } else if (equipedItemPatternTheme?.url) {
    // Data-URI direkt verwenden (kein decode!)
    cardStyle.backgroundImage = decodeURIComponent(equipedItemPatternTheme.url);
    cardStyle.backgroundRepeat = "repeat"; // Kacheln (Pattern)
    cardStyle.backgroundSize = "100%"; // meist für SVG-Pattern besser als "cover"
    cardStyle.color = equipedItemPatternTheme.foreColor ?? "#000000";
    foreground = equipedItemPatternTheme.foreColor ?? "#000000";
    // optional Fallback-Farbe unter dem Pattern:
    // cardStyle.backgroundColor = "#ffffff";
  }

  console.log(equipedItemPatternTheme?.url);

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="nowrap"
      overflow="hidden">
      {displayPB && (
        <HoverCard
          key={userInfo?.id}
          card={
            <div
              style={{
                position: "relative",
                isolation: "isolate", // erzeugt eigenen Stacking-Context
                overflow: "hidden",
                borderRadius: 8,
                minWidth: 220,
                minHeight: 120,
                background: equipedItemColorTheme?.backColor ?? "#ffffff",
              }}
            >
              {equipedItemPatternTheme?.url && (
                <img
                  src={equipedItemPatternTheme.url}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: -1, // ganz nach unten
                    pointerEvents: "none", // Hover/Klicks oben bleiben
                  }}
                />
              )}

              {/* optionaler Weiß-Schleier für Lesbarkeit */}
              {/* <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.35)", zIndex: 0 }} /> */}

              {/* Inhalt oben drüber */}

              <div style={{ position: "relative", zIndex: 1, padding: 8 }}>
                <div
                  style={{
                    position: "relative",
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                  }}
                >
                  {/* Rahmen-Bild */}
                  {equipedItemPicFrame && (
                    <img
                      src={decodeURIComponent(
                        equipedItemPicFrame!.url
                          ? equipedItemPicFrame!.url
                          : equipedItemPicFrame!.id
                      )}
                      alt={userInfo?.nickname}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                        objectFit: "cover",
                        boxShadow: "0 2px 8px #0001",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Profilbild */}
                  <img
                    src={decodeURIComponent(
                      equipedItemPic!.url
                        ? equipedItemPic!.url
                        : equipedItemPic!.id
                    )}
                    alt={userInfo?.nickname}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                      objectFit: "cover",
                      boxShadow: "0 2px 8px #0001",
                      zIndex: 0,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 4,
                    color: foreground,
                  }}
                >
                  {userInfo?.nickname}
                </div>
                <div style={{ fontSize: 15, color: "#a1a6b2", marginTop: 8 }}>
                  Profilinfos folgen…
                </div>
              </div>
            </div>
          }
          position="bottom"
        >
          <Avatar sx={{ width: 24, height: 24 }}>A</Avatar>
        </HoverCard>
      )}
      {userInfo && (
        <Typography
          noWrap
          sx={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            "&:hover": {
              cursor: "pointer",
            },
          }}
          color={
            loggedInUser.currentUserInfo.id === userInfo.id
              ? "#00a152"
              : "default"
          }
          variant="caption"
          onClick={() => {
            if (!userInfo) return;
            const isOwnProfile =
              loggedInUser.currentUserInfo.id === userInfo.id;
            const profileUrl = isOwnProfile
              ? "/profile"
              : `/profile/${userInfo.id}`;
            router.push(profileUrl);
          }}
        >
          {userInfo.nickname ?? "unknown"}
        </Typography>
      )}

      {displayDate && (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="nowrap" minWidth={0}>
          <CalendarTodayIcon fontSize="small" />
          <Typography
            variant="caption"
            noWrap
            sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
          >
            {format(new Date(creationTime as string), "MM.dd.yyyy, hh:mm a")}
          </Typography>
        </Stack>
      )}

      {numberOfPosts !== undefined && (
        <Stack
          overflow="hidden"
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="nowrap"
        >
          <ChatBubbleOutlineIcon fontSize="small" />
          <Typography variant="body2">{numberOfPosts}</Typography>
        </Stack>
      )}
    </Stack>
  );
}
