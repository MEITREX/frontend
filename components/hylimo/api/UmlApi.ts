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
        tutorSolution
      }
    }
  }
`;



export const umlApiSubmitStudentSolutionMutation = graphql`
  mutation UmlApiSubmitStudentSolutionMutation(
    $assessmentId: UUID!
    $diagram: String!
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
        diagram
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
    $assessmentId: UUID!,
    $tutorSolution: String!
  ) {
    mutateUmlExercise(assessmentId: $assessmentId) {
      updateTutorSolution(tutorSolution: $tutorSolution) {
        id
      }
    }
  }
`;

export const umlApiGetStudentSolutionsQuery = graphql`
  query UmlApiGetStudentSolutionsQuery(
    $assessmentId: UUID!,
    $studentId: UUID!
  ) {
    getUmlExerciseByAssessmentId(assessmentId: $assessmentId) {
      id
      description
      solutionsByStudent(studentId: $studentId) {
        id
        diagram
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
