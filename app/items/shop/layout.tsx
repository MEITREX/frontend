"use client";

import { SortProvider } from "../../contexts/SortContextShop";
import ShopLayout from "./ShopLayout";

export default function ShopLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SortProvider>
      <ShopLayout>{children}</ShopLayout>
    </SortProvider>
  );
}
