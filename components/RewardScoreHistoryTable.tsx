import { RewardScoreHistoryTableFragment$key } from "@/__generated__/RewardScoreHistoryTableFragment.graphql";
import {
  RewardChangeReason,
  RewardScoreHistoryTableScoreFragment$data,
  RewardScoreHistoryTableScoreFragment$key,
} from "@/__generated__/RewardScoreHistoryTableScoreFragment.graphql";
import {
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import lodash from "lodash";
import { graphql, useFragment } from "react-relay";
import { FitnessIcon, GrowthIcon, HealthIcon, PowerIcon } from "./RewardScores";
import { ContentLink, DeletedContent } from "./Content";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useCallback, useState } from "react";

const reasons: { [k in RewardChangeReason]?: string } = {
  CONTENT_DONE: "Content done",
  CONTENT_REVIEWED: "Content reviewed",
  CONTENT_DUE_FOR_LEARNING: "Content due for learning",
  CONTENT_DUE_FOR_REPETITION: "Content due for repetition",
  COMPOSITE_VALUE: "Scores changed",
};

export type RewardScoreFilterType = "health" | "fitness" | "growth" | "power";

export function RewardScoreHistoryTable({
  _scores,
  filter = [],
}: {
  _scores: RewardScoreHistoryTableFragment$key;
  filter?: RewardScoreFilterType[];
}) {
  const scores = useFragment(
    graphql`
      fragment RewardScoreHistoryTableFragment on RewardScores {
        health {
          ...RewardScoreHistoryTableScoreFragment
        }
        fitness {
          ...RewardScoreHistoryTableScoreFragment
        }
        growth {
          ...RewardScoreHistoryTableScoreFragment
        }
        power {
          ...RewardScoreHistoryTableScoreFragment
        }
      }
    `,
    _scores
  );

  const healthData = useRewardScoreData(scores.health).map((e) => ({
    ...e,
    label: "Health",
    className: "text-red-500",
    icon: <HealthIcon />,
  }));
  const fitnessData = useRewardScoreData(scores.fitness).map((e) => ({
    ...e,
    label: "Fitness",
    className: "text-blue-500",
    icon: <FitnessIcon />,
  }));
  const growthData = useRewardScoreData(scores.growth).map((e) => ({
    ...e,
    label: "Growth",
    className: "text-green-500",
    icon: <GrowthIcon />,
  }));
  const powerData = useRewardScoreData(scores.power).map((e) => ({
    ...e,
    label: "Power",
    className: "text-amber-400",
    icon: <PowerIcon />,
  }));

  const data = lodash.orderBy(
    [
      ...(filter.includes("health") ? healthData : []),
      ...(filter.includes("fitness") ? fitnessData : []),
      ...(filter.includes("growth") ? growthData : []),
      ...(filter.includes("power") ? powerData : []),
    ],
    (e) => e.date,
    "desc"
  );

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggleExpanded = useCallback(
    (i: number) => {
      setExpanded((expanded) => {
        let new_value = new Set(expanded);
        if (new_value.has(i)) {
          new_value.delete(i);
        } else {
          new_value.add(i);
        }
        return new_value;
      });
    },
    [setExpanded]
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Affected score</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Change</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Associated contents</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((entry, i) => (
            <TableRow key={`row-${i}`}>
              <TableCell>
                <div className={`flex items-center gap-4 ${entry.className}`}>
                  {entry.icon}
                  {entry.label}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-gray-500">
                  {dayjs(entry.date).format("H:mm")}
                </div>
                <div>{dayjs(entry.date).format("D. MMMM YYYY")}</div>
              </TableCell>
              <TableCell>
                <span
                  className={
                    entry.difference < 0 ? "text-red-700" : "text-green-700"
                  }
                >
                  {entry.difference}
                </span>
              </TableCell>
              <TableCell>{reasons[entry.reason]}</TableCell>
              <TableCell>
                <Collapse
                  in={
                    entry.associatedContents.length == 1 ||
                    (entry.associatedContents.length > 1 && expanded.has(i))
                  }
                >
                  <div className="flex flex-col gap-3">
                    {entry.associatedContents.map((content, j) => (
                      <div key={`row-${i}-content-${j}`}>
                        {content ? (
                          <ContentLink _content={content} />
                        ) : (
                          <DeletedContent />
                        )}
                      </div>
                    ))}
                  </div>
                </Collapse>
                {entry.associatedContents.length > 1 && (
                  <Button
                    size="small"
                    onClick={() => toggleExpanded(i)}
                    startIcon={
                      expanded.has(i) ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )
                    }
                    aria-label="show associated contents"
                    className={expanded.has(i) ? "!mt-4" : ""}
                  >
                    {expanded.has(i) ? "Hide" : "Show"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function useRewardScoreData(
  _score: RewardScoreHistoryTableScoreFragment$key
): RewardScoreHistoryTableScoreFragment$data["log"] {
  const score = useFragment(
    graphql`
      fragment RewardScoreHistoryTableScoreFragment on RewardScore {
        log {
          date
          difference
          reason
          associatedContents {
            id
            ...ContentLinkFragment
          }
        }
      }
    `,
    _score
  );

  return score.log;
}
