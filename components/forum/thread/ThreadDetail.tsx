import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Tooltip,
  Stack,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import PostList from "../post/PostList";
import { useMutation } from "react-relay";
import { forumApiAddPostMutation } from "@/components/forum/api/ForumApi";
import { ForumApiAddPostMutation, InputPost } from "@/__generated__/ForumApiAddPostMutation.graphql";
import UpvoteDownvote from "@/components/forum/shared/UpvoteDownvote";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditableContent from "@/components/forum/richTextEditor/EditableContent";
import TextEditor from "@/components/forum/richTextEditor/TextEditor";
import { Post, ThreadDetailType } from "@/components/forum/types";
import PostsContext from "../context/PostsContext";

type Props = {
  thread: ThreadDetailType;
  courseId: string;
};

export default function ThreadDetail({thread, courseId}: Props) {

  const [replyText, setReplyText] = useState('');

  const [displayTextEditor, setDisplayTextEditor] = useState(false);

  const [commitPost] = useMutation<ForumApiAddPostMutation>(forumApiAddPostMutation);

  const [localPosts, setLocalPosts] = useState<ThreadDetailType["posts"]>(thread.posts ?? []);

  const deletePostFromState = (postIdToDelete:string) => {
    setLocalPosts(currentPosts =>
      currentPosts.filter(post => post.id !== postIdToDelete)
    );
  };

  const handleSubmit = () => {
    const replyTextTrimmed = replyText.trim();
    if (replyTextTrimmed === '') return;

    const post: InputPost = {
      content: replyTextTrimmed,
      threadId: thread?.id
    }

    commitPost({
      variables:{post: post},
      onCompleted(data) {
        const newPost = data.addPost;
        if (newPost) {
          setLocalPosts([
            ...localPosts,
            newPost as Post
          ]);
          setDisplayTextEditor(false);
        }
      },
      onError(error) {
        console.error("Replay failed:", error);
      },
    })
    setReplyText('');
  };

  if (!thread) {
    return <div>Loading..</div>;
  }

  return (
    <PostsContext.Provider value={{ deletePostContext: deletePostFromState }}>
    <Link href={`/courses/${courseId}/forum`} passHref>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Link>
      <Box
        sx={{
          height: "70vh",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
          px: 1,
          pt: 1,
          backgroundColor: "#fff",
          borderRadius: 2,
          position:"relative",
        }}
      >
        <Stack
          sx={{ backgroundColor: "#f5f7fa", borderRadius: 2, p: 2 }}
          direction="row"
          spacing={2}
        >
          <UpvoteDownvote
            upvotedByUsers={thread?.info?.upvotedByUsers ?? thread?.question?.upvotedByUsers}
            downvotedByUsers={thread?.info?.downvotedByUsers ?? thread?.question?.downvotedByUsers}
            postId={thread?.info?.id ?? thread?.question?.id!}
          />

          <Box flex={1}>
            <Typography variant="h5" gutterBottom>
              {thread?.title}
            </Typography>

            <Box sx={{mb:1}}>
               <EditableContent authorId={thread.question?.authorId ?? thread.info?.authorId!} initialContent={thread.question?.content ?? thread.info?.content!} postId={thread.question?.id ?? thread.info?.id!}></EditableContent>
            </Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {thread.creationTime && <UserPostInformation
                creationTime={thread.creationTime}
                numberOfPosts={thread.numberOfPosts}
                creatorId={thread.creatorId}
              />}
              {thread.info && (
                <Tooltip title="Info Thread">
                  <InfoOutlinedIcon sx={{ fontSize: 28, color: "#1976d2" }} />
                </Tooltip>
              )}
              {thread.question && (
                <Tooltip title="Question Thread">
                 <HelpOutlineIcon sx={{ fontSize: 28, color: "#ff9800" }} />
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <PostList threadCreatorId={thread?.creatorId} posts={localPosts ?? []} ></PostList>


        <Box sx={{ display: "flex", gap: 1, flexDirection:"column", alignItems:"start" }}>
          <Button onClick={()=> setDisplayTextEditor(!displayTextEditor)} variant="text" color="primary">Answer</Button>
          {displayTextEditor && (
            <Box sx={{width:"100%"}}>
              <TextEditor  onContentChange={(html) =>  setReplyText(html)} />
              <Box sx={{ display:"flex", mt: 1, gap:1, justifyContent:"flex-end"}}>
              <Button
                color="warning"
                variant="contained"
                onClick={()=> setDisplayTextEditor(!displayTextEditor)}
                sx={{ height: "fit-content" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!replyText.trim()}
                sx={{ height: "fit-content" }}
              >
                Post
              </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </PostsContext.Provider>
  );
}
