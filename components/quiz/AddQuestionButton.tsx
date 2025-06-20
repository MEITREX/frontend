import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
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
import { PreloadedQuery } from "react-relay";
import { AddAssociationQuestionModal } from "./AddAssociationQuestionModal";
import { AddClozeQuestionModal } from "./AddClozeQuestionModal";
import { AddMultipleChoiceQuestionModal } from "./AddMultipleChoiceQuestionModal";

export function AddQuestionButton({
  _allRecords,
  allSkillsQueryRef,
  assessmentId,
  courseId,
}: {
  _allRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
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

      {addMultipleChoice && (
        <AddMultipleChoiceQuestionModal
          _allRecords={_allRecords}
          open={addMultipleChoice}
          onClose={() => setAddMultipleChoice(false)}
          allSkillsQueryRef={allSkillsQueryRef}
        />
      )}
      {addCloze && (
        <AddClozeQuestionModal
          _allRecords={_allRecords}
          open={addCloze}
          onClose={() => setAddCloze(false)}
          allSkillsQueryRef={allSkillsQueryRef}
        />
      )}
      {addAssociation && (
        <AddAssociationQuestionModal
          _allRecords={_allRecords}
          open={addAssociation}
          onClose={() => setAddAssociation(false)}
          allSkillsQueryRef={allSkillsQueryRef}
        />
      )}
    </>
  );
}
