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
    .slice(0, 5); // z.B. 5 letzte

  const [selectedCourse, setSelectedCourse] = useState("all");

  const courses = [
    { id: "all", name: "All" },
    { id: "course1", name: "Physics 202" },
    { id: "course2", name: "Informatik" },
  ];

  const [filter, setFilter] = useState<"achieved" | "not-achieved" | null>(
    "achieved"
  );

  const filteredAchievements = achievements
    .filter(
      (a: any) => selectedCourse === "all" || a.courseId === selectedCourse
    )
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
        courses={courses}
        filter={filter}
        filteredAchievements={filteredAchievements}
        achievements={achievements}
        handleOpenAchievement={handleOpenAchievement}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
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
