import { Box, Chip, Typography } from "@mui/material";
import coins from "assets/lottery/coins.png";
import Image from "next/image";

type QuestProps = {
  title: string;
  reward: number;
  completed: boolean;
};

function QuestItem({ title, reward, completed }: QuestProps) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderRadius: 14,
        // Doppelrahmen-Optik
        border: `3px solid ${completed ? "#1aa80e" : "#009bde"}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,245,245,0.96))",
        // 3D: Drop-Shadow + leichtes „Kissen“
        cursor: "cursor",
      }}
    >
      <Typography sx={{ fontWeight: 600, letterSpacing: 0.2,  opacity: completed ? 0.5 : 1, }}>
        {title}
      </Typography>
      <Chip
            color={completed ? "primary" : "secondary"}
            label={
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                {completed ? "Completed" : reward}
                {completed ? "" : <Image src={coins} alt="Coins" width={18} height={18} />}
              </Box>
            }
            sx={{ fontWeight: "bold" }}
          />


      {/* innerer Rahmen wie in deiner Skizze */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 6,

        }}
      />
    </Box>
  );
}

export default function QuestList() {
  return (
     <Box sx={{ mx: "auto" }}>
    {/* Überschrift */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mb: 0.5, textAlign: "center" }}
      >
        Tägliche Quests
      </Typography>

      {/* Untertitel */}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 2.5,
          textAlign: "center",
          maxWidth: 400,
          mx: "auto",
        }}
      >
        Schließe diese Quests ab, um Dino Points zu verdienen.
        <br />
        <strong>Achtung:</strong> Quests sind zeitlich begrenzt!
      </Typography>

    <Box
      sx={{
        border: "0px solid #009bde",
        borderRadius: 3,
        p: 2,
        gap: 2,
        display: "flex",
        flexDirection: "column",
        // leichter Innen-3D-Rahmen
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.8)",
      }}
    >
      <QuestItem title="Quest 1" reward={300} completed={false} />
      <QuestItem title="Quest 2" reward={300} completed={false} />
      <QuestItem title="Quest 3" reward={300} completed={true} />
    </Box>
    </Box>
  );
}