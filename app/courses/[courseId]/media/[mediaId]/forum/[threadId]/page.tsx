"use client";

import { Box } from "@mui/material";
import React, { Suspense } from "react";
import SkeletonThreadDetail from "@/components/forum/skeleton/SkeletonThreadDetail";
import ThreadDetail from "@/components/forum/thread/ThreadDetail";

export default function ThreadPage() {
  return (
    <Box sx={{ height: "78vh", overflowY: "auto", p: 2 }}>
      <Suspense fallback={<SkeletonThreadDetail />}>
        <ThreadDetail />
      </Suspense>
    </Box>
  );
}
