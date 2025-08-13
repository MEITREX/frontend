"use client";

import { SortProvider } from "../../contexts/SortContext";
import InventoryLayout from "./InventoryLayout";

export default function InventoryLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SortProvider>
      <InventoryLayout>{children}</InventoryLayout>
    </SortProvider>
  );
}
