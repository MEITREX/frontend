"use client";

import LecturerUmlAssignment from "@/app/courses/[courseId]/uml/[umlId]/lecturer";
import StudentUMLAssignment from "@/app/courses/[courseId]/uml/[umlId]/student";
import { PageError } from "@/components/PageError";
import { PageView, usePageView } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { Container } from "@mui/material";
import { useParams } from "next/navigation";

export default function UMLAssignmentPage() {
  const [pageView] = usePageView();
  const { umlId } = useParams();

  if (!isUUID(umlId)) {
    return <PageError message="Invalid UML assessment id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentUMLAssignment />;

    case PageView.Lecturer:
      return (
        <Container maxWidth={false} sx={{ py: 2 }}>
          <LecturerUmlAssignment />
        </Container>
      );

    default:
      return <PageError message="Unauthorized or unknown view state." />;
  }
}