// AppRelayProvider.tsx
"use client";

import { createIsolatedEnvironment } from "@/components/relay/createIsolatedEnvironment";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "react-oidc-context";
import { RelayEnvironmentProvider } from "react-relay";

export default function AppRelayProvider({ children }: PropsWithChildren) {
  const auth = useAuth();

  const tokenRef = useRef<string | undefined>(
    auth.user?.access_token ?? undefined
  );
  useEffect(() => {
    tokenRef.current = auth.user?.access_token ?? undefined;
  }, [auth.user?.access_token]);

  const getToken = useCallback(() => tokenRef.current, []);

  const env = useMemo(
    () => createIsolatedEnvironment({ getToken }),
    [getToken]
  );

  return (
    <RelayEnvironmentProvider environment={env}>
      {children}
    </RelayEnvironmentProvider>
  );
}
