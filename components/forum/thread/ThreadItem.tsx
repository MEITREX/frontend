import { Box, Typography, Avatar, Stack } from "@mui/material";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
import UpvoteDownvote from "../shared/UpvoteDownvote";
import { ForumApiThreadListQuery } from "@/__generated__/ForumApiThreadListQuery.graphql";


type Props = {
  thread: NonNullable<NonNullable<ForumApiThreadListQuery["response"]["forumByCourseId"]>["threads"]>[number];
};

export default function ThreadItem({ thread }: Props) {

  return (
      <Box
        component="a"
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          p: 2,
          mb: 1,
          backgroundColor: '#fff',
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          transition: '0.2s',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack direction="row" spacing={2}>
          <UpvoteDownvote
            upvotedByUsers={thread.info?.upvotedByUsers ?? thread.question?.upvotedByUsers}
            downvotedByUsers={thread.info?.downvotedByUsers ?? thread.question?.downvotedByUsers}
            postId={thread.info?.id ?? thread.question?.id!}
          />
            <Stack direction="column">
              <Typography variant="h6" sx={{ color: '#089CDC', fontWeight: 600 }}>
                {thread.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                {thread.question?.content ?? thread.info?.content}
              </Typography>


              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Avatar sx={{ width: 24, height: 24 }}>
                  A
                </Avatar>
                <Typography variant="caption">Toller Name</Typography>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayIcon fontSize="small" />
                    <Typography variant="caption">
                      {format(new Date(thread.creationTime as string), "MMMM d, yyyy, hh:mm a")}
                    </Typography>
                  </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ChatBubbleOutlineIcon fontSize="small" />
                  <Typography variant="body2">10</Typography>
                </Stack>
              </Stack>
            </Stack>
        </Stack>
      </Box>
  );
}
