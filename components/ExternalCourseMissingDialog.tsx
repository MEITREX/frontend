"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

export function ExternalCourseMissingDialog({
  onClose,
  providerName,
}: {
  onClose: () => void;
  providerName: string;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{providerName} Course Setup Required</DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You must ensure a matching course exists on {providerName} Classroom.
        </Alert>

        <Typography variant="subtitle1" gutterBottom>
          Steps to set up a classroom:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="1. Choose or create a GitHub organization"
              secondary="This is where your classroom will be hosted."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Name the classroom exactly as the MEITREX course"
              secondary="Ensure the names match to allow synchronization."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Invite tutors or admins via the given classroom link"
              secondary="Without this, they won’t be able to access student grades on MEITREX."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Do not add students to roster manually"
              secondary="Students will be enrolled automatically via MEITREX."
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="5. After creating the classroom refresh this page to continue setup." />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          Please refer to the{" "}
          <Link
            href="https://meitrex.readthedocs.io/en/latest/user-manuals/LecturerGuide.html#a-code-assignment"
            target="_blank"
            rel="noopener"
            underline="hover"
          >
            official documentation
          </Link>{" "}
          before creating a code assignment to ensure everything is configured
          correctly.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          onClick={() =>
            window.open("https://classroom.github.com/classrooms", "_blank")
          }
        >
          Go to {providerName}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
