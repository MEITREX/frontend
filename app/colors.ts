// color sources:
// https://colorffy.com/light-theme-generator?colors=009BDE-ffffff
// https://colorffy.com/dark-theme-generator?colors=009BDE-121212

export const MEITREX_LOGO = {
  main: "#009bde",
  hat: "#3369ad",
} as const;

export const PRIMARY_LIGHT = {
  0: MEITREX_LOGO.main,
  10: "#3298d3",
  20: "#4695c9",
  30: "#5492be",
  40: "#5f8fb4",
  50: "#688ca9",
} as const;

export const PRIMARY_DARK = {
  0: MEITREX_LOGO.main,
  10: "#45a6e2",
  20: "#65b0e6",
  30: "#7fbbe9",
  40: "#97c6ed",
  50: "#add2f1",
} as const;

export const SURFACE_LIGHT = {
  0: "#fff",
  10: "#f0f0f0",
  20: "#e1e1e1",
  30: "#d3d3d3",
  40: "#c4c4c4",
  50: "#b6b6b6",
} as const;

export const SURFACE_LIGHT_TONAL = {
  0: "#edf5fc",
  10: "#e0e7ed",
  20: "#d4dadf",
  30: "#c7ccd1",
  40: "#bbbfc3",
  50: "#afb2b5",
  60: "#a3a5a8",
} as const;

export const SURFACE_DARK = {
  0: "#121212",
  10: "#282828",
  20: "#3f3f3f",
  30: "#575757",
  40: "#717171",
  50: "#8b8b8b",
} as const;

export const SURFACE_DARK_TONAL = {
  0: "#181e23",
  10: "#2d3338",
  20: "#44494d",
  30: "#5c6064",
  40: "#75797c",
  50: "#8f9295",
} as const;

export const COLOR_BLIND = {
  black: "#000000",
  orange: "#E69F00",
  lightBlue: "#56B4E9",
  green: "#009E73",
  yellow: "#F0E442",
  blue: "#0072B2",
  red: "#D55E00",
  pink: "#CC79A7",
} as const;
