"use client";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { RelayEnvironmentProvider } from "react-relay";
import { Navbar } from "./Navbar";
import { createIsolatedEnvironment } from "./relay/createIsolatedEnvironment";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // 1) Token in Ref aktuell halten (ohne Rebuild des Environments)
  const tokenRef = useRef<string | undefined>(auth.user?.access_token);
  useEffect(() => {
    tokenRef.current = auth.user?.access_token;
  }, [auth.user?.access_token]);

  // 2) Stabiler Getter (Identität ändert sich nie)
  const getToken = useCallback(() => tokenRef.current, []);

  // 3) Environment genau einmal bauen
  const env = useMemo(
    () => createIsolatedEnvironment({ getToken }),
    [getToken]
  );

  return (
    <div className="flex overflow-hidden h-full bg-slate-200">
      <Navbar />

      <div className="grow overflow-auto flex flex-col">
        <div className="px-8 py-11 mr-8 my-8 bg-white rounded-[3rem] grow">
          <RelayEnvironmentProvider environment={env}>
            {children}
          </RelayEnvironmentProvider>
        </div>
      </div>
    </div>
  );
}
