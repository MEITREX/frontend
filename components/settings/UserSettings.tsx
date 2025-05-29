"use client";

import { useEffect } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { UserSettingsQuery } from "@/__generated__/UserSettingsQuery.graphql";
import { GamificationSettingsEnum, NotificationSettings } from "./types";

type GamificationSettings = GamificationSettingsEnum | null;

type Props = {
  userId: string;
  onSettingsLoaded: (settings: {
    gamification?: GamificationSettings;
    notification?: NotificationSettings;
  }) => void;
};

const query = graphql`
  query UserSettingsQuery($id: UUID!) {
    findUserSettings(userId: $id) {
      gamification
      notification {
        lecture
        gamification
      }
    }
  }
`;

export default function UserSettings({ userId, onSettingsLoaded }: Props) {
  const data = useLazyLoadQuery<UserSettingsQuery>(
    query,
    { id: userId },
    { fetchPolicy: "network-only" }
  );

  useEffect(() => {
    if (!data.findUserSettings) return;

    onSettingsLoaded({
      gamification: data.findUserSettings.gamification as GamificationSettings,
      notification: {
        gamification: data.findUserSettings.notification?.gamification ?? false,
        lecture: data.findUserSettings.notification?.lecture ?? false,
      },
    });
  }, [data, onSettingsLoaded]);

  return null;
}
