"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { graphql, useMutation } from "react-relay";

import type { pageGenerateAccessTokenMutation } from "@/__generated__/pageGenerateAccessTokenMutation.graphql";
import { codeAssessmentProvider } from "@/components/ProviderConfig";
import toast from "react-hot-toast";

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const hasRun = useRef(false);
  const returnTo = useRef(localStorage.getItem("returnTo") || "/");

  const [commitGenerateAccessToken] =
    useMutation<pageGenerateAccessTokenMutation>(graphql`
      mutation pageGenerateAccessTokenMutation(
        $input: GenerateAccessTokenInput!
      ) {
        generateAccessToken(input: $input)
      }
    `);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    localStorage.removeItem("returnTo");

    if (error === "access_denied") {
      toast.error("Authorization was denied.");
      router.replace(returnTo.current);
      return;
    }

    if (!code) {
      toast.error("Failed to generate access token.");
      router.replace(returnTo.current);
      return;
    }

    commitGenerateAccessToken({
      variables: {
        input: {
          provider: codeAssessmentProvider,
          authorizationCode: code,
        },
      },
      onCompleted: (response) => {
        if (response?.generateAccessToken) {
          toast.success("Access token generated successfully.");
        } else {
          toast.error("Failed to generate access token.");
        }
        router.replace(returnTo.current);
      },
      onError: (err) => {
        toast.error("Failed to generate access token.");
        console.error("Token error:", err);
        router.replace(returnTo.current);
      },
    });
  }, [code, error, router, errorDescription, commitGenerateAccessToken]);

  return null;
}
