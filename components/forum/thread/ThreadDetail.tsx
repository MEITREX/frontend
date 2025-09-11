"use client";

import {
  ForumApiAddPostMutation,
  InputPost,
} from "@/__generated__/ForumApiAddPostMutation.graphql";
import { ForumApiThreadDetailQuery } from "@/__generated__/ForumApiThreadDetailQuery.graphql";
import {
  forumApiAddPostMutation,
  forumApiThreadDetailQuery,
} from "@/components/forum/api/ForumApi";
import EditableContent from "@/components/forum/richTextEditor/EditableContent";
import TextEditor from "@/components/forum/richTextEditor/TextEditor";
import UpvoteDownvote from "@/components/forum/shared/UpvoteDownvote";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import { Post, ThreadDetailType } from "@/components/forum/types";
import { PageError } from "@/components/PageError";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import PostsContext from "../context/PostsContext";
import PostList from "../post/PostList";
import ThreadStatusIcons from "./ThreadStatusIcons";
import { useParams, useRouter } from "next/navigation";

export default function ThreadDetail() {
  const { threadId } = useParams();
  const router = useRouter();

  const data = useLazyLoadQuery<ForumApiThreadDetailQuery>(
    forumApiThreadDetailQuery,
    { id: threadId },
    {
      fetchPolicy: "network-only",
    }
  );

  const thread = data?.thread;

  const [replyText, setReplyText] = useState("");

  const [displayTextEditor, setDisplayTextEditor] = useState(false);

  const [commitPost] = useMutation<ForumApiAddPostMutation>(
    forumApiAddPostMutation
  );

  const [localPosts, setLocalPosts] = useState<ThreadDetailType["posts"]>(
    thread?.posts ?? []
  );

  const deletePostFromState = (postIdToDelete: string) => {
    setLocalPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postIdToDelete)
    );
  };

  const handleSubmit = () => {
    const replyTextTrimmed = replyText.trim();
    if (replyTextTrimmed === "") return;

    const post: InputPost = {
      content: replyTextTrimmed,
      threadId: thread?.id,
    };

    commitPost({
      variables: { post: post },
      onCompleted(data) {
        const newPost = data.addPost;
        if (newPost) {
          setLocalPosts([...localPosts, newPost as Post]);
          setDisplayTextEditor(false);
        }
      },
      onError(error) {
        console.error("Replay failed:", error);
      },
    });
    setReplyText("");
  };

  if (!thread) {
    return <PageError message={`No Thread with ID: ${threadId}.`} />;
  }

  return (
    <PostsContext.Provider value={{ deletePostContext: deletePostFromState }}>
      <Button
        onClick={()=> router.back()}
        variant="text"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          px: 1,
          pt: 1,
          backgroundColor: "#fff",
          borderRadius: 2,
          position: "relative",
        }}
      >
        <Stack
          sx={{ backgroundColor: "#f5f7fa", borderRadius: 2, p: 2 }}
          direction="row"
          spacing={2}
        >
          <UpvoteDownvote
            upvotedByUsers={
              thread?.info?.upvotedByUsers ?? thread?.question?.upvotedByUsers
            }
            downvotedByUsers={
              thread?.info?.downvotedByUsers ??
              thread?.question?.downvotedByUsers
            }
            postId={thread?.info?.id ?? thread?.question?.id!}
          />

          <Box flex={1}>
            <Typography variant="h5" gutterBottom>
              {thread?.title}
            </Typography>

            <Box sx={{ mb: 1 }}>
              <EditableContent
                authorId={thread.question?.authorId ?? thread.info?.authorId!}
                initialContent={
                  thread.question?.content ?? thread.info?.content!
                }
                postId={thread.question?.id ?? thread.info?.id!}
              ></EditableContent>
            </Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {thread.creationTime && (
                <UserPostInformation
                  creationTime={thread.creationTime}
                  numberOfPosts={thread.numberOfPosts}
                  creatorId={thread.creatorId}
                />
              )}

              <ThreadStatusIcons thread={thread} />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <PostList
          bestAnswerId={thread?.selectedAnswer}
          threadCreatorId={thread?.creatorId}
          posts={localPosts ?? []}
        ></PostList>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "column",
            alignItems: "start",
          }}
        >
          <Button
            onClick={() => setDisplayTextEditor(!displayTextEditor)}
            variant="text"
            color="primary"
          >
            Answer
          </Button>
          {displayTextEditor && (
            <Box sx={{ width: "100%" }}>
              <TextEditor onContentChange={(html) => setReplyText(html)} />
              <Box
                sx={{
                  display: "flex",
                  mt: 1,
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  color="warning"
                  variant="contained"
                  onClick={() => setDisplayTextEditor(!displayTextEditor)}
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
