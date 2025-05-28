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
import { pageStudentGamificationQuery } from "@/__generated__/pageStudentGamificationQuery.graphql";
import { pageUserGamificationSettingsQuery } from "@/__generated__/pageUserGamificationSettingsQuery.graphql";
import { pageUpdateGamificationSettingsMutation } from "@/__generated__/pageUpdateGamificationSettingsMutation.graphql";

enum GamificationSettings {
  GAMIFICATION_ENABLED = "GAMIFICATION_ENABLED",
  ADAPTIVE_GAMIFICATION_ENABLED = "ADAPTIVE_GAMIFICATION_ENABLED",
  ALL_GAMIFICATION_DISABLED = "ALL_GAMIFICATION_DISABLED",
}

export default function GamificationSettingsPage() {
  const [setting, setSetting] = useState<GamificationSettings | undefined>(
    undefined
  );

  const { currentUserInfo } = useLazyLoadQuery<pageStudentGamificationQuery>(
    graphql`
      query pageStudentGamificationQuery {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  if (!currentUserInfo?.id) {
    return <div>Loading user info...</div>;
  }

  const userGamificationSettings =
    useLazyLoadQuery<pageUserGamificationSettingsQuery>(
      graphql`
        query pageUserGamificationSettingsQuery($id: UUID!) {
          findUserSettings(userId: $id) {
            gamification
          }
        }
      `,
      { id: currentUserInfo.id },
      { fetchPolicy: "network-only" }
    );

  const [updateGamificationSettings] =
    useMutation<pageUpdateGamificationSettingsMutation>(graphql`
      mutation pageUpdateGamificationSettingsMutation(
        $id: UUID!
        $input: SettingsInput!
      ) {
        updateSettings(userId: $id, input: $input) {
          gamification
        }
      }
    `);

  useEffect(() => {
    if (userGamificationSettings?.findUserSettings?.gamification) {
      setSetting(
        userGamificationSettings.findUserSettings
          .gamification as GamificationSettings
      );
    }
  }, [userGamificationSettings]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value as GamificationSettings;
    setSetting(newValue);
    updateGamificationSettings({
      variables: {
        id: currentUserInfo.id,
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

  if (setting === undefined) {
    return null;
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
            value={GamificationSettings.GAMIFICATION_ENABLED}
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
            value={GamificationSettings.ADAPTIVE_GAMIFICATION_ENABLED}
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
            value={GamificationSettings.ALL_GAMIFICATION_DISABLED}
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
