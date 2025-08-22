import { AchievementPopUpCourseNamesPopUpQuery } from "@/__generated__/AchievementPopUpCourseNamesPopUpQuery.graphql";
import AchievementParser from "@/components/AchievementParser";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import { Achievement } from "./types";

interface AchievementPopUpProps {
  open: boolean;
  onClose: () => void;
  selectedAchievement: Achievement | null;
}

export default function AchievementPopUp({
  open,
  onClose,
  selectedAchievement,
}: AchievementPopUpProps) {
  const CourseNameQuery = ({ courseId }: { courseId: string }) => {
    const { coursesByIds } =
      useLazyLoadQuery<AchievementPopUpCourseNamesPopUpQuery>(
        graphql`
          query AchievementPopUpCourseNamesPopUpQuery($id: [UUID!]!) {
            coursesByIds(ids: $id) {
              id
              title
            }
          }
        `,
        { id: [courseId] }
      );

    return (
      <div>
        <strong>Course:</strong> {coursesByIds[0]?.title}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: selectedAchievement?.completed
            ? "2px solid gold"
            : "2px solid transparent",
          borderRadius: 2,
          p: 2,
          backgroundColor: "white",
          boxShadow: selectedAchievement?.completed
            ? "0 0 10px 2px rgba(255, 215, 0, 0.6)"
            : "none",
        },
      }}
    >
      <DialogTitle textAlign="center">{selectedAchievement?.name}</DialogTitle>

      <DialogContent>
        <Box textAlign="center" py={3}>
          <Box
            component="img"
            src={
              AchievementParser(
                selectedAchievement ? selectedAchievement.name : "none"
              ) ?? undefined
            }
            alt={"Test"}
            sx={{
              width: 250,
              height: 250,
              objectFit: "cover",
              opacity: selectedAchievement?.completed ? 1 : 0.4,
              borderRadius: 2,
              mx: "auto",
            }}
          />

          <Typography mt={2} variant="body1">
            {selectedAchievement?.description}
          </Typography>

          <Typography mt={2} color="textSecondary">
            <strong>Completed:</strong>{" "}
            {selectedAchievement?.trackingEndTime
              ? new Date(selectedAchievement.trackingEndTime).toLocaleString()
              : "Not yet completed"}
          </Typography>

          <Typography mt={1} color="textSecondary">
            {selectedAchievement?.courseId && (
              <CourseNameQuery courseId={selectedAchievement.courseId} />
            )}
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
