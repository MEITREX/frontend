import { GlobalStyles, Theme, createTheme, useTheme } from "@mui/material";
import { colors } from "./colors";
import { colors as muiColors } from "@mui/material";
import tailwindColors from "tailwindcss/colors";

/**
 * Used to provide CSS variables necessary for tailwind to use the MUI theme colors in its expressions
 * Needs to be synced with the extend colors values from the tailwind.config.js
 */
export const GlobalStylesSetup = () => {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        ":root": {
          "--color-muitheme-bg-secondary":
            theme.palette.backgroundSecondary.main,
          "--color-muitheme-bg-secondary-light":
            theme.palette.backgroundSecondary.light,
          "--color-muitheme-primary-dark": theme.palette.primary.dark,
          "--color-muitheme-background": theme.palette.background.default,
          "--color-muitheme-shadeLight": theme.palette.shade.light,
          "--color-muitheme-shadeDark": theme.palette.shade.dark,

          "--color-muitheme-assessment-quiz": theme.palette.assessment.quiz,
          "--color-muitheme-assessment-fc":
            theme.palette.assessment.flashcardSet,
          "--color-muitheme-assessment-media": theme.palette.assessment.media,
        },
      }}
    />
  );
};

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

    primary: {
      dark: colors.light[700],
      main: colors.logo.main,
    },
    backgroundSecondary: {
      main: colors.light[100],
      light: colors.light[50],
    },
    shade: {
      dark: muiColors.grey[200],
      main: muiColors.grey[100],
      light: muiColors.grey[50],
    },

    warning: {
      main: "#C72C48",
    },

    assessment: {
      flashcardSet: tailwindColors.emerald[200],
      quiz: tailwindColors.rose[200],
      media: tailwindColors.violet[200],
    },
  },
});

export const themeDark = createTheme({
  ...commonStyles,
  palette: {
    mode: "dark",
    colorBlind: false,

    primary: {
      dark: colors.dark[300],
      main: colors.logo.main,
    },
    backgroundSecondary: {
      main: colors.dark[900],
      light: colors.dark[950],
    },
    shade: {
      dark: colors.dark[700],
      main: colors.dark[950],
      light: colors.dark[950],
    },

    warning: {
      main: "#B0224C",
    },

    assessment: {
      flashcardSet: tailwindColors.emerald[500],
      quiz: tailwindColors.rose[400],
      media: tailwindColors.violet[500],
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

    primary: {
      dark: colors.colorBlind.red,
      main: colors.logo.main,
    },
    secondary: {
      main: colors.colorBlind.orange,
    },
    backgroundSecondary: {
      main: muiColors.grey[200],
      light: "#fff",
    },
    shade: {
      dark: muiColors.grey[300],
      main: muiColors.common.white,
      light: muiColors.grey[50],
    },

    warning: {
      main: colors.colorBlind.red,
    },

    assessment: {
      flashcardSet: colors.colorBlind.green,
      quiz: colors.colorBlind.pink,
      media: colors.colorBlind.lightBlue,
    },
  },
});
