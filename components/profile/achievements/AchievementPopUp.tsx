import { AllAchievementsCourseNamesQuery } from "@/__generated__/AllAchievementsCourseNamesQuery.graphql";
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
    const { coursesByIds } = useLazyLoadQuery<AllAchievementsCourseNamesQuery>(
      graphql`
      query AllAchievementsCourseNamesQuery($id: [UUID!]!) {
        coursesByIds(ids: $id) {
          id
          title
        }
      }
    `,
      { id: [courseId] }
    );

    return <div><strong>Course:</strong>{" "} {coursesByIds[0]?.title}</div>;
  };


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
          <Box fontSize={60}>{selectedAchievement?.imageUrl}</Box>

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
