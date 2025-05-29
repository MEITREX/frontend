import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
} from "@mui/material";
import { useMutation, graphql } from "react-relay";
import UserSettings from "./UserSettings";
import { NotificationSettings } from "./types";

type Props = {
  userId: string;
};

const notificationSettingsMutation = graphql`
  mutation NotificationSettingsMutation($id: UUID!, $input: SettingsInput!) {
    updateSettings(userId: $id, input: $input) {
      notification {
        gamification
        lecture
      }
    }
  }
`;

export default function NotificationSettingsPage({ userId }: Props) {
  const [settings, setSettings] = useState<NotificationSettings | undefined>(
    undefined
  );

  const [updateNotificationSettings] = useMutation(
    notificationSettingsMutation
  );

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
        id: userId,
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

  if (!settings) {
    return (
      <>
        <UserSettings
          userId={userId}
          onSettingsLoaded={(loadedSettings) => {
            setSettings(loadedSettings.notification);
          }}
        />
      </>
    );
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
                checked={settings?.gamification}
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
                checked={settings?.lecture}
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
