import { Avatar, Stack, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { ThreadType } from "@/components/forum/types";
import { useLazyLoadQuery } from "react-relay";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import { forumApiUserInfoByIdQuery, forumApiUserInfoQuery } from "@/components/forum/api/ForumApi";
import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";

type Props = {
  creatorId: ThreadType["creatorId"]
  creationTime: ThreadType["creationTime"];
  numberOfPosts?: ThreadType["numberOfPosts"] | undefined;
};

export default function UserPostInformation({creationTime, numberOfPosts, creatorId}:Props) {

  // TODO: Refactor: We should add the username in the backend to the post, so we don't have to fetch for it for every post
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
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
      <Avatar sx={{ width: 24, height: 24 }}>
        A
      </Avatar>
      {userInfo && <Typography
        color={loggedInUser.currentUserInfo.id === userInfo.id ? "#00a152" : "default"}
        variant="caption">{userInfo.userName ?? "unknown"}</Typography>}

      <Stack direction="row" spacing={0.5} alignItems="center">
        <CalendarTodayIcon fontSize="small" />
        <Typography variant="caption">
          {format(new Date(creationTime as string), "MMMM d, yyyy, hh:mm a")}
        </Typography>
      </Stack>

      {numberOfPosts !== undefined && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ChatBubbleOutlineIcon fontSize="small" />
          <Typography variant="body2">{numberOfPosts}</Typography>
        </Stack>
      )}
    </Stack>
  );
}
