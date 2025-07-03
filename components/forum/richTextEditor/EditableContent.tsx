"use client";

import { useLazyLoadQuery, useMutation } from "react-relay";
import { useState } from "react";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import TextEditor from "./TextEditor";
import {
  forumApiDeletePostMutation,
  forumApiUpdatePostMutation,
  forumApiUserInfoQuery,
} from "@/components/forum/api/ForumApi";
import { ForumApiUpdatePostMutation } from "@/__generated__/ForumApiUpdatePostMutation.graphql";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import { ForumApiDeletePostMutation } from "@/__generated__/ForumApiDeletePostMutation.graphql";
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import { usePostsActions } from "@/components/forum/context/PostsContext";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

type Props = {
  initialContent: string;
  postId: string;
  authorId: string;
  contentIsEdited?: boolean;
};

export default function EditableContent({
  initialContent,
  postId,
  authorId,
  contentIsEdited,
}: Props) {
  const user = useLazyLoadQuery<ForumApiUserInfoQuery>(
    forumApiUserInfoQuery,
    {}
  );

  const { deletePostContext } = usePostsActions();

  const isAuthor = user.currentUserInfo.id === authorId;

  const [edited, setEdited] = useState(contentIsEdited);

  const [isEditing, setIsEditing] = useState(false);

  const [currentContent, setCurrentContent] = useState(initialContent);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    handleMenuClose();
  };

  const [updatePost] = useMutation<ForumApiUpdatePostMutation>(
    forumApiUpdatePostMutation
  );

  const [deletePost] = useMutation<ForumApiDeletePostMutation>(
    forumApiDeletePostMutation
  );

  const handleSave = () => {
    updatePost({
      variables: {
        post: {
          content: currentContent,
          id: postId,
        },
      },
      onCompleted(data) {
        setIsEditing(false);
        setEdited(true);
        console.log("Update successful!");
      },
      onError(error) {
        console.error("Update unsuccessful!", error);
      },
    });
  };

  const handleCancel = () => {
    setCurrentContent(initialContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deletePost({
      variables: {
        postId: postId,
      },
      onCompleted(data) {
        deletePostContext(postId);
        console.log("Post was deleted!");
      },
      onError(error) {
        console.error("Post delete failed!", error);
      },
    });
  };

  return (
    <Box>
      {isEditing ? (
        <>
          <TextEditor
            initialContent={currentContent}
            onContentChange={(newHtml) => setCurrentContent(newHtml)}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
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
          {edited && (
            <Typography
              variant="caption"
              sx={{
                fontStyle: "italic",
                color: "text.secondary",
              }}
            >
              (Edited)
            </Typography>
          )}
          {isAuthor && (
            <Box sx={{ position: "absolute", top: "13px", right: "8px" }}>
              <IconButton
                aria-label="Actions"
                onClick={handleMenuOpen}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleEditClick}>
                  <ListItemIcon>
                    <ModeEditOutlineRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <ListItemIcon>
                    <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
