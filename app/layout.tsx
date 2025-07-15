"use client";

import "@/styles/globals.css";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { ClientToaster } from "@/components/ClientToaster";
import { PageLayout } from "@/components/PageLayout";
import TutorWidget from "@/components/tutor/TutorWidget";
import { initRelayEnvironment } from "@/src/RelayEnvironment";
import { PageView, PageViewProvider, usePageView } from "@/src/currentView";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  AuthProvider,
  AuthProviderProps,
  hasAuthParams,
  useAuth,
} from "react-oidc-context";
import { RelayEnvironmentProvider } from "react-relay";
import { GlobalStyleSetup } from "./GlobalStyleSetup";
import {
  ThemeVariantContext,
  ThemeVariantContextType,
} from "./ThemeVariantContext";
import { themeColorBlind, themeDark, themeLight } from "./color-themes";
import PageLoading from "./loading";

dayjs.extend(isBetween);

const oidcConfig: AuthProviderProps = {
  redirect_uri:
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL ?? "http://localhost:3005",
  client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? "frontend",
  authority:
    process.env.NEXT_PUBLIC_OAUTH_AUTHORITY ??
    "http://localhost:9009/realms/GITS",

  onSigninCallback() {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

type Props = {
  children: React.ReactNode;
};

export default function App({ children }: Props) {
  const [themeVariant, setThemeVariant] =
    useState<ThemeVariantContextType["themeVariant"]>("auto");
  const [browserTheme, setBrowserTheme] = useState<"light" | "dark" | null>(
    null,
  );

  // them variant === "auto" => use browser preference
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaQueryChange = (e: Event) => {
      console.log(themeVariant);
      if (themeVariant === "auto") {
        console.log(mediaQuery.matches);
        setBrowserTheme(mediaQuery.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, [themeVariant]);

  const activeTheme = useMemo(
    () =>
      themeVariant === "auto" && browserTheme === "light"
        ? themeLight
        : themeVariant === "auto" && browserTheme === "dark"
          ? themeDark
          : themeVariant === "dark"
            ? themeDark
            : themeVariant === "color-blind"
              ? themeColorBlind
              : themeLight,
    [browserTheme, themeVariant],
  );
  const themeProviderValue = useMemo(
    () => ({
      themeVariant,
      setThemeVariant,
    }),
    [themeVariant],
  );
  return (
    <html lang="de" className="h-full overflow-hidden">
      <head>
        <title>MEITREX</title>
      </head>
      <body className="h-full">
        <AuthProvider {...oidcConfig}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DndProvider backend={HTML5Backend}>
              <SigninContent>
                <ThemeVariantContext.Provider value={themeProviderValue}>
                  <ThemeProvider theme={activeTheme}>
                    <CssBaseline />
                    <GlobalStyleSetup />
                    <PageViewProvider>
                      <InnerLayout>{children}</InnerLayout>
                    </PageViewProvider>
                  </ThemeProvider>
                </ThemeVariantContext.Provider>
              </SigninContent>
            </DndProvider>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const [pageView] = usePageView();
  const auth = useAuth();
  return (
    <>
      <PageLayout>{children}</PageLayout>
      {pageView === PageView.Student && (
        <TutorWidget isAuthenticated={auth.isAuthenticated} />
      )}
    </>
  );
}

function SigninContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const environment = useMemo(
    () => initRelayEnvironment(auth.user?.access_token),
    [auth.user?.access_token],
  );
  // automatically sign-in
  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading
    ) {
      auth.signinRedirect();
    }
  }, [
    auth,
    auth.isAuthenticated,
    auth.activeNavigator,
    auth.isLoading,
    auth.signinRedirect,
  ]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <PageLoading />;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <ClientToaster />
        {children}
      </RelayEnvironmentProvider>
    );
  }

  return <div>Logging in...</div>;
}
