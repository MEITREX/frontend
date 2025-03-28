export enum ExternalServiceProvider {
    Github = "GITHUB",
}

type ProviderConfig = {
    name: string;
    authUrl: string;
    clientId: string;
  };

  export const providerRegistry: Record<ExternalServiceProvider, ProviderConfig> = {
    [ExternalServiceProvider.Github]: {
      name: "GitHub",
      authUrl: "https://github.com/login/oauth/authorize",
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    },
  };

export const codeAssessmentProvider: ExternalServiceProvider = ExternalServiceProvider.Github;
