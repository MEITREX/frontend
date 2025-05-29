export type NotificationSettings = {
  gamification: boolean;
  lecture: boolean;
};

export enum GamificationSettingsEnum {
  GAMIFICATION_ENABLED = "GAMIFICATION_ENABLED",
  ADAPTIVE_GAMIFICATION_ENABLED = "ADAPTIVE_GAMIFICATION_ENABLED",
  ALL_GAMIFICATION_DISABLED = "ALL_GAMIFICATION_DISABLED",
}

export type GamificationSettings = GamificationSettingsEnum;

export type Settings = {
  gamification: GamificationSettings;
  notification: NotificationSettings;
};
