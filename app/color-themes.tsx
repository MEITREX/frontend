import { createTheme } from "@mui/material";
import tailwindColors from "tailwindcss/colors";
import {
  COLOR_BLIND,
  MEITREX_LOGO,
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  SURFACE_DARK_TONAL,
  SURFACE_LIGHT,
} from "./colors";

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
  ...commonStyles,
  palette: {
    mode: "light",
    colorBlind: false,

    primaryA: PRIMARY_LIGHT,
    secondaryA: MEITREX_LOGO.hat,
    surfaceA: SURFACE_LIGHT,

    assessment: {
      flashcardSet: tailwindColors.emerald[200],
      quiz: tailwindColors.rose[200],
      media: tailwindColors.violet[200],
    },

    primary: {
      main: PRIMARY_LIGHT[10],
    },

    warning: {
      main: "#C72C48",
    },
  },
});

export const themeDark = createTheme({
  ...commonStyles,
  palette: {
    mode: "dark",
    colorBlind: false,

    primaryA: PRIMARY_DARK,
    secondaryA: MEITREX_LOGO.hat,
    surfaceA: SURFACE_DARK_TONAL,

    assessment: {
      flashcardSet: tailwindColors.emerald[500],
      quiz: tailwindColors.rose[400],
      media: tailwindColors.violet[500],
    },

    primary: {
      main: PRIMARY_LIGHT[20],
    },
  },
});

export const themeColorBlind = createTheme({
  ...commonStyles,
  palette: {
    // shouldn't do much since we re-declare basically every value
    contrastThreshold: 4.5,

    mode: "light",
    // have tried to override mode for a "colorBlind" mode, but it wouldn't work no matter what I tried
    colorBlind: true,

    primaryA: PRIMARY_LIGHT, // TODO
    secondaryA: MEITREX_LOGO.hat, // TODO
    surfaceA: SURFACE_LIGHT,

    assessment: {
      flashcardSet: COLOR_BLIND.green,
      quiz: COLOR_BLIND.pink,
      media: COLOR_BLIND.lightBlue,
    },
  },
});
