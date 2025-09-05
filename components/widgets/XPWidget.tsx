"use client";

import * as React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useLazyLoadQuery, graphql } from "react-relay/hooks";
import type { XPWidgetQuery as XPWidgetQueryType } from "@/__generated__/XPWidgetQuery.graphql";

// --- Types to mirror the profile implementation ---
type UserLevelInfo = {
  level: number;
  requiredXP: number;
  exceedingXP: number; // XP gathered within current level
};

type XPSource = {
  id: string;
  label: string;
  amount?: number;
  amountLabel?: string;
  hint?: string;
};

const XP_SOURCES: XPSource[] = [
  {
    id: "watchVideo",
    label: "Watching a lecture video",
    amountLabel: "2 XP × lengthMinutes",
    hint: "Only on first completion of video/document",
  },
  {
    id: "readDoc",
    label: "Reading a lecture document",
    amountLabel: "2 XP × pageCount",
    hint: "Only on first completion of video/document",
  },
  {
    id: "quiz",
    label: "Completing a quiz",
    amountLabel: "2 XP × questionCount",
    hint: "Only if successfully completed",
  },
  {
    id: "flashcards",
    label: "Completing a flashcard set",
    amountLabel: "2 XP × flashcardCount",
    hint: "Only if successfully completed",
  },
  {
    id: "assignment",
    label: "Completing an assignment",
    amount: 80,
    hint: "Only if successfully completed",
  },
  { id: "achievement", label: "Earning an achievement", amount: 30 },
  { id: "forum", label: "Posting in the forum", amount: 20 },
  {
    id: "answerAccepted",
    label: "Getting an answer accepted in the forum",
    amount: 80,
  },
  {
    id: "stageRequired",
    label: "Completing a stage’s required contents",
    amount: 20,
  },
  {
    id: "chapter",
    label: "Completing a chapter",
    amount: 200,
  },
  { id: "courseComplete", label: "Completing a course", amount: 500 },
];

const XPWidgetQuery = graphql`
  query XPWidgetQuery {
    currentUserInfo {
      id
      userName
    }
  }
`;

// Same runtime GraphQL fetcher approach as in the profile page
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "/graphql";

async function postGraphQL<TData>(
  query: string,
  variables: Record<string, any>
): Promise<{ data?: TData; errors?: any[] }> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

export default function XPWidget() {
  const data = useLazyLoadQuery<XPWidgetQueryType>(
    XPWidgetQuery,
    {},
    { fetchPolicy: "store-or-network" }
  );
  const userId = data.currentUserInfo?.id ?? "";
  const userName = data.currentUserInfo?.userName ?? "";

  // State for live XP/Level pulled from backend (same pattern as profile)
  const [levelInfo, setLevelInfo] = React.useState<UserLevelInfo | null>(null);
  const [loadingLevel, setLoadingLevel] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId) return;
      setLoadingLevel(true);

      const userLevelQuery = `
        query GetUserLevel($userId: UUID!) {
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

      const { data: userData } = await postGraphQL<{
        getUserById?: {
          id: string;
          name: string;
          email: string;
          requiredXP: number;
          exceedingXP: number;
          level: number;
        };
      }>(userLevelQuery, { userId });

      if (!cancelled) {
        if (userData?.getUserById) {
          setLevelInfo({
            level: userData.getUserById.level ?? 0,
            requiredXP: userData.getUserById.requiredXP ?? 1,
            exceedingXP: userData.getUserById.exceedingXP ?? 0,
          });
        } else {
          setLevelInfo({ level: 0, requiredXP: 1, exceedingXP: 0 });
        }
        setLoadingLevel(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const level = levelInfo?.level ?? 0;
  const currentXP = levelInfo?.exceedingXP ?? 0;
  const requiredXP = levelInfo?.requiredXP ?? 1;
  const progress = Math.max(
    0,
    Math.min(100, (currentXP / Math.max(1, requiredXP)) * 100)
  );

  return (
    <Box
      key={userId}
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 0.75,
        mb: 4,
        maxWidth: 450,
        backgroundColor: "background.paper",
        maxHeight: "none",
        minHeight: "auto",
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={0.25}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            textTransform: "none",
            fontSize: "0.9rem",
          }}
        >
          {`XP Allocation${userName ? ` · ${userName}` : ""}`}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, fontSize: "0.85rem", mr: 0.75 }}
          >
            Level {level}
          </Typography>
          <Box sx={{ flexGrow: 1, mr: 0.75, minWidth: 130 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6 }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ minWidth: 50, fontSize: "0.85rem", lineHeight: 1.1 }}
          >
            {loadingLevel ? "…" : `${currentXP} / ${requiredXP}`}
          </Typography>
        </Box>
      </Box>

      <Table
        size="small"
        sx={{
          tableLayout: "fixed",
          width: "100%",
          "& th, & td": { border: 0, py: 0.4 },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ fontWeight: 700, pl: 0, fontSize: "0.9rem", width: "70%" }}
            >
              <Typography
                sx={{ lineHeight: 1.1, fontSize: "0.9rem", fontWeight: 700 }}
              >
                Action
              </Typography>
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, pr: 0, fontSize: "0.9rem", width: "30%" }}
            >
              <Typography
                sx={{ lineHeight: 1.1, fontSize: "0.9rem", fontWeight: 700 }}
              >
                XP
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {XP_SOURCES.map(({ id, label, amountLabel, amount, hint }) => (
            <TableRow key={id}>
              <TableCell
                sx={{
                  pl: 0,
                  pr: 1.5,
                  fontSize: "0.9rem",
                  verticalAlign: "top",
                  width: "70%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    lineHeight: 1.2,
                    fontSize: "0.9rem",
                    display: "block",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {label}
                </Typography>
                {hint && (
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      opacity: 0.7,
                      fontSize: "0.62rem",
                      lineHeight: 1.2,
                      mt: 0.2,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {hint}
                  </Typography>
                )}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  pr: 0,
                  fontSize: "0.9rem",
                  verticalAlign: "top",
                  width: "30%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    fontSize: "0.9rem",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {amountLabel ? amountLabel : `+${amount ?? 0}`}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
