"use client";

import InventoryListItem from "@/components/items/InventoryListItem";
import { Suspense } from "react";

export default function PicturePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <InventoryListItem itemStringType="profilePics" />
    </Suspense>
  );
}
