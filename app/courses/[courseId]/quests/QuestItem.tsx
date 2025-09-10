import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import coins from "assets/lottery/coins.png";
import Image from "next/image";
import { useState } from "react";

type Quest = {
  completed: boolean;
  completedCount: number | null;
  courseId: string;
  description: string;
  id: string;
  name: string;
  requiredCount: number | null;
  rewardPoints: number;
  trackingEndTime: string | null;
  trackingStartTime: string | null;
  userId: string;
};

type QuestProps = Quest & {
  onOpen: (q: Quest) => void;
  streak: number;
};

const PROGRESS_BLOCK_HEIGHT = 48; // feinjustierbar (44–56 je nach Typo)

function QuestItem({
  name,
  description,
  rewardPoints,
  completed,
  completedCount,
  requiredCount,
  courseId,
  id,
  trackingStartTime,
  trackingEndTime,
  userId,
  onOpen,
  streak,
}: QuestProps) {
  let percent = -1;

  if (requiredCount && completedCount) {
    const safeRequired = Math.max(1, requiredCount);
    const ratio = Math.min(completedCount / safeRequired, 1);
    percent = Math.round(ratio * 100);
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpen({
          name,
          description,
          rewardPoints,
          completed,
          completedCount,
          requiredCount,
          courseId,
          id,
          trackingEndTime,
          trackingStartTime,
          userId,
        })
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onOpen({
            name,
            description,
            rewardPoints,
            completed,
            completedCount,
            requiredCount,
            courseId,
            id,
            trackingEndTime,
            trackingStartTime,
            userId,
          });
        }
      }}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        px: 2.5,
        py: 1.75,
        borderRadius: 4,
        border: `3px solid ${completed ? "#1aa80e" : "#009bde"}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,245,245,0.96))",
        transition: "max-height 0.3s ease", // sanftes Aufklappen
        maxHeight: 160, // Platz für 2 Zeilen + Rest
        overflow: "hidden",
        // Aufklappen bei Hover ODER Tastaturfokus
        "&:hover, &:focus-within": {
          maxHeight: 400,
        },
        // Beim Aufklappen: Clamp der Beschreibung entfernen
        "&:hover .quest-desc, &:focus-within .quest-desc": {
          WebkitLineClamp: "unset",
          display: "block",
          whiteSpace: "normal",
        },
      }}
    >
      {/* Top Row: Titel/Description + Chip */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
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
            title={name}
          >
            {name}
          </Typography>

          <Typography
            className="quest-desc"
            variant="body2"
            sx={{
              color: "text.secondary",
              opacity: completed ? 0.4 : 0.85,
              fontSize: "0.85rem",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              minHeight: "1.2em",
              lineHeight: 1.2,
              transition: "all 0.3s ease",
            }}
            title={description}
          >
            {description}
          </Typography>
        </Box>

        <Chip
          color={completed ? "primary" : "secondary"}
          label={
            <Box
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
            >
              {completed ? "Completed" : rewardPoints}
              {!completed && (
                <Image src={coins} alt="Coins" width={18} height={18} />
              )}
            </Box>
          }
          sx={{ fontWeight: "bold" }}
        />

        {!completed && (
          <Tooltip title="Reward multiplier">
            <Chip
              label={`x${streak ?? 1}`} // dynamisch oder fallback x3
              sx={{
                fontWeight: "bold",
                backgroundColor: "#009bde",
                color: "white",
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Bottom Row: Progress-Bar */}
      <Box sx={{ minHeight: PROGRESS_BLOCK_HEIGHT }}>
        {percent >= 0 ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
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
        ) : (
          // Leerplatz, um Höhe zu reservieren
          <Box sx={{ height: PROGRESS_BLOCK_HEIGHT }} />
        )}
      </Box>
    </Box>
  );
}

function QuestDialog({
  open,
  onClose,
  quest,
  streak,
}: {
  open: boolean;
  onClose: () => void;
  quest: Quest | null;
  streak: number;
}) {
  if (!quest) return null;

  let percent = -1;

  if (quest.requiredCount && quest.completedCount) {
    const safeRequired = Math.max(1, quest.requiredCount);
    const ratio = Math.min(quest.completedCount / safeRequired, 1);
    percent = Math.round(ratio * 100);
  }

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

        <Typography
          variant="h4"
          sx={{ fontWeight: 800, textAlign: "center", mb: 3 }}
        >
          {quest.name}
        </Typography>

        <Typography sx={{ color: "text.primary", textAlign: "left", mb: 4 }}>
          {quest.description}
        </Typography>

        {percent >= 0 && (
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
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Chip
            color={quest.completed ? "primary" : "secondary"}
            label={
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
              >
                {quest.completed ? "Completed" : quest.rewardPoints}
                {!quest.completed && (
                  <Image src={coins} alt="Coins" width={18} height={18} />
                )}
              </Box>
            }
            sx={{ fontWeight: "bold", mr: 1 }}
          />

          {!quest.completed && (
            <Tooltip title="Reward multiplier">
              <Chip
                label={`x${streak ?? 1}`} // dynamisch oder fallback x3
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#009bde",
                  color: "white",
                }}
              />
            </Tooltip>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function QuestList({
  questsProp,
  streak,
}: {
  questsProp: ReadonlyArray<Quest>;
  streak: number;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Quest | null>(null);

  const openDialog = (q: Quest) => {
    setSelected(q);
    setOpen(true);
  };



  return (
    <Box sx={{ mx: "auto" }}>
      {/* Header: unten bündig */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Daily Quests
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", pb: 0.5 /* Feintuning falls nötig */ }}
        >
          Finish the quests below to earn additional Dino Points.{" "}
          <strong>Careful:</strong> Quests are only temporarily available!
        </Typography>
      </Box>

      {/* Grid: aus Daten-Array gerendert */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {questsProp.map((q) => (
            <Grid key={q.name} item xs={12} sm={4}>
              <QuestItem {...q} onOpen={openDialog} streak={streak} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <QuestDialog
        open={open}
        onClose={() => setOpen(false)}
        quest={selected}
        streak={streak}
      />
    </Box>
  );
}
