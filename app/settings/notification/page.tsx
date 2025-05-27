"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
  CircularProgress,
} from "@mui/material";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { pageStudentNotificationQuery } from "@/__generated__/pageStudentNotificationQuery.graphql";
import { pageUserNotificationSettingsQuery } from "@/__generated__/pageUserNotificationSettingsQuery.graphql";
import { pageUpdateNotificationSettingsMutation } from "@/__generated__/pageUpdateNotificationSettingsMutation.graphql";

type NotificationSettings = {
  gamification: boolean;
  lecture: boolean;
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | undefined>(
    undefined
  );

  const { currentUserInfo } = useLazyLoadQuery<pageStudentNotificationQuery>(
    graphql`
      query pageStudentNotificationQuery {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  const userNotificationSettings =
    useLazyLoadQuery<pageUserNotificationSettingsQuery>(
      graphql`
        query pageUserNotificationSettingsQuery($id: UUID!) {
          findUserSettings(userId: $id) {
            notification {
              lecture
              gamification
            }
          }
        }
      `,
      { id: currentUserInfo.id },
      { fetchPolicy: "network-only" }
    );

  const [updateNotificationSettings] =
    useMutation<pageUpdateNotificationSettingsMutation>(
      graphql`
        mutation pageUpdateNotificationSettingsMutation(
          $id: UUID!
          $input: SettingsInput!
        ) {
          updateSettings(userId: $id, input: $input) {
            notification {
              gamification
              lecture
            }
          }
        }
      `
    );

  useEffect(() => {
    const notification =
      userNotificationSettings?.findUserSettings?.notification;
    if (notification) {
      setSettings({
        gamification: notification.gamification,
        lecture: notification.lecture,
      });
    }
  }, [userNotificationSettings]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    if (!settings) return;

    const updatedSettings = {
      ...settings,
      [name]: checked,
    };

    setSettings(updatedSettings);

    updateNotificationSettings({
      variables: {
        id: currentUserInfo.id,
        input: { notification: updatedSettings },
      },
      onCompleted(data) {
        console.log("Update successful:", data);
      },
      onError(error) {
        console.error("Update failed:", error);
      },
    });
  };

  if (settings === undefined) {
    return null;
  }

  return (
    <Box>
      <FormLabel sx={{ mb: 1 }}>Notification Preferences</FormLabel>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Choose which types of notifications you would like to receive:
      </Typography>

      <FormGroup>
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="gamification"
                checked={settings.gamification}
                onChange={handleChange}
              />
            }
            label="Gamification Notifications"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Get updates related to Gamification such as new badges,
            leaderboards, or games.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="lecture"
                checked={settings.lecture}
                onChange={handleChange}
              />
            }
            label="Lecture Notifications"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Get updates related to lecture changes, such as new lectures or
            changes to lecture content.
          </Typography>
        </Box>
      </FormGroup>
    </Box>
  );
}
