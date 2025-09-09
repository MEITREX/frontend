import { Box, Typography } from "@mui/material";
import { format } from "date-fns";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import React from "react";
import CourseName from "./CourseName";

type ForumActivityEntry = {
  courseId: string | null;
  creationTime: string;
  thread: {
    id: string;
    title: string;
    creatorId: string;
  };
  post: {
    id: string;
    content: string;
    authorId: string;
  } | null;
} | null;

type Props = {
  data: ForumActivityEntry;
  displayCourseName?: boolean;
};

export default function ForumActivity({
  data,
  displayCourseName = false,
}: Props) {
  if (!data) return null;
  const { creationTime, thread, post, courseId } = data;

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        p: 1,
        mb: 1.5,
        position: "relative",
        "&:hover": {
          backgroundColor: "grey.100",
          cursor: "pointer",
        },
        transition: "background-color 0.2s ease",
      }}
    >
      {!post ? (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexWrap: "nowrap",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
            >
              {format(new Date(creationTime as string), "MM.dd.yyyy, hh:mm a")}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "info.main", fontWeight: "bold" }}
            >
              New Thread by –
            </Typography>
            <UserPostInformation
              creationTime={creationTime}
              creatorId={thread.creatorId}
              displayDate={false}
              displayPB={false}
            />
          </Box>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              color: "primary.main",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {thread.title}
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
            >
              {format(new Date(creationTime as string), "MM.dd.yyyy, hh:mm a")}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "info.main", fontWeight: "bold" }}
            >
              New Answer by –
            </Typography>
            <UserPostInformation
              creationTime={creationTime}
              creatorId={post.authorId}
              displayDate={false}
              displayPB={false}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.disabled"
            sx={{
              fontStyle: "italic",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mt: "5px",
            }}
          >
            Thread: {thread.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                whiteSpace: "nowrap",
                fontSize: "0.9rem",
              }}
            >
              Answer:
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                maxHeight: "1.2em",
                overflow: "hidden",
                position: "relative",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              <ContentViewer htmlContent={post.content} />
            </Box>
          </Box>
        </Box>
      )}

      {displayCourseName && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
            fontSize: "0.875rem",
          }}
        >
          {courseId ? (
            <CourseName courseId={courseId} />
          ) : (
            <Box>Unknown Course</Box>
          )}{" "}
        </Box>
      )}
    </Box>
  );
}
