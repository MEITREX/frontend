"use client";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Navbar } from "./Navbar";
import { createIsolatedEnvironment } from "./relay/createIsolatedEnvironment";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const tokenRef = useRef<string | undefined>(auth.user?.access_token);
  useEffect(() => {
    tokenRef.current = auth.user?.access_token;
  }, [auth.user?.access_token]);

  const getToken = useCallback(() => tokenRef.current, []);

  const env = useMemo(
    () => createIsolatedEnvironment({ getToken }),
    [getToken]
  );

  return (
    <div className="flex overflow-hidden h-full bg-slate-200">
      <Navbar />

      <div className="grow overflow-auto flex flex-col">
        <div className="px-8 py-11 mr-8 my-8 bg-white rounded-[3rem] grow">
          {children}
        </div>
      </div>
    </div>
  );
}
