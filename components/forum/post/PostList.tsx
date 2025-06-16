import { Box, Typography } from '@mui/material';
import PostItem from './PostItem';
import { PostsType, ThreadType } from "@/components/forum/types";
import { useMutation } from "react-relay";
import { ForumApiSelectBestAnswerMutation } from "@/__generated__/ForumApiSelectBestAnswerMutation.graphql";
import { forumApiSelectBestAnswerMutation } from "@/components/forum/api/ForumApi";
import { useState } from "react";

type Props = {
  posts: PostsType;
  threadCreatorId: ThreadType["creatorId"];
  bestAnswerId?: ThreadType["selectedAnswer"];
};

export default function PostList({posts,threadCreatorId, bestAnswerId }: Props) {
  const [selectBestAnswer] = useMutation<ForumApiSelectBestAnswerMutation>(forumApiSelectBestAnswerMutation);
  const [bestAnswerLocalId, setBestAnswerLocalId] = useState<string | null>(bestAnswerId?.id ?? null);

  if (posts.length === 0) {
    return <Typography variant="body2" color="text.secondary">No Answers.</Typography>;
  }

  const handleMarkAsBest = (id: string)=> {
    selectBestAnswer({
      variables:{postId:id},
      onCompleted() {
        setBestAnswerLocalId(id)
        console.log("Best Answer Selected!")
      },
      onError(error: Error) {
        console.log(error);
      }
    })
  }

  return (
    <Box sx={{overflowY:'scroll'}}>
      {posts.map((post) => (
        <PostItem onMarkAsBest={() => handleMarkAsBest(post.id)} bestAnswerId={bestAnswerLocalId} threadCreatorId={threadCreatorId} key={post.id} post={post} />
      ))}
    </Box>
  );
}
