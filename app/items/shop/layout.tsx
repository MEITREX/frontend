"use client";

import { SortProvider } from "../../../components/contexts/SortContextShop";
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
