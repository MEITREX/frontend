import { Client, createClient } from "graphql-ws";
import { useAuth } from "react-oidc-context";
import {
  Environment,
  FetchFunction,
  Network,
  Observable,
  RecordSource,
  Store,
} from "relay-runtime";
useAuth;

const HTTP_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080/graphql";

function createFetchFn(token: string | undefined): FetchFunction {
  return async (request, variables) => {
    const headers: Record<string, string> = {
      Accept:
        "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const resp = await fetch(HTTP_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: request.text, // <-- The GraphQL document composed by Relay
        variables,
      }),
    });

    return await resp.json();
  };
}

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  // 原生 WebSocket 关闭事件
  if (typeof CloseEvent !== "undefined" && err instanceof CloseEvent) {
    return new Error(
      `WebSocket closed: code=${err.code} reason=${err.reason || "(none)"}`
    );
  }
  if (typeof err === "string") return new Error(err);
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error(String(err));
  }
}

let wsClient: Client | null = null;
function getWsClient(token?: string): Client | null {
  if (typeof window === "undefined") return null;
  if (wsClient) return wsClient;

  const WS_ENDPOINT = HTTP_ENDPOINT.replace(/^http/, "ws");

  wsClient = createClient({
    url: WS_ENDPOINT,
    connectionParams: token
      ? {
          Authorization: `Bearer ${token}`,
          headers: { Authorization: `Bearer ${token}` },
        }
      : undefined,
  });
  return wsClient;
}

function createSubscribeFn(token?: string) {
  return (operation: any, variables: any) =>
    Observable.create((sink) => {
      const client = getWsClient(token);
      if (!client) {
        sink.complete();
        return () => void 0;
      }
      return client.subscribe(
        { query: operation.text as string, variables },
        {
          next: (data) => sink.next(data),
          error: (err) => sink.error(toError(err)),
          complete: () => sink.complete(),
        }
      );
    });
}

let relayStore: Store | undefined;

export function initRelayEnvironment(token: string | undefined) {
  // For SSG and SSR always create a new Relay environment.
  if (typeof window === "undefined") {
    return new Environment({
      network: Network.create(createFetchFn(token)),
      store: new Store(new RecordSource()),
    });
  }

  // Create the Relay environment once in the client
  // and then reuse it.

  // init env
  if (!relayStore) {
    relayStore = new Store(new RecordSource());
  }

  return new Environment({
    network: Network.create(createFetchFn(token)),
    store: relayStore,
  });
}
