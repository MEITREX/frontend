"use client";

import ShopListItem from "@/components/items/ShopListItem";
import { Suspense } from "react";

export default function TutorShopPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ShopListItem itemStringType="patternThemes" />
    </Suspense>
  );
}
