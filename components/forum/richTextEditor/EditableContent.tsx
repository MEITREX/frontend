'use client'

import { useLazyLoadQuery, useMutation } from "react-relay";
import { useState } from 'react'
import { Box, Button, IconButton, Stack,  } from "@mui/material";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import TextEditor from './TextEditor'
import {
  forumApiDeletePostMutation,
  forumApiUpdatePostMutation,
  forumApiUserInfoQuery,
} from "@/components/forum/api/ForumApi";
import { ForumApiUpdatePostMutation } from "@/__generated__/ForumApiUpdatePostMutation.graphql";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";;
import { ForumApiDeletePostMutation } from "@/__generated__/ForumApiDeletePostMutation.graphql";
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import { usePostsActions } from "@/components/forum/context/PostsContext";

type Props = {
  initialContent: string,
  postId: string,
  authorId: string
}

export default function EditableContent({ initialContent, postId, authorId }: Props) {
  const user = useLazyLoadQuery<ForumApiUserInfoQuery>(
    forumApiUserInfoQuery,
    {}
  );

  const { deletePostContext } = usePostsActions();

  const isAuthor = user.currentUserInfo.id === authorId;

  const [isEditing, setIsEditing] = useState(false);

  const [currentContent, setCurrentContent] = useState(initialContent);

  const [updatePost] = useMutation<ForumApiUpdatePostMutation>(forumApiUpdatePostMutation);

  const [deletePost] = useMutation<ForumApiDeletePostMutation>(forumApiDeletePostMutation);

  const handleSave =  () => {
    updatePost({
      variables: {
        post: {
          content: currentContent,
          id: postId,
        }
      },
        onCompleted(data) {
          setIsEditing(false);
          console.log("Update successful!")
        },
        onError(error) {
          console.error("Update unsuccessful!", error);
        },
    })
  }

  const handleCancel = () => {
    setCurrentContent(initialContent)
    setIsEditing(false)
  }

  const handleDelete = () => {
    deletePost({
      variables: {
        postId: postId,
        },
      onCompleted(data){
        deletePostContext(postId);
        console.log("Post was deleted!")
      },
      onError(error) {
        console.error("Post delete failed!", error);
      },
    })
  }

  return (
    <Box>
      {isEditing ? (
        <>
          <TextEditor
            initialContent={currentContent}
            onContentChange={(newHtml) => setCurrentContent(newHtml)}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2, mb:2 }}>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <ContentViewer htmlContent={currentContent} />
          {isAuthor && (<Box sx={{ mt: 2, position:"absolute", top:"-2px", right:"50px"}}>
            <IconButton  onClick={() => handleDelete()} size="small" color={"warning"} aria-label="Edit">
              <DeleteOutlineOutlinedIcon />
            </IconButton>
            <IconButton  onClick={() => setIsEditing(true)} size="small" color={"primary"} aria-label="Delete">
              <ModeEditOutlineRoundedIcon  />
            </IconButton>
          </Box>)}
        </>
      )}
    </Box>
  )
}

