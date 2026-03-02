import { graphql } from "react-relay";

export const umlApiCreateAssessmentMutation = graphql`
  mutation UmlApiCreateAssessmentMutation(
    $assessmentInput: CreateAssessmentInput!,
    $createUmlExerciseInput: CreateUmlExerciseInput!
  ) {
    createUMLAssessment(
      assessmentInput: $assessmentInput,
      createUmlExerciseInput: $createUmlExerciseInput
    ) {
      id
      __typename
      metadata {
        name
        rewardPoints
        suggestedDate
        chapterId
        tagNames
      }
    }
  }
`;

export const umlApiGetUmlExerciseByAssessmentIdQuery = graphql`
  query UmlApiGetUmlExerciseByAssessmentIdQuery($assessmentId: UUID!) {
    getUmlExerciseByAssessmentId(assessmentId: $assessmentId) {
      ... on UmlExercise {
        id
        description
        totalPoints
        tutorSolution {
          diagramCode
          semanticModel
        }
      }
    }
  }
`;

export const umlApiSubmitStudentSolutionMutation = graphql`
  mutation UmlApiSubmitStudentSolutionMutation(
    $assessmentId: UUID!
    $diagram: UmlDiagramInput!
    $studentId: UUID!
    $solutionId: UUID
    $submit: Boolean!
  ) {
    mutateUmlExercise(assessmentId: $assessmentId) {
      saveStudentSolution(
        diagram: $diagram
        studentId: $studentId
        submit: $submit
        solutionId: $solutionId
      ) {
        id
        diagram {
          diagramCode
          semanticModel
        }
        submittedAt
        feedback {
          comment
          points
        }
      }
    }
  }
`;

export const umlApiUpdateTutorSolutionMutation = graphql`
  mutation UmlApiUpdateTutorSolutionMutation(
    $assessmentId: UUID!
    $tutorSolution: UmlDiagramInput!
  ) {
    mutateUmlExercise(assessmentId: $assessmentId) {
      updateTutorSolution(tutorSolution: $tutorSolution) {
        id
      }
    }
  }
`;

export const umlApiUpdateUmlAssignmentMutation = graphql`
  mutation UmlApiUpdateUmlAssignmentMutation(
    $contentId: UUID!
    $assessment: UpdateAssessmentInput!
    $assessmentId: UUID!
    $umlExercise: UpdateUmlExerciseInput!
  ) {
    mutateContent(contentId: $contentId) {
      updateAssessment(input: $assessment) {
        id
        metadata {
          chapterId
          name
          rewardPoints
          suggestedDate
          tagNames
        }
        assessmentMetadata {
          initialLearningInterval
          skillPoints
          skillTypes
        }
      }
    }
    mutateUmlExercise(assessmentId: $assessmentId) {
      updateUmlExercise(input: $umlExercise) {
        id
        description
        totalPoints
        requiredPercentage
        showSolution
        tutorSolution {
          diagramCode
          semanticModel
        }
      }
    }
  }
`;

export const umlApiGetStudentSolutionsQuery = graphql`
  query UmlApiGetStudentSolutionsQuery(
    $assessmentId: UUID!
    $studentId: UUID!
  ) {
    getUmlExerciseByAssessmentId(assessmentId: $assessmentId) {
      id
      description
      totalPoints
      requiredPercentage
      solutionsByStudent(studentId: $studentId) {
        id
        diagram {
          diagramCode
          semanticModel
        }
        submittedAt
        feedback {
          id
          comment
          points
        }
      }
    }
  }
`;

export const umlApiEvaluateLatestSolutionMutation = graphql`
  mutation UmlApiEvaluateLatestSolutionMutation(
    $assessmentId: UUID!
    $studentId: UUID!
  ) {
    mutateUmlExercise(assessmentId: $assessmentId) {
      evaluateLatestSolution(studentId: $studentId) {
        feedback {
          comment
          points
        }
      }
    }
  }
`;

export const umlApiCreateUmlSolutionMutation = graphql`
  mutation UmlApiCreateUmlSolutionMutation(
    $assessmentId: UUID!
    $studentId: UUID!
    $createFromPrevious: Boolean!
  ) {
    mutateUmlExercise(assessmentId: $assessmentId) {
      createUmlSolution(
        studentId: $studentId
        createFromPrevious: $createFromPrevious
      ) {
        id
        diagram {
          diagramCode
          semanticModel
        }
        submittedAt
      }
    }
  }
`;

export const umlApiGetLecturerExerciseOverviewQuery = graphql`
  query UmlApiGetLecturerExerciseOverviewQuery($assessmentId: UUID!) {
    getUmlExerciseByAssessmentId(assessmentId: $assessmentId) {
      id
      description
      totalPoints
      requiredPercentage
      tutorSolution {
        diagramCode
        semanticModel
      }
      studentSubmissions {
        studentId
        solutions {
          id
          submittedAt
          diagram {
            diagramCode
            semanticModel
          }
          feedback {
            points
            comment
          }
        }
      }
    }

    findContentsByIds(ids: [$assessmentId]) {
      metadata {
        name
        rewardPoints
        suggestedDate
        tagNames
        chapterId
      }
      ... on Assessment {
        assessmentMetadata {
          skillPoints
          skillTypes
          initialLearningInterval
        }
      }
    }
  }
`;