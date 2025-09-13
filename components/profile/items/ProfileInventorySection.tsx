// app/items/inventory/InventoryLayout.tsx
"use client";

import { useSort } from "@/app/contexts/SortContext";
import PublicProfileListItem from "@/components/items/PublicProfileListItem";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { ItemStringType } from "../../items/types/Types";

const tabs: { label: string; type: ItemStringType }[] = [
  { label: "Profile Picture", type: "profilePics" },
  { label: "Profile Frame", type: "profilePicFrames" },
  { label: "Profile Background", type: "colorThemes" }, // oder "patternThemes" – je nach Parser
  { label: "Tutor Avatar", type: "tutors" },
];

type ProfileInventorySectionProps = {
  userId: string;
};

export default function ProfileInventorySection({
  userId,
}: ProfileInventorySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { sortBy, setSortBy, showLocked, setShowLocked } = useSort();

  const auth = useAuth();

  const tokenRef = React.useRef<string | undefined>(auth.user?.access_token);
  useEffect(() => {
    tokenRef.current = auth.user?.access_token;
  }, [auth.user?.access_token]);



  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 3,
        backgroundColor: "background.paper",
        boxShadow: 1,
        p: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
          gap: 2,
        }}
      >
        <Tabs
          value={activeIndex}
          onChange={(_, i) => setActiveIndex(i)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3, ".MuiTabs-indicator": { display: "none" } }}
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab.label}
              value={i}
              label={tab.label}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.primary",
                borderRadius: "10px",
                border:
                  i === activeIndex
                    ? "2px solid #00a9d6"
                    : "2px solid transparent",
                backgroundColor:
                  i === activeIndex ? "rgba(0, 169, 214, 0.1)" : "transparent",
                transition: "all 0.2s ease-in-out",
                "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.1)" },
              }}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            ml: "auto",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "rarity" | "name" | "unlockedTime")
              }
              label="Sort by"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="rarity">Rarity</MenuItem>
              <MenuItem value="unlockedTime">Most recent</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Content: genau eine Kategorie je nach aktivem Tab */}
      <Box sx={{ mt: 2 }}>

          <PublicProfileListItem
            key={userId}
            itemStringType={tabs[activeIndex].type}
            publicProfile={true}
            userId={userId}
          />

      </Box>
    </Box>
  );
}
