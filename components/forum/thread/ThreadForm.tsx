"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ForumApiCreateInfoThreadMutation,
  InputInfoThread,
} from "@/__generated__/ForumApiCreateInfoThreadMutation.graphql";
import {
  ForumApiCreateQuestionThreadMutation,
  InputQuestionThread,
} from "@/__generated__/ForumApiCreateQuestionThreadMutation.graphql";
import {
  forumApiCreateInfoThreadMutation,
  forumApiCreateQuestionThreadMutation,
  forumApiForumIdQuery,
} from "../api/ForumApi";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { ForumApiForumIdQuery } from "@/__generated__/ForumApiForumIdQuery.graphql";
import TextEditor from "@/components/forum/richTextEditor/TextEditor";

export default function ThreadForm() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const mediaId = params.mediaId as string;

  const pathname = usePathname();
  const isMediaPage = pathname.includes("/media/");

  const contentReferenceData = {
    contentId: mediaId,
    /*
    TODO add time stamps and page numbers
    timeStampSeconds: 12,
    pageNumber: "2"*/
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [threadType, setThreadType] = useState<"QUESTION" | "INFO">("QUESTION");

  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");

  const [commitQuestion] = useMutation<ForumApiCreateQuestionThreadMutation>(
    forumApiCreateQuestionThreadMutation
  );
  const [commitInfo] = useMutation<ForumApiCreateInfoThreadMutation>(
    forumApiCreateInfoThreadMutation
  );

  const data = useLazyLoadQuery<ForumApiForumIdQuery>(
    forumApiForumIdQuery,
    { id: courseId },
    { fetchPolicy: "store-or-network" }
  );

  const handleCreationSuccess = () => {
    setSnackbarOpen(true);
    router.back();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTitleError("");
    setContentError("");

    let valid = true;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // TODO: Somehow this is not working?
    if (trimmedTitle === "") {
      setTitleError("Title is required.");
      valid = false;
    } else if (trimmedTitle.length > 50) {
      setTitleError("Title must be under 50 characters.");
      valid = false;
    }

    if (trimmedContent === "") {
      setContentError("Content is required.");
      valid = false;
    } else if (trimmedContent.length > 500) {
      setContentError("Content must be under 500 characters.");
      valid = false;
    }

    if (!valid) return;

    if (threadType === "QUESTION") {
      const questionThreadInput: InputQuestionThread = {
        forumId: data.forumByCourseId?.id as string,
        title: title.trim(),
        question: { content: content.trim() },
        ...(isMediaPage && { threadContentReference: contentReferenceData }),
      };
      commitQuestion({
        variables: { thread: questionThreadInput },
        onCompleted(data) {
          handleCreationSuccess();
        },
        onError(error) {
          console.error("Question Thread failed:", error);
        },
      });
    } else {
      const infoThreadInput: InputInfoThread = {
        forumId: data.forumByCourseId?.id as string,
        title: title.trim(),
        info: { content: content.trim() },
        ...(isMediaPage && { threadContentReference: contentReferenceData }),
      };
      commitInfo({
        variables: { thread: infoThreadInput },
        onCompleted(data) {
          handleCreationSuccess();
        },
        onError(error) {
          console.error("Info Thread failed:", error);
        },
      });
    }
  };

  return (
    <>
      <Button
        onClick={()=> router.back()}
        component="a"
        variant="text"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Box
        sx={{
          backgroundColor: "#f5f7fa",
          borderRadius: 2,
          maxWidth: "800px",
          mx: "auto",
          px: 2,
          py: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600} mb={2}>
          Create new Thread
        </Typography>

        {isMediaPage && (
          <Typography variant="body2" sx={{ color: "success.main", mb: 2 }}>
            This Thread will be related to this content: {mediaId}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <ToggleButtonGroup
              value={threadType}
              exclusive
              onChange={(_, newType) => {
                if (newType) setThreadType(newType);
              }}
              color="primary"
              size="small"
            >
              <ToggleButton value="QUESTION">Question</ToggleButton>
              <ToggleButton value="INFO">Information</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Stack spacing={3}>
            <Paper
              elevation={1}
              sx={{ p: 2, borderRadius: 3, bgcolor: "#fff" }}
            >
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                error={!!titleError}
                helperText={titleError}
                inputProps={{ maxLength: 100 }}
              />
            </Paper>

            <TextEditor
              onContentChange={(html) => setContent(html)}
            ></TextEditor>

            <Button type="submit" variant="contained" size="large">
              Create Thread
            </Button>
          </Stack>
        </form>
      </Box>
      <Snackbar
        sx={{ width: "100%" }}
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        message="Thread was created!"
      />
    </>
  );
}
