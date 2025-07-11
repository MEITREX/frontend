import { useState } from "react";
import AchievementPopUp from "./achievements/AchievementPopUp";
import AllAchievements from "./achievements/AllAchievements";
import LatestAchievements from "./achievements/LatestAchievements";
import { Achievement } from "./achievements/types";

type AchievementListProps = {
  achievements: Achievement[];
  profileTypeSortString: 'achieved' | 'not-achieved' | null;
};

const AchievementList = ({ achievements, profileTypeSortString }: AchievementListProps) => {
  const achieved = achievements
    .filter((a: Achievement) => a.completed)
    .sort(
      (a: Achievement, b: Achievement) => {
        const dateA = a.trackingEndTime ? new Date(a.trackingEndTime).getTime() : 0;
        const dateB = b.trackingEndTime ? new Date(b.trackingEndTime).getTime() : 0;
        return dateB - dateA;
      }
    ) // neueste zuerst
    .slice(0, 4); // z.B. 5 letzte

  const courseIDs = [...new Set(achievements.map((a: Achievement) => a.courseId))];

  const [selectedCourse, setSelectedCourse] = useState(courseIDs[0]);

  const handleChangeCourse = (
    _event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedCourse(newValue);
  };

  const [filter, setFilter] = useState<"achieved" | "not-achieved" | null>(
    profileTypeSortString
  );

  const filteredAchievements = achievements
    .filter((a: Achievement) => a.courseId === selectedCourse)
    .filter((a: Achievement) => {
      if (filter === "achieved") return a.completed;
      if (filter === "not-achieved") return !a.completed;
      return true;
    });

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(
    null
  );
  const [openAchievementDialog, setOpenDialog] = useState(false);

  const handleCloseAchievement = () => {
    setOpenDialog(false);
  };

  const handleOpenAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setOpenDialog(true);
  };

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newFilter: "achieved" | "not-achieved" | null
  ) => {
    setFilter(newFilter);
  };

  return (
    <>
      <LatestAchievements
        openAchievements={handleOpenAchievement}
        achievements={achieved}
      ></LatestAchievements>

      <AllAchievements
        courses={courseIDs}
        filter={filter}
        filteredAchievements={filteredAchievements}
        achievements={achievements}
        handleOpenAchievement={handleOpenAchievement}
        selectedCourse={selectedCourse}
        handleChangeCourse={handleChangeCourse}
        handleChange={handleChange}
        profileTypeSortString={profileTypeSortString}
      ></AllAchievements>

      <AchievementPopUp
        open={openAchievementDialog}
        onClose={handleCloseAchievement}
        selectedAchievement={selectedAchievement}
      />
    </>
  );
};

export default AchievementList;
