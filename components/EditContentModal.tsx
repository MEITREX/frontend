"use client";
import { EditContentModalFragment$key } from "@/__generated__/EditContentModalFragment.graphql";
import { EditContentModalUpdateStageMutation } from "@/__generated__/EditContentModalUpdateStageMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { AddFlashcardSetModal } from "@/components/AddFlashcardSetModal";
import { AddUMLAssignmentModal } from "@/components/uml-assignment/AddUMLAssignmentModal";
import {
  Add,
  Edit,
  EditNote,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { graphql, useFragment, useMutation, useQueryLoader } from "react-relay";
import { AddCodeAssignmentModal } from "./AddCodeAssignmentModal";
import { MediaContentModal } from "./MediaContentModal";
import { QuizModal } from "./QuizModal";
import { SubmissionExerciseModal } from "./SubmissionExerciseModal";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  FlashcardSetAssessment: "Flashcards",
  MediaContent: "Media",
  QuizAssessment: "Quizzes",
  SubmissionAssessment: "Submissions",
  UmlAssessment: "UML Assignments",
  AssignmentAssessment: "Code Assignments",
};

export function EditContentModal({
  chapterId,
  stageId,
  sectionId,
  _chapter,
  _mediaRecords,
  optionalRecords: _optionalRecords,
  requiredRecords: _requiredRecords,
  courseId,
  autoOpen = false,
  onClose,
}: {
  chapterId: string;
  sectionId: string;
  stageId: string;
  _mediaRecords: MediaRecordSelector$key;
  _chapter: EditContentModalFragment$key;
  optionalRecords: string[];
  requiredRecords: string[];
  courseId: string;
  autoOpen?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [openUML, setOpenUML] = useState(false);
  const [openMedia, setOpenMedia] = useState(false);
  const [openFlash, setOpenFlash] = useState(false);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [openCode, setOpenCode] = useState(false);
  const [openSub, setOpenSub] = useState(false);

  const [openModal, setOpenModal] = useState(autoOpen);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hideAssigned, setHideAssigned] = useState(false);

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const [allSkillsQueryRef, loadAllSkillsQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(AllSkillQuery);

  const chapter = useFragment(
    graphql`
      fragment EditContentModalFragment on Chapter {
        ...AddFlashcardSetModalFragment
        sections {
          id
          stages {
            id
            optionalContents {
              id
            }
            requiredContents {
              id
            }
          }
        }
        contents {
          id
          __typename
          metadata {
            name
          }
          ... on AssignmentAssessment {
            assignment {
              assignmentType
            }
          }
        }
        contentsWithNoSection {
          id
        }
      }
    `,
    _chapter
  );

  const [optionalRecords, setOptionalRecords] = useState(_optionalRecords);
  const [requiredRecords, setRequiredRecords] = useState(_requiredRecords);

  const [updateStage, loading] =
    useMutation<EditContentModalUpdateStageMutation>(graphql`
      mutation EditContentModalUpdateStageMutation(
        $stage: UpdateStageInput!
        $sectionId: UUID!
      ) {
        mutateSection(sectionId: $sectionId) {
          updateStage(input: $stage) {
            id
            ...LecturerSectionStageFragment
          }
        }
      }
    `);

  const groupedContents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    chapter.contents.forEach((content: any) => {
      const isAssigned =
        optionalRecords.includes(content.id) ||
        requiredRecords.includes(content.id);
      if (hideAssigned && isAssigned) return;

      const type = content.__typename;
      if (!groups[type]) groups[type] = [];
      groups[type].push(content);
    });
    return groups;
  }, [chapter.contents, optionalRecords, requiredRecords, hideAssigned]);

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleContent = (id: string, isCurrentlySelected: boolean) => {
    if (isCurrentlySelected) {
      setOptionalRecords(optionalRecords.filter((x: string) => x !== id));
      setRequiredRecords(requiredRecords.filter((x: string) => x !== id));
    } else {
      setRequiredRecords([...requiredRecords, id]);
    }
  };

  const getEditPath = (content: any) => {
    switch (content.__typename) {
      case "FlashcardSetAssessment":
        return `/courses/${courseId}/flashcards/${content.id}`;
      case "SubmissionAssessment":
        return `/courses/${courseId}/submissions/${content.id}`;
      case "MediaContent":
        return `/courses/${courseId}/media/${content.id}`;
      case "QuizAssessment":
        return `/courses/${courseId}/quiz/${content.id}`;
      case "UmlAssessment":
        return `/courses/${courseId}/uml/${content.id}`;
      case "AssignmentAssessment":
        return content.assignment?.assignmentType === "CODE_ASSIGNMENT"
          ? `/courses/${courseId}/assignment/${content.id}`
          : "";
      default:
        return "";
    }
  };

  const handleActionMenuClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleActionMenuClose = () => setAnchorEl(null);

  const submit = () => {
    updateStage({
      variables: {
        sectionId,
        stage: {
          id: stageId,
          requiredContents: requiredRecords,
          optionalContents: optionalRecords,
        },
      },
      onCompleted: () => setOpenModal(false),
    });
  };

  return (
    <>
      <Button startIcon={<EditNote />} onClick={() => setOpenModal(true)}>
        Edit content
      </Button>

      <Dialog
        maxWidth="md"
        fullWidth
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight="bold">
              Select Content
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={hideAssigned}
                  onChange={(e) => setHideAssigned(e.target.checked)}
                />
              }
              label={<Typography variant="body1">Hide selected</Typography>}
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {Object.entries(groupedContents).map(([type, items]) => {
            const isCollapsed = !!collapsedGroups[type];
            return (
              <Box
                key={type}
                sx={{ borderBottom: "1px solid", borderColor: "divider" }}
              >
                <Box
                  onClick={() => toggleGroup(type)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    bgcolor: "action.hover",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      flexGrow: 1,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {CONTENT_TYPE_LABELS[type] || type} ({items.length})
                  </Typography>
                  {isCollapsed ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                </Box>

                {!isCollapsed && (
                  <List disablePadding>
                    {items.map((content) => {
                      const optional = optionalRecords.includes(content.id);
                      const required = requiredRecords.includes(content.id);
                      const isSelected = optional || required;

                      return (
                        <ListItem
                          key={content.id}
                          divider
                          secondaryAction={
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              {isSelected && (
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      checked={required}
                                      onChange={() => {
                                        if (required) {
                                          setRequiredRecords(
                                            requiredRecords.filter(
                                              (x: string) => x !== content.id
                                            )
                                          );
                                          setOptionalRecords([
                                            ...optionalRecords,
                                            content.id,
                                          ]);
                                        } else {
                                          setOptionalRecords(
                                            optionalRecords.filter(
                                              (x: string) => x !== content.id
                                            )
                                          );
                                          setRequiredRecords([
                                            ...requiredRecords,
                                            content.id,
                                          ]);
                                        }
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      {required ? "Required" : "Optional"}
                                    </Typography>
                                  }
                                />
                              )}
                              <IconButton
                                onClick={() =>
                                  router.push(getEditPath(content))
                                }
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Stack>
                          }
                        >
                          <ListItemButton
                            onClick={() =>
                              toggleContent(content.id, isSelected)
                            }
                            sx={{ py: 0.5 }}
                          >
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={isSelected}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={content.metadata.name}
                              primaryTypographyProps={{ variant: "body1" }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            );
          })}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", p: 2 }}>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Add />}
              endIcon={<KeyboardArrowDown />}
              onClick={handleActionMenuClick}
            >
              Create New...
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleActionMenuClose}
            >
              <MenuItem
                onClick={() => {
                  setOpenFlash(true);
                  handleActionMenuClose();
                }}
              >
                Flashcards
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenMedia(true);
                  handleActionMenuClose();
                }}
              >
                Media
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenQuiz(true);
                  handleActionMenuClose();
                }}
              >
                Quiz
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (!allSkillsQueryRef) loadAllSkillsQuery({ courseId });
                  setOpenCode(true);
                  handleActionMenuClose();
                }}
              >
                Code Assignment
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenSub(true);
                  handleActionMenuClose();
                }}
              >
                Submission Exercise
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setOpenUML(true);
                  handleActionMenuClose();
                }}
              >
                UML Assignment
              </MenuItem>
            </Menu>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              Cancel
            </Button>
            <LoadingButton
              loading={loading}
              variant="contained"
              onClick={submit}
            >
              Save Changes
            </LoadingButton>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Modals for creation */}
      <MediaContentModal
        chapterId={chapterId}
        isOpen={openMedia}
        onClose={() => setOpenMedia(false)}
        _mediaRecords={_mediaRecords}
      />
      <QuizModal
        isOpen={openQuiz}
        onClose={() => setOpenQuiz(false)}
        chapterId={chapterId}
        _existingQuiz={null}
      />
      {openFlash && (
        <AddFlashcardSetModal
          onClose={() => setOpenFlash(false)}
          _chapter={chapter}
        />
      )}
      {openCode && allSkillsQueryRef && (
        <AddCodeAssignmentModal
          onClose={() => setOpenCode(false)}
          chapterId={chapterId}
          courseId={courseId}
          allSkillsQueryRef={allSkillsQueryRef}
        />
      )}
      <SubmissionExerciseModal
        isOpen={openSub}
        onClose={() => setOpenSub(false)}
        chapterId={chapterId}
        _existingSubmission={null}
        tasks={[]}
      />
      {openUML && (
        <AddUMLAssignmentModal
          chapterId={chapterId}
          open={openUML}
          onClose={() => setOpenUML(false)}
        />
      )}
    </>
  );
}