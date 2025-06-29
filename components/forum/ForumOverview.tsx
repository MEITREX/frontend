'use client';

import { useState, useMemo } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { useParams } from 'next/navigation';
import ThreadList from "@/components/forum/thread/ThreadList";
import ForumHeader from "@/components/forum/header/ForumHeader";
import { Box } from "@mui/material";
import { forumApiThreadByMediaRecordQuery } from "@/components/forum/api/ForumApi";
import ThreadForm from "@/components/forum/thread/ThreadForm";
import { ForumApiThreadsCombinedQuery } from "@/__generated__/ForumApiThreadsCombinedQuery.graphql";
import ThreadDetail from "./thread/ThreadDetail";


export default function ForumOverview() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [contentIdForQuery, setcontentIdForQuery] = useState(params.mediaId || '');
  const hasContentId = !!params.mediaId;


  /*
   Two ways to create new Threads
    1. Directly in the Forum which is a new route ../new
    2. Besides the media content therefore we cannot use routes and need to display the component
   */
 const  [selectedThreadId, setSelectedThreadId] = useState<string>('');
 const [viewMode, setViewMode] = useState<'threadDetail'| 'createNewThreadMediaContent' | 'headerThreadList'>('headerThreadList')

  const handleThreadClick = (threadId: string) => {
    setSelectedThreadId(threadId);
    setViewMode('threadDetail');
  };

  const [fetchKey, setFetchKey] = useState(0);

  const data = useLazyLoadQuery<ForumApiThreadsCombinedQuery>(
    forumApiThreadByMediaRecordQuery,
    { courseId: courseId, hasContentId: hasContentId, contentId: contentIdForQuery},
    { fetchPolicy: 'network-only',
      fetchKey: fetchKey,
    }
  );

  const handleCreationComplete = () => {
    setViewMode('headerThreadList');
    setFetchKey(prevKey => prevKey + 1);
  };

  const [sortBy, setSortBy] = useState('Latest');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); 

  // TODO: Do this Serverside
  const filteredAndSortedThreads = useMemo(() => {
    const allThreads = data.forumByCourseId?.threads ?? data.threadsByContentId ?? [];

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
      <Box sx={{height: '78vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', }}>
        {viewMode === 'headerThreadList' && (
          <>
            <ForumHeader
              sortBy={sortBy}
              setSortBy={setSortBy}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              createThread={() => setViewMode('createNewThreadMediaContent')}
            />
            <ThreadList
              threads={filteredAndSortedThreads}
              onThreadClick={handleThreadClick}
            />
          </>
        )}
        {viewMode === 'createNewThreadMediaContent' && (
          <Box sx={{overflowY: 'scroll'}}>
            <ThreadForm
              redirect={() => handleCreationComplete()}
            />
          </Box>
        )}
        {viewMode === 'threadDetail' && (
          <Box  sx={{height: '78vh', overflowY: 'auto', p: 2 }}>
          <ThreadDetail
            threadId={selectedThreadId}
            redirect={() => setViewMode("headerThreadList")}
          />
          </Box>
        )}
      </Box>
    </>
  );
}