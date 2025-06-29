"use client";

import Box from "@mui/material/Box";
import ThreadItem from "./ThreadItem";
import { Link, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

type Props = {
  threads: any;
  onThreadClick?: (threadId: string) => void;
};

export default function ThreadList({ threads, onThreadClick }: Props) {
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
          onThreadClick={onThreadClick}
          key={thread.id}
          thread={thread}
        />
      ))}
    </Box>
  );
}
