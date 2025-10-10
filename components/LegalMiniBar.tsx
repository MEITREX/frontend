"use client";

import { Box, Link, useTheme } from "@mui/material";
import NextLink from "next/link";

export default function LegalMiniBar() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "fixed",
        left: 16,
        bottom: 8,
        width: "var(--sidebar-width, 260px)",
        borderRadius: 2,
        px: 1.25,
        py: 0.5,
        bgcolor: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(6px)",
        border: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.1)",
        display: { xs: "none", md: "flex" },
        gap: 1.5,
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: theme.zIndex.appBar - 1,
      }}
    >
      <Link
        component={NextLink}
        href="/privacy"
        underline="hover"
        color="text.secondary"
        sx={{ fontSize: 12, fontWeight: 500 }}
      >
        Datenschutzerklärung
      </Link>

      <Box
        component="span"
        sx={{ color: "text.disabled", fontSize: 12 }}
      >
        •
      </Box>

      <Link
        component={NextLink}
        href="/imprint"
        underline="hover"
        color="text.secondary"
        sx={{ fontSize: 12, fontWeight: 500 }}
      >
        Impressum
      </Link>
    </Box>
  );
}
