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
        }
    }
`;


export const umlApiGetUmlExerciseByAssessmentId = graphql`
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