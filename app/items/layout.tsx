"use client";

// app/shop/layout.tsx
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const sections = [
  { label: "Inventory", path: "inventory" },
  { label: "Shop", path: "shop" },
  { label: "Lottery", path: "lottery" },
];

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabIndex = sections.findIndex((section) =>
    pathname.includes(section.path)
  );

  const handleChange = (_: any, newValue: number) => {
    router.push(`/items/${sections[newValue].path}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Shop
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Here you can view your inventory, purchase new items, or try your luck
        in the lottery.
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          ".MuiTabs-indicator": {
            display: "none", // Unterstrich ausblenden
          },
        }}
      >
        {sections.map((section, index) => {
          return (
            <Tab
              key={section.path}
              value={index}
              label={section.label}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                color: "text.primary",
                px: 2,
                py: 1,
                borderRadius: "10px",
                border:
                  sections.indexOf(section) === tabIndex
                    ? "2px solid #00a9d6"
                    : "2px solid transparent",
                backgroundColor:
                  sections.indexOf(section) === tabIndex
                    ? "rgba(0, 169, 214, 0.1)"
                    : "transparent",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "rgba(0, 169, 214, 0.1)",
                },
              }}
            />
          );
        })}
      </Tabs>

      {children}
    </Box>
  );
}
