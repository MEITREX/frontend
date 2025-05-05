"use client";

import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { GitHub } from "@mui/icons-material";
import { useRef, useState } from "react";
import { useAccessTokenCheck } from "@/components/useAccessTokenCheck";
import { ProviderAuthorizationDialog } from "@/components/ProviderAuthorizationDialog";
import {
  codeAssessmentProvider,
  providerConfig,
} from "@/components/ProviderConfig";
import { CodeAssessmentProviderCourseButtonSyncAssignmentsMutation } from "@/__generated__/CodeAssessmentProviderCourseButtonSyncAssignmentsMutation.graphql";
import { graphql, useMutation } from "react-relay";
import toast from "react-hot-toast";

type Props = {
  externalCourse: {
    courseTitle: string;
    url: string;
  } | null;
};

export function CodeAssessmentProviderCourseButton({ externalCourse }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const checkAccessToken = useAccessTokenCheck();
  const provider = providerConfig[codeAssessmentProvider];
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [syncAssignments, isSyncing] =
    useMutation<CodeAssessmentProviderCourseButtonSyncAssignmentsMutation>(graphql`
      mutation CodeAssessmentProviderCourseButtonSyncAssignmentsMutation(
        $courseTitle: String!
      ) {
        syncAssignmentsForCourse(courseTitle: $courseTitle)
      }
    `);

  const handleClick = async () => {
    const isAvailable = await checkAccessToken();

    if (!isAvailable) {
      setShowProviderDialog(true);
      return;
    }

    if (!externalCourse?.url) {
      setAuthDialogOpen(true);
      return;
    }

    if (buttonRef.current) {
      setAnchorEl(buttonRef.current);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSync = async () => {
    if (!externalCourse) return;

    syncAssignments({
      variables: { courseTitle: externalCourse.courseTitle },
      onCompleted: (res) => {
        handleMenuClose();
        if (!res.syncAssignmentsForCourse) {
          toast.error(`${provider.name} sync failed.`);
          return;
        }
        toast.success(`${provider.name}  synced successfully.`);
      },
      onError: (err) => {
        console.error(err);
        handleMenuClose();
        toast.error("Sync failed.");
      },
    });
  };

  return (
    <>
      {showProviderDialog && (
        <ProviderAuthorizationDialog
          onClose={() => setShowProviderDialog(false)}
          onAuthorize={() => {
            setShowProviderDialog(false);
          }}
          alertMessage={`You must authorize via ${provider.name} to use this button.`}
          _provider={codeAssessmentProvider}
        />
      )}

      <Button
        ref={buttonRef}
        id="github-classroom-button"
        //   sx={{ color: "text.secondary" }}
        startIcon={<GitHub />}
        onClick={handleClick}
        disabled={isSyncing}
      >
        GitHub Classroom
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !isSyncing}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "github-classroom-button",
        }}
      >
        <MenuItem
          onClick={() => {
            window.open(externalCourse?.url, "_blank");
            handleMenuClose();
          }}
        >
          Course page
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(`${externalCourse?.url}/new_assignments/new`, "_blank");
            handleMenuClose();
          }}
        >
          Create assignment
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleSync();
          }}
        >
          Sync assignments
        </MenuItem>
      </Menu>

      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)}>
        <DialogTitle>{provider.name} Action Required</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            You must ensure a matching course exists on GitHub Classroom.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log(externalCourse?.url);
              setAuthDialogOpen(false);
              window.open("https://classroom.github.com/classrooms", "_blank");
            }}
            color="primary"
          >
            Go to {provider.name}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
