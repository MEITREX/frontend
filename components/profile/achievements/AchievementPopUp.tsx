import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface AchievementPopUpProps {
  open: boolean;
  onClose: () => void;
  selectedAchievement: any;
}

export default function AchievementPopUp({
  open,
  onClose,
  selectedAchievement,
}: AchievementPopUpProps) {
  const courses = [
    { id: "all", name: "All" },
    { id: "course1", name: "Physics 202" },
    { id: "course2", name: "Informatik" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: selectedAchievement?.achieved
            ? "2px solid gold"
            : "2px solid transparent",
          borderRadius: 2,
          p: 2,
          backgroundColor: "white",
          boxShadow: selectedAchievement?.achieved
            ? "0 0 10px 2px rgba(255, 215, 0, 0.6)"
            : "none",
        },
      }}
    >
      <DialogTitle textAlign="center">{selectedAchievement?.title}</DialogTitle>

      <DialogContent>
        <Box textAlign="center" py={3}>
          <Box fontSize={60}>{selectedAchievement?.icon}</Box>

          <Typography mt={2} variant="body1">
            {selectedAchievement?.description}
          </Typography>

          <Typography mt={2} color="textSecondary">
            <strong>Completed:</strong>{" "}
            {selectedAchievement?.achievedAt
              ? new Date(selectedAchievement.achievedAt).toLocaleString()
              : "Not yet completed"}
          </Typography>

          <Typography mt={1} color="textSecondary">
            <strong>Course:</strong>{" "}
            {courses.find((c) => c.id === selectedAchievement?.courseId)
              ?.name ?? selectedAchievement?.courseId}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" mt={2}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
