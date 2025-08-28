// CurrencyContext.tsx
import { createContext, useContext, useState } from "react";

type Ctx = { points: number | null; setPoints: (p: number) => void };
const CurrencyContext = createContext<Ctx | undefined>(undefined);

export function CurrencyProvider({
  children,
  initialPoints,
}: {
  children: React.ReactNode;
  initialPoints?: number;
}) {
  const [points, setPoints] = useState<number | null>(
    typeof initialPoints === "number" ? initialPoints : null
  );
  return (
    <CurrencyContext.Provider value={{ points, setPoints }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
