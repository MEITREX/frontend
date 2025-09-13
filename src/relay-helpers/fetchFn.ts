// fetchFn.ts
import type { RequestParameters, Variables } from "relay-runtime";

const GRAPHQL_URL = "http://localhost:8080/graphql";

export function makeFetchFn(opts?: {
  token?: string;
  getToken?: () => string | undefined | null;
}) {
  return async function fetchFn(
    params: RequestParameters,
    variables: Variables
  ) {
    const token = opts?.getToken ? opts.getToken() : opts?.token;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        query: params.text,
        variables,
        operationName: params.name,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `[Relay fetch] ${res.status} ${res.statusText} for ${params.name} – ${text}`
      );
    }
    const json = await res.json().catch(() => {
      throw new Error("[Relay fetch] Failed to parse JSON response");
    });
    if (json.errors?.length)
      console.warn("[Relay fetch] GraphQL errors:", json.errors);
    return json;
  };
}
