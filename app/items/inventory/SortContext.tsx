"use client";

import { createContext, useContext, useState } from "react";

type SortContextType = {
  sortBy: "name" | "rarity";
  setSortBy: (value: "name" | "rarity") => void;
  showLocked: boolean;
  setShowLocked: (value: boolean) => void;
};

const SortContext = createContext<SortContextType | undefined>(undefined);

export const SortProvider = ({ children }: { children: React.ReactNode }) => {
  const [sortBy, setSortBy] = useState<"name" | "rarity">("name");
  const [showLocked, setShowLocked] = useState<boolean>(true); // ✅ neu

  return (
    <SortContext.Provider
      value={{ sortBy, setSortBy, showLocked, setShowLocked }}
    >
      {children}
    </SortContext.Provider>
  );
};

export const useSort = () => {
  const context = useContext(SortContext);
  if (!context) throw new Error("useSort must be used within SortProvider");
  return context;
};
