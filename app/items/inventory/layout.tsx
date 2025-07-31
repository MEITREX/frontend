"use client"

import { Box, Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";


const tabs = [
  { label: "Profile Picture", path: "picture" },
  { label: "Profile Frame", path: "frame" },
  { label: "Profile Background", path: "background" },
  { label: "Tutor Avatar", path: "tutor_avatar" },
];

export default function InventoryLayout({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const pathname = usePathname();

    const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

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

                {children}


          </Box>
    );
}
