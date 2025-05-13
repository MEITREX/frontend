import {colors, createTheme } from "@mui/material";
import customColors from "./colors";

const commonStyles = {
  typography: {
    fontSize: 14,
    h1: {
      fontSize: "2rem",
      fontWeight: "400",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: "400",
    },
  },
};

export const themeLight = createTheme({
  palette: {
    contrastThreshold: 4.5,
    mode: "light",
    colorBlind: false,
    success: colors.green,
    primary: customColors.primary,
    background: customColors.background.light,
  },
  ...commonStyles,
});

export const themeDark = createTheme({
  palette: {
    contrastThreshold: 4.5,
    mode: "dark",
    colorBlind: false,
    primary: customColors.primary,
    background: customColors.background.dark,
  },
  ...commonStyles,
});

export const themeColorBlind = createTheme({
  palette: {
    mode: "light",
    // have tried to override mode for a "colorBlind" mode, but it wouldn't work no matter what I tried
    colorBlind: true,
  },
  ...commonStyles,
});
