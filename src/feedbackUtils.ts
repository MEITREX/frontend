import { graphql, useMutation } from "react-relay";

import { useAITutorStore } from '@/stores/aiTutorStore';
import { feedbackUtilsSendMessageMutation, feedbackUtilsSendMessageMutation$variables } from "@/__generated__/feedbackUtilsSendMessageMutation.graphql";

const sendMessageMutation = graphql`
  mutation feedbackUtilsSendMessageMutation($userInput: String!, $courseId: UUID) {
    sendMessage(userInput: $userInput, courseId: $courseId) {
      answer
    }
  }
`;

export function useFetchProactiveFeedback() {
  const [commit, isInFlight] = useMutation<feedbackUtilsSendMessageMutation>(sendMessageMutation);
  const showProactiveFeedback = useAITutorStore((state) => state.showProactiveFeedback);
  
  const sendMessage = (courseId?: string) => {
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          userInput: "proactivefeedback",
          courseId,
        } as feedbackUtilsSendMessageMutation$variables,
        onCompleted: (response:any, errors:any) => {
          const answer = response?.sendMessage?.answer;
          if (answer) {
            if (answer !== "No proactive feedback available at the moment.") {
                showProactiveFeedback(answer);
            }
          }
          resolve(response);
        },
        onError: (err:any) => reject(err),
      });
    });
  };

  return {
    sendMessage,
    isInFlight
  };
}