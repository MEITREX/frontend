"use client";

import { Box, Tab, Tabs } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Course Overview", path: "" },
  { label: "Forum", path: "/forum" },
  { label: "Submissions", path: "/submissions" },
];

export function LecturerCourseNavigation({ courseId }: { courseId: string }) {
  const pathname = usePathname();
  const currentTabPath = pathname.replace(`/courses/${courseId}`, "") || "";
  const activeTabIndex = tabs.findIndex((tab) => tab.path === currentTabPath);

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs value={activeTabIndex === -1 ? false : activeTabIndex}>
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
