import dinoPic from "@/assets/logo.svg"; // dein Bild hier importieren
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ForumActivityWidget() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 2,
        mb: 4,
        minHeight: 400,
        maxWidth: 450,
        maxHeight: 400,
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        AI Tutor
      </Typography>
      <Box display="flex" alignItems="flex-start" gap={2}>
        {/* Dino-Bild */}
        <Image
          src={dinoPic}
          alt="Dino"
          width={100}
          height={100}
          style={{ objectFit: "contain" }}
        />

        {/* Sprechblase */}
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 2,
            position: "relative",
            maxWidth: "70%",
          }}
        >
          <Typography variant="body2">
            Hallo! Ich bin dein Dino 🦖. Hier könnte dein Dummy-Text stehen.
          </Typography>

          {/* kleiner "Pfeil" der Blase */}
          <Box
            sx={{
              position: "absolute",
              left: -10,
              top: 20,
              width: 0,
              height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderRight: "10px solid #ccc",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -8,
              top: 20,
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: "8px solid #f5f5f5",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
