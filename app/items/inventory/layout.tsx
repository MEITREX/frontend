// app/items/inventory/layout.tsx

"use client";

import { SortProvider } from "../../contexts/SortContext"; // ✅ dein Context
import InventoryLayout from "./InventoryLayout"; // ✅ deine Layout-Komponente

export default function InventoryLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SortProvider>
      {" "}
      {/* 👈 HIER außen drum */}
      <InventoryLayout>{children}</InventoryLayout>
    </SortProvider>
  );
}
