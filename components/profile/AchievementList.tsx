import { useState } from "react";
import AchievementPopUp from "./achievements/AchievementPopUp";
import AllAchievements from "./achievements/AllAchievements";
import LatestAchievements from "./achievements/LatestAchievements";

const AchievementList = ({ achievements }: any) => {
  const achieved = achievements
    .filter((a: any) => a.achieved)
    .sort(
      (a: any, b: any) => b.achievedAt?.getTime()! - a.achievedAt?.getTime()!
    ) // neueste zuerst
    .slice(0, 4); // z.B. 5 letzte

  const courseIDs = [...new Set(achievements.map((a: any) => a.courseId))];

  const [selectedCourse, setSelectedCourse] = useState(courseIDs[0]);

  const handleChangeCourse = (
    _event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedCourse(newValue);
  };

  const [filter, setFilter] = useState<"achieved" | "not-achieved" | null>(
    "not-achieved"
  );

  const filteredAchievements = achievements
    .filter((a: any) => a.courseId === selectedCourse)
    .filter((a: any) => {
      if (filter === "achieved") return a.achieved;
      if (filter === "not-achieved") return !a.achieved;
      return true;
    });

  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(
    null
  );
  const [openAchievementDialog, setOpenDialog] = useState(false);

  const handleCloseAchievement = () => {
    setOpenDialog(false);
  };

  const handleOpenAchievement = (achievement: any) => {
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
