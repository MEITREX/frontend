"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, Tab, Box } from "@mui/material";
import { useAuth } from "react-oidc-context";

export function StudentCourseNavigation({ courseId }: { courseId: string }) {
  const auth = useAuth();
  const isGamificationDisabled =
    auth.user?.profile.gamification_type === "none";

  const baseTabs = [
    { label: "Course Overview", path: "" },
    { label: "Learning Progress", path: "/progress" },
    { label: "Chapters", path: "/chapters" },
    { label: "Forum", path: "/forum" },
  ];

  const gamificationTabs = [{ label: "Leaderboard", path: "/leaderboard" }];

  const tabs = isGamificationDisabled
    ? baseTabs
    : [...baseTabs, ...gamificationTabs];

  const pathname = usePathname();
  const currentTabPath = pathname.replace(`/courses/${courseId}`, "") || "";
  const activeTabIndex = tabs.findIndex((tab) => tab.path === currentTabPath);

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={activeTabIndex === -1 ? false : activeTabIndex}
        aria-label="Course navigation tabs"
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            component={Link}
            href={`/courses/${courseId}${tab.path}`}
          />
        ))}
      </Tabs>
    </Box>
  );
}
