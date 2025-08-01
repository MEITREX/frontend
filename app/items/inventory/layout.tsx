// app/items/inventory/layout.tsx

"use client";

import InventoryLayout from "./InventoryLayout"; // ✅ deine Layout-Komponente
import { SortProvider } from "./SortContext"; // ✅ dein Context

export default function InventoryLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SortProvider> {/* 👈 HIER außen drum */}
      <InventoryLayout>{children}</InventoryLayout>
    </SortProvider>
  );
}
