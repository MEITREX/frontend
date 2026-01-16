import { graphql, fetchQuery, useRelayEnvironment } from "react-relay";

import { useAITutorStore } from '@/stores/aiTutorStore';
import { feedbackUtilsLatestProactiveFeedbackQuery } from "@/__generated__/feedbackUtilsLatestProactiveFeedbackQuery.graphql";

const latestProactiveFeedbackQuery = graphql`
  query feedbackUtilsLatestProactiveFeedbackQuery {
    latestProactiveFeedback
  }
`;

export function useFetchProactiveFeedback() {
  const environment = useRelayEnvironment();
  const showProactiveFeedback = useAITutorStore((state) => state.showProactiveFeedback);
  
  const fetchFeedback = (courseId?: string) => {
    return new Promise<{success: boolean}>((resolve, reject) => {
      fetchQuery<feedbackUtilsLatestProactiveFeedbackQuery>(
        environment,
        latestProactiveFeedbackQuery,
        {}
      ).subscribe({
        next: (data) => {
          const feedback = data?.latestProactiveFeedback;
          if (feedback) {
            showProactiveFeedback(feedback);
            resolve({success: true});
          } else {
            resolve({success: false});
          }
        },
        error: (err: any) => reject(err),
      });
    });
  };

  return {
    sendMessage: fetchFeedback,
    isInFlight: false
  };
}