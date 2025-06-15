'use client';

import { useParams, usePathname } from "next/navigation";
import { useLazyLoadQuery } from 'react-relay';
import Box from '@mui/material/Box';
import ThreadItem from './ThreadItem';
import { ForumApiThreadListQuery } from '@/__generated__/ForumApiThreadListQuery.graphql';
import { forumApiThreadListQuery } from "../api/ForumApi";
import Link from 'next/link';

export default function ThreadList() {
  const params = useParams();
  const courseId = params.courseId as string;
  const pathname = usePathname();

  const data = useLazyLoadQuery<ForumApiThreadListQuery>(
    forumApiThreadListQuery,
    { id: courseId },
    { fetchPolicy: 'network-only' }
  );

  const threads = data.forumByCourseId?.threads ?? [];

  return (
    <Box sx={{ overflowY: 'scroll', p: 1 }}>
      {threads.map((thread, index) => (
        <Link key={thread.id ?? index} href={`${pathname}/${thread.id}`} passHref>
          <ThreadItem key={thread.id ?? index} thread={thread} />
        </Link>
      ))}
    </Box>
  );
}
