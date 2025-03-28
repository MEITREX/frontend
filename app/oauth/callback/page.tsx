"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams, usePathname } from "next/navigation";
import { graphql, useMutation, useLazyLoadQuery } from "react-relay";

import type {
  pageGenerateAccessTokenMutation,
} from "../../../__generated__/pageGenerateAccessTokenMutation.graphql";
import { codeAssessmentProvider } from "@/components/ProviderConfig";

export default function OAuthCallback() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  
  const hasRun = useRef(false);

  const [commitGenerateAccessToken] = useMutation<pageGenerateAccessTokenMutation>(graphql`
    mutation pageGenerateAccessTokenMutation($input: GenerateAccessTokenInput!) {
      generateAccessToken(input: $input)
    }
  `);

  useEffect(() => {
    if (!code || hasRun.current) return;

    hasRun.current = true;

    const returnTo = localStorage.getItem("returnTo") || "/";
    localStorage.removeItem("returnTo");

    commitGenerateAccessToken({
      variables: {
        input: {
          provider: codeAssessmentProvider,
          authorizationCode: code,
        },
      },
      onCompleted: (response) => {
        if (response?.generateAccessToken) {
          console.log("Access token generated successfully:");
        } else {
          console.error("Failed to generate access token.");
        }
        router.replace(returnTo);
      },
      onError: (err) => {
        console.error("Failed to generate token:", err);
        router.replace(returnTo);
      },
    });
  }, [code, commitGenerateAccessToken, router]);

  return null;
}
