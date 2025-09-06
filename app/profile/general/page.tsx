"use client";

import { pagePrivateProfileStudentGeneralQuery } from "@/__generated__/pagePrivateProfileStudentGeneralQuery.graphql";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import GeneralPage from "../GeneralPage";

type UserLevelInfo = {
  level: number;
  requiredXP: number;
  exceedingXP: number; // XP gathered within current level
};

/**
 * Resolve GraphQL endpoint robustly.
 * Priority:
 * 1) NEXT_PUBLIC_GRAPHQL_URL (full URL)
 * 2) NEXT_PUBLIC_GRAPHQL_ENDPOINT (full URL or port number)
 * 3) Default: http://localhost:8080/graphql
 */
function resolveGraphqlUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    "";

  if (envUrl) {
    // Full URL provided
    if (/^https?:\/\//i.test(envUrl)) return envUrl;
    // Only a port number like "8080" or ":8080"
    const portMatch = envUrl.match(/:?([0-9]{2,5})$/);
    if (portMatch) return `http://localhost:${portMatch[1]}/graphql`;
    // A bare path like "/graphql"
    if (envUrl.startsWith("/")) return `http://localhost:8080${envUrl}`;
  }
  return "http://localhost:8080/graphql";
}

const GRAPHQL_URL = resolveGraphqlUrl();

/**
 * Runtime GraphQL fetcher. We do this outside of Relay because the schema
 * currently doesn't expose the user-level fields in the Relay-validated schema.
 * As soon as the backend exposes a field like `getUserById(userId: UUID!): User!`
 * in the Relay schema, replace this with a proper `useLazyLoadQuery`.
 */
function getAuthHeader(): Record<string, string> {
  // 1) Explicit global token if you set it somewhere: (window as any).__AUTH_TOKEN__
  if (typeof window !== "undefined" && (window as any).__AUTH_TOKEN__) {
    return { Authorization: `Bearer ${(window as any).__AUTH_TOKEN__}` };
  }
  // 2) Try to read from oidc.user:* entry in localStorage (Keycloak/oidc)
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (key.startsWith("oidc.user:")) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          const token = parsed?.access_token || parsed?.accessToken;
          if (token) return { Authorization: `Bearer ${token}` };
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return {};
}

async function postGraphQL<TData>(
  query: string,
  variables: Record<string, any>
): Promise<{ data?: TData; errors?: any[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ query, variables }),
      credentials: "include",
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      return { errors: [{ message: `HTTP ${res.status}: ${text}` }] } as any;
    }
    try {
      return JSON.parse(text) as any;
    } catch (e) {
      return { errors: [{ message: "Failed to parse GraphQL response", raw: text }] } as any;
    }
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Request timed out" : (e?.message || String(e));
    return { errors: [{ message: msg }] } as any;
  } finally {
    clearTimeout(timeout);
  }
}

const tabs = [
  { label: "General", path: "general" },
  { label: "Achievements", path: "achievements" },
  { label: "Forum", path: "forum" },
  { label: "Badges", path: "badges" },
];

export default function GeneralPageWrapper() {
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

  const handleChange = (_: any, newValue: number) => {
    router.push(`/profile/${tabs[newValue].path}`);
  };

  // 1) UserID stabil über Relay
  const { currentUserInfo } =
    useLazyLoadQuery<pagePrivateProfileStudentGeneralQuery>(
      graphql`
        query pagePrivateProfileStudentGeneralQuery {
          currentUserInfo {
            id
            lastName
            firstName
            userName
            nickname
          }
        }
      `,
      {}
    );

  // 2) Runtime-Queries: (a) User XP/Level
  const [levelInfo, setLevelInfo] = useState<UserLevelInfo | null>(null);
  const [loadingLevel, setLoadingLevel] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUserInfo?.id) return;
      setLoadingLevel(true);

      const userLevelQuery = `
        query GetUser($userID: ID!) {
          getUser(userID: $userID) {
            id
            name
            email
            xpValue
            requiredXP
            exceedingXP
            level
          }
        }
      `;

      try {
        const { data: userData, errors: userErrors } = await postGraphQL<{
          getUser?: any;
        }>(userLevelQuery, { userID: currentUserInfo.id });

        if (!cancelled) {
          const payload: any = userData?.getUser;
          const u = Array.isArray(payload) ? payload[0] : payload; // supports both array and object
          if (u) {
            setLevelInfo({
              level: u.level ?? 0,
              requiredXP: Math.max(1, Math.round(u.requiredXP ?? 1)),
              exceedingXP: Math.max(0, Math.round(u.exceedingXP ?? 0)),
            });
          } else {
            if (userErrors) {
              // eslint-disable-next-line no-console
              console.warn("[XP] getUser errors:", userErrors);
            }
            setLevelInfo({ level: 0, requiredXP: 1, exceedingXP: 0 });
          }
        }
      } finally {
        if (!cancelled) setLoadingLevel(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentUserInfo?.id]);

  const levelIconSrc = useMemo(() => {
    const lvl = Math.max(0, Math.min(99, levelInfo?.level ?? 0));
    return `/levels/level_${String(lvl)}.svg`;
  }, [levelInfo?.level]);

  const progressPct = useMemo(() => {
    const required = Math.max(1, levelInfo?.requiredXP ?? 1);
    const have = Math.max(0, levelInfo?.exceedingXP ?? 0);
    return Math.max(0, Math.min(100, Math.round((have / required) * 100)));
  }, [levelInfo?.requiredXP, levelInfo?.exceedingXP]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Hi, {currentUserInfo.userName}
      </Typography>

      {/* Level + XP overview */}
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mb: 0.5 }}
        >
          <img
            src={levelIconSrc}
            alt={`Level ${levelInfo?.level ?? 0}`}
            width={48}
            height={48}
            style={{ display: "block" }}
          />
          <Typography variant="body2" color="text.secondary">
            {loadingLevel
              ? "Loading XP…"
              : `Level ${levelInfo?.level ?? 0} · ${Math.round(levelInfo?.exceedingXP ?? 0)} / ${Math.max(1, Math.round(levelInfo?.requiredXP ?? 1))} XP`}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{ height: 10, borderRadius: 999 }}
        />
      </Box>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome to your profile. Use the tabs to navigate.
      </Typography>

      <Tabs
        value={activeIndex}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3, ".MuiTabs-indicator": { display: "none" } }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.path}
            value={index}
            label={tab.label}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              color: "text.primary",
              borderRadius: "10px",
              border:
                index === activeIndex
                  ? "2px solid #00a9d6"
                  : "2px solid transparent",
              backgroundColor:
                index === activeIndex
                  ? "rgba(0, 169, 214, 0.1)"
                  : "transparent",
              transition: "all 0.2s ease-in-out",
              "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.1)" },
            }}
          />
        ))}
      </Tabs>

      {/* Actual page content */}
      <GeneralPage studentData={currentUserInfo} />
    </Box>
  );
}
