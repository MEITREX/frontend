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

  let background = "#ffffff";
  let foreground = "#000000";
  let backgroundImage: string | undefined;

  // Farben/Pattern setzen
  if (equipedItemColorTheme) {
    cardStyle.backgroundColor = equipedItemColorTheme.backColor ?? "#ffffff";
    cardStyle.color = equipedItemColorTheme.foreColor ?? "#000000";
    foreground = equipedItemColorTheme.foreColor ?? "#000000";
  } else if (equipedItemPatternTheme?.url) {
    // Data-URI direkt verwenden (kein decode!)
    cardStyle.backgroundImage = `url(${decodeURIComponent(equipedItemPatternTheme.url)})`;
    cardStyle.backgroundRepeat = "repeat"; // Kacheln (Pattern)
    cardStyle.backgroundSize = "auto";    // meist für SVG-Pattern besser als "cover"
    cardStyle.color = equipedItemPatternTheme.foreColor ?? "#000000";
    foreground = equipedItemPatternTheme.foreColor ?? "#000000";
    // optional Fallback-Farbe unter dem Pattern:
    // cardStyle.backgroundColor = "#ffffff";
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
      {displayPB && (
        <HoverCard
          key={userInfo?.id}
          card={
            <div style={cardStyle}>
              <img
                src={decodeURIComponent(
                  equipedItemPic!.url ? equipedItemPic!.url : equipedItemPic!.id
                )}
                alt={userInfo?.userName}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  objectFit: "cover",
                  margin: "0 auto 10px",
                  boxShadow: "0 2px 8px #0001",
                }}
              />
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 4,
                  color: `${foreground}`,
                }}
              >
                {userInfo?.userName}
              </div>
              <div style={{ fontSize: 15, color: "#a1a6b2", marginTop: 8 }}>
                Profilinfos folgen…
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
          sx={{
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
          {userInfo.userName ?? "unknown"}
        </Typography>
      )}

      {displayDate && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarTodayIcon fontSize="small" />
          <Typography variant="caption">
            {format(new Date(creationTime as string), "MMMM d, yyyy, hh:mm a")}
          </Typography>
        </Stack>
      )}

      {numberOfPosts !== undefined && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ChatBubbleOutlineIcon fontSize="small" />
          <Typography variant="body2">{numberOfPosts}</Typography>
        </Stack>
      )}
    </Stack>
  );
}
