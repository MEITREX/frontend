'use client';

import { useParams } from 'next/navigation';
import { useLazyLoadQuery } from 'react-relay';

import { ForumApiThreadDetailQuery } from '@/__generated__/ForumApiThreadDetailQuery.graphql';
import { forumApiThreadDetailQuery } from '@/components/forum/api/ForumApi';
import ThreadDetail from "@/components/forum/thread/ThreadDetail";
import { ThreadDetailType } from "@/components/forum/types";

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params?.threadId as string;
  const courseId = params?.courseId as string;

  const data = useLazyLoadQuery<ForumApiThreadDetailQuery>(
    forumApiThreadDetailQuery,
    { id: threadId },
    {
      fetchPolicy: 'network-only',
    }
  );

  if(!data){
    return (<div>Loading</div>)
  }

  return (
    <main>
    </main>);
}