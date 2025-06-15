'use client'
import { useParams } from "next/navigation";
import ThreadDetail from "@/components/forum/thread/ThreadDetail";
import { useLazyLoadQuery } from "react-relay";
import { ForumApiThreadDetailQuery } from "@/__generated__/ForumApiThreadDetailQuery.graphql";
import { forumApiThreadDetailQuery } from "@/components/forum/api/ForumApi";

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params?.threadId as string;
  const courseId = params?.courseId as string;

  const data = useLazyLoadQuery<ForumApiThreadDetailQuery>(
    forumApiThreadDetailQuery,
    { id: threadId },
    { fetchPolicy: 'network-only' }
  );

  return (
    <main>
      <ThreadDetail courseId={courseId} thread={data.thread}/>
    </main>
  );
}
