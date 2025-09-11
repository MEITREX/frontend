// src/relay/fetchFn.ts
import type { RequestParameters, Variables } from "relay-runtime";

const GRAPHQL_URL =
  "http://localhost:8080/graphql";

// Falls du einen Token global ablegst (z. B. window.__AUTH_TOKEN__)
function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined" && (window as any).__AUTH_TOKEN__) {
    return { Authorization: `Bearer ${(window as any).__AUTH_TOKEN__}` };
  }
  return {};
}

export async function fetchFn(
  params: RequestParameters,
  variables: Variables
): Promise<any> {
  // Wichtig: params.text enthält das Query (bei persisted queries evtl. null)
  const body: any = {
    query: params.text,          // wenn du persisted queries nutzt, hier ggf. params.id senden
    variables,
    operationName: params.name,
  };

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    credentials: "include", // falls du Cookies brauchst
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[Relay fetch] ${res.status} ${res.statusText} for ${params.name} – ${text}`
    );
  }

  // GraphQL-Response (data/errors)
  const json = await res.json().catch(() => {
    throw new Error("[Relay fetch] Failed to parse JSON response");
  });

  // Optional: GraphQL-Fehler bewusst nach oben werfen
  if (json.errors && json.errors.length) {
    // Du kannst hier auch nicht werfen und Relay den Fehler zeigen lassen,
    // ich werfe bewusst für klarere Logs:
    console.warn("[Relay fetch] GraphQL errors:", json.errors);
  }

  return json;
}

export default fetchFn;
