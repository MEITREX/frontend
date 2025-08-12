// app/items/inventory/layout.tsx

"use client";

import { SortProvider } from "../../contexts/SortContextShop"; // ✅ dein Context
import ShopLayout from "./ShopLayout"; // ✅ deine Layout-Komponente

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
