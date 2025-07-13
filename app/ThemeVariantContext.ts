"use client";
import { Dispatch, SetStateAction, createContext } from "react";

export type ThemeVariantContextType = {
  themeVariant: "light" | "dark" | "color-blind" | "auto";
  setThemeVariant: Dispatch<
    SetStateAction<"light" | "dark" | "color-blind" | "auto">
  >;
};
export const ThemeVariantContext = createContext({
  themeVariant: "light",
  setThemeVariant: (
    themeVariant: ThemeVariantContextType["themeVariant"]
  ) => {},
});
