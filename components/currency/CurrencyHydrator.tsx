// CurrencyHydrator.tsx
"use client";
import { ItemsApiInventoryForUserQuery } from "@/__generated__/ItemsApiInventoryForUserQuery.graphql";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import { inventoryForUserQuery } from "@/components/items/api/ItemsApi";
import { useEffect } from "react";
import { useLazyLoadQuery } from "react-relay";

export default function CurrencyHydrator() {
  const { points, setPoints } = useCurrency();
  const { inventoryForUser } = useLazyLoadQuery<ItemsApiInventoryForUserQuery>(
    inventoryForUserQuery,
    {},
    { fetchPolicy: "store-or-network" }
  );

  useEffect(() => {
    const v = inventoryForUser.unspentPoints;
    // ⬇️ Nur beim ersten Mal hydratisieren – NIE wieder überschreiben
    if (points == null && typeof v === "number") setPoints(v);
  }, [inventoryForUser.unspentPoints, points, setPoints]);

  return null;
}
