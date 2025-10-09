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
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ThreadDetail() {
  const { threadId, courseId } = useParams();
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

  const [replyingToPostId, setReplyingToPostId] = useState<string | null>(null);

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

  const handleOpenReplyEditor = (postId: string) => {
    setReplyingToPostId(postId);
    setDisplayTextEditor(true);
  };

  const handleSubmit = () => {
    const replyTextTrimmed = replyText.trim();

    const post: InputPost = {
      content: replyTextTrimmed,
      threadId: thread?.id,
      reference: replyingToPostId,
    };

    commitPost({
      variables: { post: post },
      onCompleted(dataThread) {
        const newPost = dataThread.addPost;
        if (newPost) {
          setLocalPosts([...localPosts, newPost as Post]);
          setDisplayTextEditor(false);
          setReplyingToPostId(null);
        }
      },
      onError(error) {
        console.error("Replay failed:", error);
      },
    });
    setReplyText("");
  };

  const handleCancel = () => {
    setDisplayTextEditor(!displayTextEditor);
    setReplyingToPostId(null);
  };

  if (!thread) {
    return <PageError message={`No Thread with ID: ${threadId}.`} />;
  }

  return (
    <PostsContext.Provider
      value={{
        deletePostContext: deletePostFromState,
        openReplyEditor: handleOpenReplyEditor,
      }}
    >
      <Button
        onClick={() => router.push(`../forum`)}
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
        {/* Content Reference */}
        {thread.threadContentReference && (
          <Link
            href={`/courses/${courseId}/media/${thread.threadContentReference.contentId}/forum/${thread.id}`}
            passHref
            style={{ textDecoration: "none" }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                color: "success.main",
                mb: 2,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                  color: "success.dark",
                },
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
              <Typography
                variant="body2"
                component="span"
                sx={{ color: "inherit" }}
              >
                This Thread is related to this content:{" "}
                {thread.threadContentReference.contentId}
              </Typography>
            </Stack>
          </Link>
        )}

        {/*Question/Information Thread*/}
        <Stack
          sx={{
            backgroundColor: "#f5f7fa",
            borderRadius: 2,
            p: 2,
            overflowX: "hidden",
          }}
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
                isThread={true}
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

        {/*Postings*/}
        <PostList
          bestAnswerId={thread?.selectedAnswer}
          markPostAnswerId={replyingToPostId}
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
          {/*Answer*/}
          <Button
            onClick={() => setDisplayTextEditor(!displayTextEditor)}
            variant="text"
            color="primary"
          >
            Answer
          </Button>
          {displayTextEditor && (
            <Box sx={{ width: "100%" }}>
              {/*Reply to Post*/}
              {replyingToPostId && (
                <Box
                  sx={{
                    backgroundColor: "#f2f3f5",
                    borderLeft: "4px solid #5865f2",
                    padding: "8px 12px",
                    marginBottom: "8px",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#4f5660" }}>
                    Replying to post
                  </Typography>
                </Box>
              )}
              {/*Editor*/}
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
                  onClick={handleCancel}
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
