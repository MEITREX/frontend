"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import { useParams, usePathname } from "next/navigation";
import ThreadList from "@/components/forum/thread/ThreadList";
import ForumHeader from "@/components/forum/header/ForumHeader";
import { Box, Typography } from "@mui/material";
import { forumApiThreadByMediaRecordQuery } from "@/components/forum/api/ForumApi";
import ThreadForm from "@/components/forum/thread/ThreadForm";
import { ForumApiThreadsCombinedQuery } from "@/__generated__/ForumApiThreadsCombinedQuery.graphql";
import ThreadDetail from "./thread/ThreadDetail";
import SkeletonThreadForm from "@/components/forum/skeleton/SkeletonThreadForm";
import SkeletonThreadDetail from "./skeleton/SkeletonThreadDetail";
import SkeletonThreadList from "./skeleton/SkeletonThreadList";

/*
  TODO: The navigation is done by displaying the necessary components via 'viewMode' variable.
  In the future we should refactor the parent component of this component to a Layout.tsx-component!
  With the help of the layout component we can use subroutes which would make everything a lot easier
  and would prevent 'Prop Drilling'
*/
export default function ForumOverview() {
  const params = useParams();
  const pathname = usePathname();

  const courseId = params.courseId as string;
  const [contentIdForQuery, setcontentIdForQuery] = useState(
    params.mediaId || ""
  );
  const isMediaPage = pathname.includes("/media/");

  const [selectedThreadId, setSelectedThreadId] = useState<string>("");

  const [viewMode, setViewMode] = useState<
    "threadDetail" | "createNewThreadMediaContent" | "headerThreadList"
  >("headerThreadList");

  const handleThreadClick = (threadId: string) => {
    setSelectedThreadId(threadId);
    setViewMode("threadDetail");
  };

  const [fetchKey, setFetchKey] = useState(0);

  const data = useLazyLoadQuery<ForumApiThreadsCombinedQuery>(
    forumApiThreadByMediaRecordQuery,
    {
      courseId: courseId,
      hasContentId: isMediaPage,
      contentId: contentIdForQuery,
    },
    { fetchPolicy: "network-only", fetchKey: fetchKey }
  );

  const handleCreationComplete = () => {
    setViewMode("headerThreadList");
    triggerRefetch();
  };

  const triggerRefetch = () => {
    setFetchKey((prevKey) => prevKey + 1);
  };

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
          height: "78vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {viewMode === "headerThreadList" && (
          <>
            <ForumHeader
              sortBy={sortBy}
              setSortBy={setSortBy}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              createThread={() => setViewMode("createNewThreadMediaContent")}
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
              <ThreadList
                threads={filteredAndSortedThreads}
                onThreadClick={handleThreadClick}
              />
            </Suspense>
          </>
        )}
        {viewMode === "createNewThreadMediaContent" && (
          <Box sx={{ overflowY: "scroll" }}>
            <Suspense fallback={<SkeletonThreadForm />}>
              <ThreadForm redirect={() => handleCreationComplete()} />
            </Suspense>
          </Box>
        )}
        {viewMode === "threadDetail" && (
          <Box sx={{ height: "78vh", overflowY: "auto", p: 2 }}>
            <Suspense fallback={<SkeletonThreadDetail />}>
              <ThreadDetail
                threadId={selectedThreadId}
                redirect={() => handleCreationComplete()}
              />
            </Suspense>
          </Box>
        )}
      </Box>
    </>
  );
}
