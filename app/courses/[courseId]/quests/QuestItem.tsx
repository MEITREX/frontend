import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import coins from "assets/lottery/coins.png";
import Image from "next/image";
import { useState } from "react";

type Quest = {
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  completedCount: number;
  requiredCount: number;
};

type QuestProps = Quest & {
  onOpen: (q: Quest) => void;
};

function QuestItem({
  title,
  description,
  reward,
  completed,
  completedCount,
  requiredCount,
  onOpen,
}: QuestProps) {
  const safeRequired = Math.max(1, requiredCount); // Schutz gegen 0
  const ratio = Math.min(completedCount / safeRequired, 1);
  const percent = Math.round(ratio * 100);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpen({
          title,
          description,
          reward,
          completed,
          completedCount,
          requiredCount,
        })
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          onOpen({
            title,
            description,
            reward,
            completed,
            completedCount,
            requiredCount,
          });
      }}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderRadius: 4,
        border: `3px solid ${completed ? "#1aa80e" : "#009bde"}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,245,245,0.96))",
      }}
    >
      {/* Linke Spalte: Titel, Beschreibung, Progress */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontWeight: 600,
            letterSpacing: 0.2,
            opacity: completed ? 0.5 : 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={title}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            opacity: completed ? 0.4 : 0.85,
            fontSize: "0.85rem",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
          title={description}
        >
          {description}
        </Typography>

        {/* Progress-Zeile */}
        <Box sx={{ mt: 1.25 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 0.5,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Fortschritt
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              {completedCount}/{requiredCount}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={percent}
            aria-label={`${percent}% abgeschlossen`}
            sx={{
              height: 10,
              borderRadius: 6,
              backgroundColor: "#e9eef3",
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                backgroundColor: completed ? "#1aa80e" : "#009bde",
              },
            }}
          />
        </Box>
      </Box>

      {/* Rechte Spalte: Reward */}
      <Chip
        color={completed ? "primary" : "secondary"}
        label={
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
            {completed ? "Completed" : reward}
            {completed ? null : (
              <Image src={coins} alt="Coins" width={18} height={18} />
            )}
          </Box>
        }
        sx={{ fontWeight: "bold", alignSelf: "flex-start" }}
      />
    </Box>
  );
}

function QuestDialog({
  open,
  onClose,
  quest,
}: {
  open: boolean;
  onClose: () => void;
  quest: Quest | null;
}) {
  if (!quest) return null;

  const safeRequired = Math.max(1, quest.requiredCount);
  const ratio = Math.min(quest.completedCount / safeRequired, 1);
  const percent = Math.round(ratio * 100);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent
        sx={{
          p: { xs: 3, sm: 5 },
          m: 1.5,
          position: "relative",
          background: "linear-gradient(180deg,#fff,#f7f7f7)",
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, textAlign: "center", mb: 3 }}
        >
          {quest.title}
        </Typography>

        {/* Description */}
        <Typography sx={{ color: "text.primary", textAlign: "left", mb: 4 }}>
          {quest.description}
        </Typography>

        {/* Progress label + bar */}
        <Box sx={{ mb: 5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.75,
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {quest.completedCount} / {quest.requiredCount}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 8,
              borderRadius: 6,
              backgroundColor: "#e9eef3",
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                backgroundColor: quest.completed ? "#1aa80e" : "#009bde",
              },
            }}
          />
        </Box>

        {/* Reward Box */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Chip
            color={quest.completed ? "primary" : "secondary"}
            label={
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                {quest.completed ? "Completed" : quest.reward}
                {!quest.completed && (
                  <Image src={coins} alt="Coins" width={18} height={18} />
                )}
              </Box>
            }
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function QuestList({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Quest | null>(null);

  const openDialog = (q: Quest) => {
    setSelected(q);
    setOpen(true);
  };

  return (
    <Box sx={{ mx: "auto" }}>
      <Typography
  variant="h4"
  sx={{ fontWeight: 800, mb: 0.5, textAlign: "center" }}
>
  Daily Quests
</Typography>

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
  Finish the quests below to earn additional Dino Points.
  <br />
  <strong>Careful:</strong> Quests are only temporarily available!
</Typography>

{/* Grid für 3 Spalten */}
<Box sx={{ p: 2 }}>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={4}>
      <QuestItem
        title="Gewinne ein Match"
        description="Gewinne ein beliebiges Match im DinoBattle."
        reward={300}
        completed={false}
        completedCount={1}
        requiredCount={3}
        onOpen={openDialog}
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <QuestItem
        title="Sammle Beeren"
        description="Sammle 10 Beeren im Abenteuer-Modus."
        reward={300}
        completed={false}
        completedCount={7}
        requiredCount={10}
        onOpen={openDialog}
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <QuestItem
        title="Login-Serie"
        description="Logge dich 3 Tage in Folge ein."
        reward={300}
        completed
        completedCount={3}
        requiredCount={3}
        onOpen={openDialog}
      />
    </Grid>
  </Grid>
</Box>


      <QuestDialog
        open={open}
        onClose={() => setOpen(false)}
        quest={selected}
      />
    </Box>
  );
}
