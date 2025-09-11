import { Box } from "@mui/material";
import React, { Suspense } from "react";
import SkeletonThreadForm from "@/components/forum/skeleton/SkeletonThreadForm";
import ThreadForm from "@/components/forum/thread/ThreadForm";

export default function CreateThread() {
  return (
  <Box sx={{ overflowY: "scroll" }}>
    <Suspense fallback={<SkeletonThreadForm />}>
      <ThreadForm/>
    </Suspense>
  </Box>
  );
}
