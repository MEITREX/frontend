import { Box } from "@mui/material";
import { useState } from "react";

interface AchievementImageProps {
  src: string | undefined;
  alt: string | undefined;
  completed: boolean | undefined;
  size?: number; // Neue optionale Größe
}

export default function AchievementImage({
  src,
  alt,
  completed,
  size = 64, // Standardgröße
}: AchievementImageProps) {
  const [hasError, setHasError] = useState(false);

  const sharedStyles = {
    width: size,
    height: size,
    opacity: completed ? 1 : 0.4,
    borderRadius: 2,
    objectFit: "cover" as const,
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "#888",
    textAlign: "center" as const,
  };

  return hasError ? (
    <Box sx={sharedStyles}>{alt}</Box>
  ) : (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      sx={sharedStyles}
    />
  );
}
