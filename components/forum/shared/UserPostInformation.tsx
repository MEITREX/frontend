import { ForumApiItemInventoryForUserByIdQuery } from "@/__generated__/ForumApiItemInventoryForUserByIdQuery.graphql";
import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import {
  forumApiGetIntemsForEveryUserQuery,
  forumApiUserInfoByIdQuery,
  forumApiUserInfoQuery,
} from "@/components/forum/api/ForumApi";
import { ThreadType } from "@/components/forum/types";
import { HoverCard } from "@/components/HoverCard";
import { getPublicProfileItemsMergedCustomID } from "@/components/items/logic/GetItems";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";

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

  const cardStyle: React.CSSProperties = {
    padding: 8,
    borderRadius: 8,
    minWidth: 220,
    minHeight: 120,
    backgroundPosition: "center",
  };

  const { inventoriesForUsers } =
    useLazyLoadQuery<ForumApiItemInventoryForUserByIdQuery>(
      forumApiGetIntemsForEveryUserQuery,
      {
        userIds: [creatorId],
      },
      { fetchPolicy: "network-only" }
    );

  // Combine backend and JSON data
  const itemsParsedMergedPic = getPublicProfileItemsMergedCustomID(
    inventoriesForUsers[0].items,
    "profilePics"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemPic = itemsParsedMergedPic.find((item) => item.equipped);

  // Combine backend and JSON data
  const itemsParsedMergedColorTheme = getPublicProfileItemsMergedCustomID(
    inventoriesForUsers[0].items,
    "colorThemes"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemColorTheme = itemsParsedMergedColorTheme.find(
    (item) => item.equipped
  );

  // Combine backend and JSON data
  const itemsParsedMergedPatternTheme = getPublicProfileItemsMergedCustomID(
    inventoriesForUsers[0].items,
    "patternThemes"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemPatternTheme = itemsParsedMergedPatternTheme.find(
    (item) => item.equipped
  );

  // Combine backend and JSON data
  const itemsParsedMergedPicFrame = getPublicProfileItemsMergedCustomID(
    inventoriesForUsers[0].items,
    "profilePicFrames"
  );

  // Find the equiped item for the UnequipCard
  const equipedItemPicFrame = itemsParsedMergedPicFrame.find(
    (item) => item.equipped
  );

  let foreground = "#000000";

  if (equipedItemColorTheme) {
    cardStyle.backgroundColor = equipedItemColorTheme.backColor ?? "#ffffff";
    cardStyle.color = equipedItemColorTheme.foreColor ?? "#000000";
    foreground = equipedItemColorTheme.foreColor ?? "#000000";
  } else if (equipedItemPatternTheme?.url) {
    cardStyle.backgroundImage = decodeURIComponent(equipedItemPatternTheme.url);
    cardStyle.backgroundRepeat = "repeat";
    cardStyle.backgroundSize = "100%";
    cardStyle.color = equipedItemPatternTheme.foreColor ?? "#000000";
    foreground = equipedItemPatternTheme.foreColor ?? "#000000";
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="nowrap"
      overflow="hidden"
    >
      {displayPB && (
        <GamificationGuard>
          <HoverCard
            key={userInfo?.id}
            background={
              (equipedItemColorTheme?.backColor
                ? equipedItemColorTheme.backColor
                : equipedItemPatternTheme?.url) ?? "#ffffff"
            }
            foreground={
              (equipedItemColorTheme
                ? equipedItemColorTheme.foreColor
                : equipedItemPatternTheme?.foreColor) ?? "#000000"
            }
            nickname={userInfo?.nickname ?? "Unknown"}
            patternThemeBool={equipedItemPatternTheme?.url != null}
            frameBool={equipedItemPicFrame != null}
            frame={equipedItemPicFrame ? equipedItemPicFrame.url : "Unknown"}
            profilePic={equipedItemPic?.url ?? "Unkown"}
          >
            <div
              style={{ position: "relative", width: 24, height: 24 }}
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
              {equipedItemPicFrame && (
                <img
                  src={decodeURIComponent(equipedItemPicFrame?.url ?? "Unkown")}
                  alt={equipedItemPicFrame?.id ?? "Unkown"}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 24,
                    height: 24,
                    borderRadius: 2,

                    zIndex: 1,
                  }}
                />
              )}
              <img
                src={decodeURIComponent(equipedItemPic?.url ?? "Unkown")}
                alt={equipedItemPic?.id ?? "Unkown"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 2,

                  zIndex: 0,
                }}
              />
            </div>
          </HoverCard>
        </GamificationGuard>
      )}
      {userInfo && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            lineHeight: 0,
            verticalAlign: "middle",
          }}
        >
          <GamificationGuard>
            <HoverCard
              key={userInfo?.id}
              background={
                (equipedItemColorTheme?.backColor
                  ? equipedItemColorTheme.backColor
                  : equipedItemPatternTheme?.url) ?? "#ffffff"
              }
              foreground={
                (equipedItemColorTheme
                  ? equipedItemColorTheme.foreColor
                  : equipedItemPatternTheme?.foreColor) ?? "#000000"
              }
              nickname={userInfo?.nickname ?? "Unknown"}
              patternThemeBool={equipedItemPatternTheme?.url != null}
              frameBool={equipedItemPicFrame != null}
              frame={equipedItemPicFrame ? equipedItemPicFrame.url : "Unknown"}
              profilePic={equipedItemPic?.url ?? "Unkown"}
            ></HoverCard>
          </GamificationGuard>
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
        </div>
      )}

      {displayDate && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="nowrap"
          minWidth={0}
        >
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
