import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  Add,
  List as ListIcon,
  Shuffle,
  TextFields,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { AddClozeQuestionModal } from "./AddClozeQuestionModal";
import { AddMultipleChoiceQuestionModal } from "./AddMultipleChoiceQuestionModal";
import { AddAssociationQuestionModal } from "./AddAssociationQuestionModal";

export function AddQuestionButton({
  _allRecords,
  assessmentId,
  courseId,
}: {
  _allRecords: MediaRecordSelector$key;
  assessmentId: string;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [addMultipleChoice, setAddMultipleChoice] = useState(false);
  const [addCloze, setAddCloze] = useState(false);
  const [addAssociation, setAddAssociation] = useState(false);

  return (
    <>
      <Button startIcon={<Add />} onClick={() => setOpen(true)}>
        Add question
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Choose question type</DialogTitle>
        <List sx={{ paddingTop: 0 }}>
          <ListItemButton
            onClick={() => {
              setAddMultipleChoice(true);
              setOpen(false);
            }}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Add multiple choice question" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              setAddCloze(true);
              setOpen(false);
            }}
          >
            <ListItemIcon>
              <TextFields />
            </ListItemIcon>
            <ListItemText primary="Add cloze question" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              setAddAssociation(true);
              setOpen(false);
            }}
          >
            <ListItemIcon>
              <Shuffle />
            </ListItemIcon>
            <ListItemText primary="Add association question" />
          </ListItemButton>
        </List>
      </Dialog>
      <AddMultipleChoiceQuestionModal
        _allRecords={_allRecords}
        assessmentId={assessmentId}
        courseId={courseId}
        open={addMultipleChoice}
        onClose={() => setAddMultipleChoice(false)}
      />
      <AddClozeQuestionModal
        _allRecords={_allRecords}
        assessmentId={assessmentId}
        courseId={courseId}
        open={addCloze}
        onClose={() => setAddCloze(false)}
      />
      <AddAssociationQuestionModal
        _allRecords={_allRecords}
        assessmentId={assessmentId}
        courseId={courseId}
        open={addAssociation}
        onClose={() => setAddAssociation(false)}
      />
    </>
  );
}
