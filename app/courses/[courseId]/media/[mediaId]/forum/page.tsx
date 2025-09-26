"use client";

import ForumOverview from "@/components/forum/ForumOverview";
import { Suspense } from "react";
import SkeletonThreadList from "@/components/forum/skeleton/SkeletonThreadList";
import * as React from "react";

export default function ForumSlotPage() {
  return (
    <Suspense fallback={<SkeletonThreadList />}>
      <ForumOverview />
    </Suspense>
  );
}
