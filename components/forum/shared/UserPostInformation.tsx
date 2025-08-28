import { Avatar, Stack, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { ThreadType } from "@/components/forum/types";
import { useLazyLoadQuery } from "react-relay";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import {
  forumApiUserInfoByIdQuery,
  forumApiUserInfoQuery,
} from "@/components/forum/api/ForumApi";
import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";
import { useRouter } from "next/navigation";

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

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      flexWrap="nowrap"
      overflow="hidden"
    >
      {displayPB && <Avatar sx={{ width: 24, height: 24 }}>A</Avatar>}
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
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="nowrap"
          overflow="hidden"
        >
          <CalendarTodayIcon fontSize="small" />
          <Typography
            variant="caption"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {format(new Date(creationTime as string), "MMMM d, yyyy, hh:mm a")}
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
