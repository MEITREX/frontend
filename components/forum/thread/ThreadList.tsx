"use client";

import Box from "@mui/material/Box";
import ThreadItem from "./ThreadItem";
import { Typography } from "@mui/material";

type Props = {
  threads: any;
};

export default function ThreadList({ threads }: Props) {
  if (threads.length === 0) {
    return (
      <Typography
        variant="caption"
        sx={{
          p: 2,
          fontStyle: "italic",
          color: "text.secondary",
        }}
      >
        There are currently no Threads
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowY: "auto", p: 1 }}>
      {threads.map((thread: any) => (
        <ThreadItem
          key={thread.id}
          thread={thread}
        />
      ))}
    </Box>
  );
}
