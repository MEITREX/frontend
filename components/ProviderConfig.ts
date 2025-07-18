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
    clientId: "Iv23liqWXtlgus3t6F7U"
  },
};

export const codeAssessmentProvider: ExternalServiceProvider =
  ExternalServiceProvider.Github;
