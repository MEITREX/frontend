"use client";

import { Box, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const HylimoEditor = dynamic(
  () => import("../../components/hylimo/HylimoEditor"),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "450px",
        }}
      >
        <CircularProgress />
      </Box>
    ),
  }
);

export default function MainHylimoEditor({
  initialValue,
  onChange,
  readOnly = false,
}: {
  initialValue: string;
  onChange(value: string): void;
  readOnly?: boolean;
}) {


  // Registriere Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => console.log("[HyLimo] Service Worker registered"))
        .catch((err) => console.log("[HyLimo] SW registration failed:", err));
    }
  }, []);


  return (
    <HylimoEditor
      initialValue={initialValue}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}
