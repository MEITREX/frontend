"use client";

import React from "react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Gamification",
    icon: <SportsEsportsIcon />,
    href: "/settings/gamification",
  },
  {
    label: "Notifications",
    icon: <NotificationsIcon />,
    href: "/settings/notification",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Box sx={{ width: 240, borderRight: 1, borderColor: "divider", p: 2 }}>
        <Typography variant="h6" sx={{ ml: 2, mb: 2 }}>
          Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {navItems.map(({ label, icon, href }) => (
            <ListItemButton
              key={label}
              component={Link}
              href={href}
              selected={pathname === href}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1, p: 3 }}>{children}</Box>
    </Box>
  );
}
