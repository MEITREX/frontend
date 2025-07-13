"use client";

import {
    ColorTheme,
    GeneralSettingsMutation,
    GeneralSettingsMutation$data,
} from "@/__generated__/GeneralSettingsMutation.graphql";
import {
    GeneralSettingsQuery
} from "@/__generated__/GeneralSettingsQuery.graphql";
import {
    ThemeVariantContext,
    ThemeVariantContextType,
} from "@/app/ThemeVariantContext";
import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useCallback, useContext, useMemo } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { graphql, RecordSourceSelectorProxy } from "relay-runtime";

const Query = graphql`
  query GeneralSettingsQuery($id: UUID!) {
    findUserSettings(userId: $id) {
      general {
        colorTheme
      }
    }
  }
`;

const MutationQuery = graphql`
  mutation GeneralSettingsMutation($id: UUID!, $input: SettingsInput!) {
    updateSettings(userId: $id, input: $input) {
      general {
        colorTheme
      }
    }
  }
`;

type ThemeVariant = ThemeVariantContextType["themeVariant"];

type Props = {
  userId: string;
};

export default function GeneralSettingsPage({userId}: Props) {
  const { setThemeVariant } = useContext(ThemeVariantContext);

  const { findUserSettings } = useLazyLoadQuery<GeneralSettingsQuery>(Query, {
    id: userId,
  });
  const [updateSettings] = useMutation<GeneralSettingsMutation>(MutationQuery);

  // map GQL value to typescript type
  const fetchedColorTheme: ThemeVariant = useMemo(() => {
    switch (findUserSettings.general?.colorTheme) {
      case "LIGHT":
        return "light";
      case "DARK":
        return "dark";
      case "COLOR_BLIND":
        return "color-blind";
      default:
        return "auto";
    }
  }, [findUserSettings.general?.colorTheme]);

  const handleSelectionChange = useCallback(
    (e: SelectChangeEvent<ThemeVariant>) => {
      const newTheme = e.target.value as ThemeVariant;
      setThemeVariant(newTheme);

      // map typescript type back to GQL value
      let colorThemeGQL: ColorTheme | null;
      switch (newTheme) {
        case "light":
          colorThemeGQL = "LIGHT";
          break;
        case "dark":
          colorThemeGQL = "DARK";
          break;
        case "color-blind":
          colorThemeGQL = "COLOR_BLIND";
          break;
        case "auto":
          colorThemeGQL = null;
          break;
      }
      updateSettings({
        variables: {
          id: userId,
          input: {
            general: {
              colorTheme: colorThemeGQL,
            },
          },
        },
        updater: (
          store: RecordSourceSelectorProxy<GeneralSettingsMutation$data>,
          data: GeneralSettingsMutation$data
        ) => {
          data.updateSettings.general?.colorTheme;
          const generalSettingsRecord = store.get(
            `client:root:findUserSettings(userId:"${userId}"):general`
          );
          generalSettingsRecord?.setValue(colorThemeGQL, "colorTheme");
        },
        onCompleted: (data, _errors) => {
          console.log("Update successful:", data);
        },
        onError(error) {
          console.error("Update failed:", error);
        },
      });
    },
    [setThemeVariant, updateSettings, userId]
  );

  return (
    <FormControl>
      <FormLabel>General Preferences</FormLabel>

      <div className="flex flex-col mt-4">
        <div>
          <div className="flex items-center gap-x-2">
            <Typography className="mt-0.5">Color Theme</Typography>
            <Select
              className="ml-4"
              value={fetchedColorTheme}
              onChange={handleSelectionChange}
              size="small"
            >
              <MenuItem value="auto">Auto</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="color-blind">Color Blind</MenuItem>
            </Select>
          </div>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Choose your preferred color theme for the entire application
          </Typography>
        </div>
      </div>
    </FormControl>
  );
}
