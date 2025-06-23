'use client';

import { useState, useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useParams } from 'next/navigation';
import ThreadList from "@/components/forum/thread/ThreadList";
import ForumHeader from "@/components/forum/header/ForumHeader";
import { Box } from "@mui/material";
import { ForumApiThreadListQuery } from '@/__generated__/ForumApiThreadListQuery.graphql';
import { forumApiThreadListQuery } from "@/components/forum/api/ForumApi";

export default function ForumOverview() {
  const params = useParams();
  const courseId = params.courseId as string;

  const data = useLazyLoadQuery<ForumApiThreadListQuery>(
    forumApiThreadListQuery,
    { id: courseId },
    { fetchPolicy: 'network-only' }
  );

  const [sortBy, setSortBy] = useState('Latest');

  const [categoryFilter, setCategoryFilter] = useState('ALL'); 

  const filteredAndSortedThreads = useMemo(() => {
    const allThreads = data.forumByCourseId?.threads ?? [];

    const categoryFiltered = allThreads.filter(thread => {
      if (categoryFilter === 'ALL') return true;
      if (categoryFilter === 'QUESTION') return thread.__typename === 'QuestionThread';
      if (categoryFilter === 'INFO') return thread.__typename === 'InfoThread';
      return false;
    });

    if (sortBy === 'Oldest') {
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
      <Box sx={{height: '78vh',overflow: 'hidden',display: 'flex', flexDirection: 'column'}}>
        <ForumHeader
          sortBy={sortBy}
          setSortBy={setSortBy}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
        <ThreadList threads={filteredAndSortedThreads} />
      </Box>
    </>
  );
}