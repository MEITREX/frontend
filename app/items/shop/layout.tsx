// app/items/inventory/layout.tsx

"use client";

import ShopLayout from "./ShopLayout"; // ✅ deine Layout-Komponente
import { SortProvider } from "./SortContextShop"; // ✅ dein Context

export default function ShopLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SortProvider>
      {" "}
      {/* 👈 HIER außen drum */}
      <ShopLayout>{children}</ShopLayout>
    </SortProvider>
  );
}
