"use client";

import { CodeAssessmentProviderCourseButtonGetExternalCourseQuery } from "@/__generated__/CodeAssessmentProviderCourseButtonGetExternalCourseQuery.graphql";
import { ProviderAuthorizationDialog } from "@/components/ProviderAuthorizationDialog";
import {
  codeAssessmentProvider,
  providerConfig,
} from "@/components/ProviderConfig";
import { useAccessTokenCheck } from "@/components/useAccessTokenCheck";
import { GitHub } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { useRef, useState } from "react";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import { ExternalCourseMissingDialog } from "./ExternalCourseMissingDialog";

type Props = { courseId: string };

const GetExternalCourseQuery = graphql`
  query CodeAssessmentProviderCourseButtonGetExternalCourseQuery(
    $courseId: UUID!
  ) {
    getExternalCourse(courseId: $courseId) {
      url
      courseTitle
    }
  }
`;

export function CodeAssessmentProviderCourseButton({ courseId }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [externalCourseUrl, setExternalCourseUrl] = useState<string | null>(
    null
  );

  const provider = providerConfig[codeAssessmentProvider];
  const checkAccessToken = useAccessTokenCheck();
  const env = useRelayEnvironment();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    const isAccessTokenAvailable = await checkAccessToken();
    if (!isAccessTokenAvailable) {
      setShowAuthDialog(true);
      return;
    }

    const data =
      await fetchQuery<CodeAssessmentProviderCourseButtonGetExternalCourseQuery>(
        env,
        GetExternalCourseQuery,
        { courseId }
      ).toPromise();

    const url = data?.getExternalCourse?.url ?? null;

    if (!url) {
      setShowMissingDialog(true);
      return;
    }

    setExternalCourseUrl(url);
    if (buttonRef.current) {
      setAnchorEl(buttonRef.current);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {showAuthDialog && (
        <ProviderAuthorizationDialog
          onClose={() => setShowAuthDialog(false)}
          onAuthorize={() => setShowAuthDialog(false)}
          alertMessage={`You must authorize via ${provider.name} to use this button.`}
          _provider={codeAssessmentProvider}
        />
      )}

      {showMissingDialog && (
        <ExternalCourseMissingDialog
          onClose={() => setShowMissingDialog(false)}
          providerName={provider.name}
        />
      )}

      <Button
        ref={buttonRef}
        id="github-classroom-button"
        startIcon={<GitHub />}
        onClick={handleClick}
        type="button"
      >
        GitHub Classroom
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && Boolean(externalCourseUrl)}
        onClose={handleCloseMenu}
        MenuListProps={{ "aria-labelledby": "github-classroom-button" }}
      >
        <MenuItem
          onClick={() => {
            window.open(externalCourseUrl!, "_blank", "noopener,noreferrer");
            handleCloseMenu();
          }}
        >
          Course page
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(
              `${externalCourseUrl!}/new_assignments/new`,
              "_blank",
              "noopener,noreferrer"
            );
            handleCloseMenu();
          }}
        >
          Create assignment
        </MenuItem>
      </Menu>
    </>
  );
}
