import { Environment, Network, RecordSource, Store } from "relay-runtime";

export function createIsolatedEnvironment(
  fetchFn: Parameters<typeof Network.create>[0]
) {
  return new Environment({
    network: Network.create(fetchFn),
    store: new Store(new RecordSource()),
  });
}
