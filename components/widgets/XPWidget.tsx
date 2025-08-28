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
    amountLabel: "2 XP × minutes",
    hint: "Only on first completion",
  },
  {
    id: "readDoc",
    label: "Reading a lecture document",
    amountLabel: "2 XP × pageCount",
    hint: "Only on first completion",
  },
  {
    id: "quiz",
    label: "Completing a quiz",
    amountLabel: "2 XP × questionCount",
  },
  {
    id: "flashcards",
    label: "Completing a flashcard set",
    amountLabel: "2 XP × flashcardCount",
  },
  { id: "assignment", label: "Completing an assignment", amount: 80 },
  { id: "achievement", label: "Earning an achievement", amount: 30 },
  { id: "forum", label: "Posting in the forum", amount: 20 },
  {
    id: "answerAccepted",
    label: "Getting an answer accepted in the forum",
    amount: 80,
  },
  {
    id: "chapterRequired",
    label: "Completing a chapter’s required contents",
    amount: 200,
  },
  {
    id: "chapterOptional",
    label: "Completing a chapter’s optional contents",
    amount: 100,
  },
  { id: "courseComplete", label: "Completing a course", amount: 500 },
];

export default function XPWidget() {
  const currentXP = 240;
  const requiredXP = 500;
  const progress = (currentXP / requiredXP) * 100;
  const level = 3;

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 1,
        mb: 4,
        maxWidth: 450,
        backgroundColor: "background.paper",
        maxHeight: 400,
        minHeight: 400,
        overflowY: "hidden",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            textTransform: "none",
            fontSize: "0.985rem",
          }}
        >
          XP Allocation
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, fontSize: "0.98rem", mr: 1 }}
          >
            Level {level}
          </Typography>
          <Box sx={{ flexGrow: 1, mr: 1, minWidth: 150 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
          <Typography
            variant="caption"
            sx={{ minWidth: 50, fontSize: "0.98rem", lineHeight: 1.1 }}
          >
            {currentXP} / {requiredXP}
          </Typography>
        </Box>
      </Box>

      <Table size="small" sx={{ "& th, & td": { border: 0, py: 0.15 } }}>
        <TableHead>
          <TableRow
            sx={{
              height: "auto",
              py: 0.2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <TableCell
              sx={{
                fontWeight: 700,
                pl: 0,
                fontSize: "0.98rem",
                py: 0.2,
                whiteSpace: "nowrap",
              }}
            >
              <Typography
                sx={{
                  lineHeight: 1.1,
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Action
              </Typography>
            </TableCell>
            <TableCell
              sx={{ fontSize: "0.98rem", py: 0.2, whiteSpace: "nowrap" }}
            ></TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 700,
                pr: 0,
                fontSize: "0.98rem",
                py: 0.2,
                whiteSpace: "nowrap",
              }}
            >
              <Typography
                sx={{
                  lineHeight: 1.1,
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                XP
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {XP_SOURCES.map(({ id, label, amountLabel, amount, hint }) => (
            <TableRow
              key={id}
              sx={{
                height: "auto",
                py: 0.2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <TableCell
                sx={{
                  pl: 0,
                  fontSize: "0.98rem",
                  py: 0.2,
                  whiteSpace: "nowrap",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    lineHeight: 1.1,
                    fontSize: "0.98rem",
                    whiteSpace: "nowrap",
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
                      fontSize: "0.7rem",
                      lineHeight: 1.0,
                      p: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hint}
                  </Typography>
                )}
              </TableCell>
              <TableCell
                sx={{ fontSize: "0.98rem", py: 0.2, whiteSpace: "nowrap" }}
              ></TableCell>
              <TableCell
                align="right"
                sx={{
                  pr: 0,
                  fontSize: "0.98rem",
                  py: 0.2,
                  whiteSpace: "nowrap",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontSize: "0.98rem",
                    whiteSpace: "nowrap",
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
