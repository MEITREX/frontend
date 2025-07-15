import { GlobalStyleSetupThemeVariantQuery } from "@/__generated__/GlobalStyleSetupThemeVariantQuery.graphql";
import { GlobalStyleSetupUserInfoQuery } from "@/__generated__/GlobalStyleSetupUserInfoQuery.graphql";
import { GlobalStyles, useTheme } from "@mui/material";
import { useContext, useEffect } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import {
  ThemeVariantContext,
  ThemeVariantContextType,
} from "./ThemeVariantContext";

const QueryUserInfo = graphql`
  query GlobalStyleSetupUserInfoQuery {
    currentUserInfo {
      id
    }
  }
`;

const QueryThemeVariantSetting = graphql`
  query GlobalStyleSetupThemeVariantQuery($id: UUID!) {
    findUserSettings(userId: $id) {
      general {
        colorTheme
      }
    }
  }
`;

/**
 * Used for tailwind to pick up the colors used by the MUI theme.
 * Also syncs the user setting theme with the ThemeVariantContext.
 *
 * NOTE: Needs to be synced with the extend colors values from the tailwind.config.js
 */
export const GlobalStyleSetup = () => {
  const { setThemeVariant } = useContext(ThemeVariantContext);

  const { currentUserInfo } = useLazyLoadQuery<GlobalStyleSetupUserInfoQuery>(
    QueryUserInfo,
    {}
  );
  const { findUserSettings } =
    useLazyLoadQuery<GlobalStyleSetupThemeVariantQuery>(
      QueryThemeVariantSetting,
      { id: currentUserInfo.id }
    );
  useEffect(() => {
    let variantFromSettings: ThemeVariantContextType["themeVariant"] = "auto";
    switch (findUserSettings.general?.colorTheme) {
      case "LIGHT":
        variantFromSettings = "light";
        break;
      case "DARK":
        variantFromSettings = "dark";
        break;
      case "COLOR_BLIND":
        variantFromSettings = "color-blind";
        break;
    }

    setThemeVariant(variantFromSettings);
  }, [findUserSettings.general?.colorTheme, setThemeVariant]);

  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        ":root": {
          "--color-muitheme-primary-a0": theme.palette.primaryA[0],
          "--color-muitheme-primary-a10": theme.palette.primaryA[10],
          "--color-muitheme-primary-a20": theme.palette.primaryA[20],
          "--color-muitheme-primary-a30": theme.palette.primaryA[30],
          "--color-muitheme-primary-a40": theme.palette.primaryA[40],
          "--color-muitheme-primary-a50": theme.palette.primaryA[50],

          "--color-muitheme-secondary": theme.palette.secondaryA,

          "--color-muitheme-surface-a0": theme.palette.surfaceA[0],
          "--color-muitheme-surface-a10": theme.palette.surfaceA[10],
          "--color-muitheme-surface-a20": theme.palette.surfaceA[20],
          "--color-muitheme-surface-a30": theme.palette.surfaceA[30],
          "--color-muitheme-surface-a40": theme.palette.surfaceA[40],
          "--color-muitheme-surface-a50": theme.palette.surfaceA[50],

          "--color-muitheme-assessment-quiz": theme.palette.assessment.quiz,
          "--color-muitheme-assessment-fc":
            theme.palette.assessment.flashcardSet,
          "--color-muitheme-assessment-media": theme.palette.assessment.media,
        },
      }}
    />
  );
};
