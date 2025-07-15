import { graphql, useRelayEnvironment, fetchQuery } from "react-relay";
import { useCallback } from "react";
import { useAccessTokenCheckQuery } from "@/__generated__/useAccessTokenCheckQuery.graphql";
import { codeAssessmentProvider } from "@/components/ProviderConfig";

export function useAccessTokenCheck() {
  const env = useRelayEnvironment();

  return useCallback(async () => {
    const result = await fetchQuery<useAccessTokenCheckQuery>(
      env,
      graphql`
        query useAccessTokenCheckQuery($provider: ExternalServiceProviderDto!) {
          isAccessTokenAvailable(provider: $provider)
        }
      `,
      { provider: codeAssessmentProvider }
    ).toPromise();

    return result?.isAccessTokenAvailable ?? false;
  }, [env]);
}
