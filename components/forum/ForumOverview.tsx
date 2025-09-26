"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import { useParams, usePathname } from "next/navigation";
import ThreadList from "@/components/forum/thread/ThreadList";
import ForumHeader from "@/components/forum/header/ForumHeader";
import { Box, Typography } from "@mui/material";
import { forumApiThreadByMediaRecordQuery } from "@/components/forum/api/ForumApi";
import { ForumApiThreadsCombinedQuery } from "@/__generated__/ForumApiThreadsCombinedQuery.graphql";
import SkeletonThreadList from "./skeleton/SkeletonThreadList";

export default function ForumOverview() {
  const params = useParams();
  const pathname = usePathname();

  const courseId = params.courseId as string;
  const [contentIdForQuery, setcontentIdForQuery] = useState(
    params.mediaId || ""
  );

  const isMediaPage = pathname.includes("/media/");

  const data = useLazyLoadQuery<ForumApiThreadsCombinedQuery>(
    forumApiThreadByMediaRecordQuery,
    {
      courseId: courseId,
      hasContentId: isMediaPage,
      contentId: contentIdForQuery,
    },
    { fetchPolicy: "network-only" }
  );

  const [sortBy, setSortBy] = useState("Latest");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // TODO: Do this Serverside
  const filteredAndSortedThreads = useMemo(() => {
    const allThreads =
      data.forumByCourseId?.threads ?? data.threadsByContentId ?? [];

    const categoryFiltered = allThreads.filter((thread) => {
      if (categoryFilter === "ALL") return true;
      if (categoryFilter === "QUESTION")
        return thread.__typename === "QuestionThread";
      if (categoryFilter === "INFO") return thread.__typename === "InfoThread";
      return false;
    });

    if (sortBy === "Oldest") {
      return [...categoryFiltered].sort((a, b) => {
        const dateA = new Date(a.creationTime ?? 0);
        const dateB = new Date(b.creationTime ?? 0);
        return dateA.getTime() - dateB.getTime();
      });
    }

    return [...categoryFiltered].sort((a, b) => {
      const dateA = new Date(a.creationTime ?? 0);
      const dateB = new Date(b.creationTime ?? 0);

      return dateB.getTime() - dateA.getTime();
    });
  }, [data, categoryFilter, sortBy]);

  return (
    <>
      <Box
        sx={{
          height: isMediaPage ? "100%" : "78vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <>
          <ForumHeader
            sortBy={sortBy}
            setSortBy={setSortBy}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
          {isMediaPage && (
            <Typography
              variant="caption"
              sx={{
                p: 2,
                fontStyle: "italic",
                color: "text.secondary",
              }}
            >
              All displayed Threads are related to this Content!
            </Typography>
          )}
          <Suspense fallback={<SkeletonThreadList />}>
            <ThreadList threads={filteredAndSortedThreads} />
          </Suspense>
        </>
      </Box>
    </>
  );
}
