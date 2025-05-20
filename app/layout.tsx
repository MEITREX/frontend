"use client";

import "@/styles/globals.css";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { PageLayout } from "@/components/PageLayout";
import { initRelayEnvironment } from "@/src/RelayEnvironment";
import { PageViewProvider } from "@/src/currentView";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
  colors,
  createTheme,
} from "@mui/material";
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
import PageLoading from "./loading";
import {
  ThemeVariantContext,
  ThemeVariantContextType,
} from "./ThemeVariantContext";
import {
  GlobalStylesSetup,
  themeColorBlind,
  themeDark,
  themeLight,
} from "./color-themes";

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

export default function App({ children }: { children: React.ReactNode }) {
  // TODO integrate this with settings
  const getSavedThemeVariant = useCallback(() => {
    const savedTheme = localStorage.getItem("themeVariant");
    if (savedTheme)
      return savedTheme as ThemeVariantContextType["themeVariant"];
    else return null;
  }, []);

  const [themeVariant, setThemeVariant] = useState<
    ThemeVariantContextType["themeVariant"]
  >(() => {
    const savedTheme = getSavedThemeVariant();
    if (savedTheme) return savedTheme;

    // default to browser preference, defaulting to light when not supplied
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // when browser-default changes, the theme should also change - unless color-blind is selected
  // TODO maybe introduce setting to toggle this behavior
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaQueryChange = (_e: Event) => {
      if (themeVariant !== "color-blind") {
        setThemeVariant(mediaQuery.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, [themeVariant]);

  // TODO integrate this with settings
  const handleThemeUserChange = useCallback(
    (newTheme: ThemeVariantContextType["themeVariant"]) => {
      setThemeVariant(newTheme);
      localStorage.setItem("themeVariant", newTheme);
    },
    []
  );

  const currentActiveTheme =
    themeVariant === "dark"
      ? themeDark
      : themeVariant === "color-blind"
      ? themeColorBlind
      : themeLight;

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
                <ThemeProvider theme={currentActiveTheme}>
                  <CssBaseline />
                  <GlobalStylesSetup />
                  <ThemeVariantContext.Provider
                    value={{
                      themeVariant,
                      setThemeVariant: handleThemeUserChange,
                    }}
                  >
                    <PageViewProvider>
                      <PageLayout>{children}</PageLayout>
                    </PageViewProvider>
                  </ThemeVariantContext.Provider>
                </ThemeProvider>
              </SigninContent>
            </DndProvider>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function SigninContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const environment = useMemo(
    () => initRelayEnvironment(auth.user?.access_token),
    [auth.user?.access_token]
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
        {children}
      </RelayEnvironmentProvider>
    );
  }

  return <div>Logging in...</div>;
}
