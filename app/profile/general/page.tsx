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

type HexadScore = {
  type:
    | "PHILANTHROPIST"
    | "SOCIALISER"
    | "FREE_SPIRIT"
    | "ACHIEVER"
    | "PLAYER"
    | "DISRUPTOR";
  value: number;
};

const tabs = [
  { label: "General", path: "general" },
  { label: "Achievements", path: "achievements" },
  { label: "Forum", path: "forum" },
  { label: "Badges", path: "badges" },
];
const NEXT_PUBLIC_GRAPHQL_ENDPOINT = "8080";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "/graphql";

/**
 * Runtime GraphQL fetcher. We do this outside of Relay because the schema
 * currently doesn't expose the user-level fields in the Relay-validated schema.
 * As soon as the backend exposes a field like `getUserById(userId: UUID!): User!`
 * in the Relay schema, replace this with a proper `useLazyLoadQuery`.
 */
async function postGraphQL<TData>(
  query: string,
  variables: Record<string, any>
): Promise<{ data?: TData; errors?: any[] }> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The GraphQL GUI uses "Authorization: Bearer &lt;token&gt;".
      // Here we try to reuse it if you store it globally; otherwise remove this header.
      ...(typeof window !== "undefined" && (window as any).__AUTH_TOKEN__
        ? { Authorization: `Bearer ${(window as any).__AUTH_TOKEN__}` }
        : {}),
    },
    body: JSON.stringify({ query, variables }),
    credentials: "include",
  });

  try {
    return (await res.json()) as any;
  } catch {
    return { errors: [{ message: "Failed to parse GraphQL response" }] } as any;
  }
}

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

  // 2) Runtime-Queries: (a) User XP/Level, (b) optional Hexad (für spätere Features)
  const [levelInfo, setLevelInfo] = useState<UserLevelInfo | null>(null);
  const [hexad, setHexad] = useState<HexadScore[] | null>(null);
  const [loadingLevel, setLoadingLevel] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUserInfo?.id) return;
      setLoadingLevel(true);

      // Query A: try to fetch XP/Level from a User-returning field
      // We try two common candidates in order. The server may expose one of them.
      // NOTE: Replace these with the actual, available field once merged.
      const userLevelQuery = `
        query GetUserLevel($userId: UUID!) {
          # Candidate 1 (preferred):
          getUserById(userId: $userId) {
            id
            name
            email
            requiredXP
            exceedingXP
            level
          }
        }
      `;

      const { data: userData, errors: userErrors } = await postGraphQL<{
        getUserById?: {
          id: string;
          name: string;
          email: string;
          requiredXP: number;
          exceedingXP: number;
          level: number;
        };
      }>(userLevelQuery, { userId: currentUserInfo.id });

      if (!cancelled) {
        if (userData?.getUserById) {
          setLevelInfo({
            level: userData.getUserById.level ?? 0,
            requiredXP: userData.getUserById.requiredXP ?? 1,
            exceedingXP: userData.getUserById.exceedingXP ?? 0,
          });
        } else {
          // Fallback: keep previous or show zeros; surface minimal console hint for dev
          if (userErrors) {
            // eslint-disable-next-line no-console
            console.warn(
              "[XP] Backend field for user level not available yet.",
              userErrors
            );
          }
          setLevelInfo({
            level: 0,
            requiredXP: 1,
            exceedingXP: 0,
          });
        }
      }

      // Query B: optional Hexad (exists in your schema)
      const hexadQuery = `
        query GetHexad($userId: UUID!) {
          getPlayerHexadScoreById(userId: $userId) {
            scores {
              type
              value
            }
          }
        }
      `;
      const { data: hexadData } = await postGraphQL<{
        getPlayerHexadScoreById?: { scores: HexadScore[] };
      }>(hexadQuery, { userId: currentUserInfo.id });

      if (!cancelled) {
        setHexad(hexadData?.getPlayerHexadScoreById?.scores ?? null);
        setLoadingLevel(false);
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
              : `${levelInfo?.exceedingXP ?? 0} / ${
                  levelInfo?.requiredXP ?? 1
                } XP`}
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
