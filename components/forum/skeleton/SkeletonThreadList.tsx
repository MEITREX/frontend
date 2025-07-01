"use client";

import { Box } from "@mui/material";
import ThreadItemSkeleton from "./SkeletonThreadItem";
type ThreadListSkeletonProps = {
  count?: number;
};

export default function ThreadListSkeleton({
  count = 5,
}: ThreadListSkeletonProps) {
  return (
    <Box sx={{ overflowY: "auto", p: 1 }}>
      {Array.from({ length: count }).map((_, index) => (
        <ThreadItemSkeleton key={index} />
      ))}
    </Box>
  );
}
