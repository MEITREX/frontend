"use client";
import { Dispatch, SetStateAction, createContext } from "react";

export type ThemeVariantContextType = {
  themeVariant: "light" | "dark" | "color-blind";
  setThemeVariant: Dispatch<SetStateAction<"light" | "dark" | "color-blind">>;
};
export const ThemeVariantContext = createContext({
  themeVariant: "light",
  setThemeVariant: (themeVariant: "light" | "dark" | "color-blind") => {},
});

