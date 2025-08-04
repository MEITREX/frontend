"use client";

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useSort } from "./SortContext"; // Pfad ggf. anpassen

const tabs = [
  { label: "Profile Picture", path: "picture" },
  { label: "Profile Frame", path: "frame" },
  { label: "Profile Background", path: "background" },
  { label: "Tutor Avatar", path: "tutor_avatar" },
];

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

  const { sortBy, setSortBy, showLocked, setShowLocked } = useSort();

  const handleChange = (_: any, newValue: number) => {
    router.push(`/items/inventory/${tabs[newValue].path}`);
  };

  return (
    <Box
      sx={{
        p: 4,
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 3,
        backgroundColor: "background.paper",
        boxShadow: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap", // für bessere Responsivität
        mb: 3,
        gap: 2,
      }}
    >
      <Tabs
        value={activeIndex}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3, ".MuiTabs-indicator": { display: "none" } }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.path}
            value={index}
            label={tab.label}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              color: "text.primary",
              borderRadius: "10px",
              border:
                index === activeIndex
                  ? "2px solid #00a9d6"
                  : "2px solid transparent",
              backgroundColor:
                index === activeIndex
                  ? "rgba(0, 169, 214, 0.1)"
                  : "transparent",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(0, 169, 214, 0.1)",
              },
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
          ml: "auto", // optional: rechts ausrichten
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy ?? ""}
            onChange={(e) => setSortBy(e.target.value as "name" | "rarity")}
            label="Sort by"
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="rarity">Rarity</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={showLocked}
              onChange={(e) => setShowLocked(e.target.checked)}
              color="primary"
            />
          }
          label="Locked items anzeigen"
        />
      </Box>

      {children}
    </Box>
  );
}
