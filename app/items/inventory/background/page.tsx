"use client";

import InventoryListItem from "@/components/items/InventoryListItem";
import { Suspense } from "react";

export default function BackgroundPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <InventoryListItem itemStringType="colorThemes" publicProfile={false} />
    </Suspense>
  );
}
