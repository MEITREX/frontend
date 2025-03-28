export enum ExternalServiceProvider {
    Github = "GITHUB",
}

type ProviderInfo = {
  name: string;
  authUrl: string;
  clientId: string;
};

export const providerConfig: Record<ExternalServiceProvider, ProviderInfo> = {
  [ExternalServiceProvider.Github]: {
    name: "GitHub",
    authUrl: "https://github.com/login/oauth/authorize",
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
  },
};

export const codeAssessmentProvider: ExternalServiceProvider = ExternalServiceProvider.Github;
