// src/components/relay/createIsolatedEnvironment.ts
import { makeFetchFn } from "@/src/relay-helpers/fetchFn";
import { Environment, Network, RecordSource, Store } from "relay-runtime";

export function createIsolatedEnvironment(opts?: {
  token?: string;
  getToken?: () => string | undefined | null;
}) {
  const fetchFn = makeFetchFn(opts);
  const network = Network.create(fetchFn);
  const store = new Store(new RecordSource(), { gcReleaseBufferSize: 10 });
  return new Environment({ network, store });
}
