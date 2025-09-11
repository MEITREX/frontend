import { Suspense } from "react";
import SkeletonThreadList from "@/components/forum/skeleton/SkeletonThreadList";
import ForumOverview from "@/components/forum/ForumOverview";
import * as React from "react";

export default function Forum() {
  return (
    <Suspense fallback={<SkeletonThreadList />}>
      <ForumOverview />
    </Suspense>
  );
}