"use client";

import InventoryListItem from "@/components/items/InventoryListItem";
import { Suspense } from "react";

export default function TutorPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <InventoryListItem itemStringType="tutors" />
    </Suspense>
  );
}
