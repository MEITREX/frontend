"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { GamificationSettingsQuery } from "@/__generated__/GamificationSettingsQuery.graphql";
import { GamificationSettingsMutation } from "@/__generated__/GamificationSettingsMutation.graphql";
import UserSettings from "@/components/settings/UserSettings";
import { GamificationSettingsEnum, GamificationSettings } from "./types";

const gamificationSettingsQuery = graphql`
  query GamificationSettingsQuery($id: UUID!) {
    findUserSettings(userId: $id) {
      gamification
    }
  }
`;

const gamificationSettingsMutation = graphql`
  mutation GamificationSettingsMutation($id: UUID!, $input: SettingsInput!) {
    updateSettings(userId: $id, input: $input) {
      gamification
    }
  }
`;

type Props = {
  userId: string;
};

export default function GamificationSettingsPage({ userId }: Props) {
  const [setting, setSetting] = useState<GamificationSettings | undefined>(
    undefined
  );

  const userGamificationSettings = useLazyLoadQuery<GamificationSettingsQuery>(
    gamificationSettingsQuery,
    { id: userId },
    { fetchPolicy: "network-only" }
  );

  const [updateGamificationSettings] =
    useMutation<GamificationSettingsMutation>(gamificationSettingsMutation);

  useEffect(() => {
    if (userGamificationSettings?.findUserSettings?.gamification) {
      setSetting(
        userGamificationSettings.findUserSettings
          .gamification as GamificationSettingsEnum
      );
    }
  }, [userGamificationSettings]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value as GamificationSettingsEnum;
    setSetting(newValue);
    updateGamificationSettings({
      variables: {
        id: userId,
        input: { gamification: newValue },
      },
      onCompleted(data) {
        console.log("Update successful:", data);
      },
      onError(error) {
        console.error("Update failed:", error);
      },
    });
  };

  if (!setting) {
    return (
      <>
        <UserSettings
          userId={userId}
          onSettingsLoaded={(loadedSettings) => {
            setSetting(loadedSettings.gamification as GamificationSettingsEnum);
          }}
        />
      </>
    );
  }

  return (
    <FormControl>
      <FormLabel>Gamification Preferences</FormLabel>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Choose how gamification features should behave for your experience.
      </Typography>
      <RadioGroup value={setting} onChange={handleChange}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            value={GamificationSettingsEnum.GAMIFICATION_ENABLED}
            control={<Radio />}
            label="Gamification Enabled"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Gamification is the use of game-like elements such as games, badges,
            or leaderboards to increase engagement and motivation.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            value={GamificationSettingsEnum.ADAPTIVE_GAMIFICATION_ENABLED}
            control={<Radio />}
            label="Adaptive Gamification Enabled"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Adaptive gamification dynamically adjusts game-like elements based
            on each user&apos;s behavior and engagement to provide a more
            personalized experience.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            value={GamificationSettingsEnum.ALL_GAMIFICATION_DISABLED}
            control={<Radio />}
            label="All Gamification Disabled"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Completely disables all gamification elements in the application.
          </Typography>
        </Box>
      </RadioGroup>
    </FormControl>
  );
}
