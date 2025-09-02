// AchievementIcon.tsx
import achievementsData from "./../achievementSchema.json";

type AchievementItem = {
  name: string;
  url: string | null;
};

export default function AchievementParser(name: string) {
  const match = (achievementsData as AchievementItem[]).find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  if (!match?.url) return null;

  return match.url;
}
